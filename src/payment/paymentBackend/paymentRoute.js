require('dotenv').config()
const formidable = require('formidable')
const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const https = require('https')
const firebase = require('firebase')
const PaytmChecksum = require('./PaytmChecksum')
const db = require('./firebase')
var flash = require('connect-flash');





router.post('/callback', (req, res) => {

   
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, file) => {
        console.log("++++++++++++++++++++++++")
        console.log(req.flash('aman'))
        // console.log(fields)
       const uid=fields.ORDERID.slice(0,-20);
       console.log(uid)
    
       var  paytmChecksum = fields.CHECKSUMHASH;
        delete fields.CHECKSUMHASH;
         
        var isVerifySignature = PaytmChecksum.verifySignature(fields, process.env.REACT_APP_PAYTM_MERCHANT_KEY, paytmChecksum);
        if (isVerifySignature) {


            var paytmParams = {};
            paytmParams["MID"] = fields.MID;
            paytmParams["ORDERID"] = fields.ORDERID;

            /*
            * Generate checksum by parameters we have
            * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
            */

            PaytmChecksum.generateSignature(paytmParams, process.env.REACT_APP_PAYTM_MERCHANT_KEY).then(function (checksum) {

                paytmParams["CHECKSUMHASH"] = checksum;

                var post_data = JSON.stringify(paytmParams);

                var options = {

                    /* for Staging */
                    hostname: 'securegw-stage.paytm.in',

                    /* for Production */
                    // hostname: 'securegw.paytm.in',

                    port: 443,
                    path: '/order/status',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': post_data.length
                    }
                };

                var response = "";
                var post_req = https.request(options, function (post_res) {
                    post_res.on('data', function (chunk) {
                        response += chunk;
                    });

                    post_res.on('end', function () {
                        let result = JSON.parse(response)
                        console.log(result);
                        if (result.STATUS === 'TXN_SUCCESS') {
                            //store in db
                     const  ref= db.collection('Transactions').doc(fields.TXNID);
                            ref.set(result)
                            .then(() => console.log("Update success"))
                            .catch(() => console.log("Unable to update"))
                        }
                        db.collection('Invoices')

                        res.redirect(`http://localhost:3000/status/${result.ORDERID}`)

                    });
                });

                post_req.write(post_data);
                post_req.end();
            });


        } else {
            console.log("Checksum Mismatched");
        }


    })

})

router.post('/payment', (req, res) => {
  
    req.flash('aman','lohan');
    const { amount, email,uid } = req.body;
    console.log(amount, email,uid)
    
    /* import checksum generation utility */
    const totalAmount = JSON.stringify(amount);
    var params = {};
       
    /* initialize an array */
        params['MID'] = process.env.REACT_APP_PAYTM_MID;
        params['WEBSITE'] = process.env.REACT_APP_PAYTM_WEBSITE;
        params['CHANNEL_ID'] = process.env.REACT_APP_PAYTM_CHANNEL_ID;
        params['INDUSTRY_TYPE_ID'] = process.env.REACT_APP_PAYTM_INDUSTRY_TYPE_ID;
        params['ORDER_ID'] =uid+uuidv4().slice(0,-16);
        params['CUST_ID'] = uid;
        params['TXN_AMOUNT'] = totalAmount;
        params['CALLBACK_URL'] = 'http://localhost:5000/api/callback';
        // params['EMAIL'] = email;
        params['MOBILE_NO'] = '7777777777'
   
    /**
    * Generate checksum by parameters we have
    * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
    */
   console.log(params)

    var paytmChecksum = PaytmChecksum.generateSignature(params, process.env.REACT_APP_PAYTM_MERCHANT_KEY);
    paytmChecksum.then(function (checksum) {
      console.log('++++++')
        let paytmParams = {
            ...params,
            "CHECKSUMHASH": checksum
        }
        console.log('checksum= ', paytmParams);
        res.json(paytmParams);
        
    }).catch(function (error) {
        
        console.log(error);
    });

})

module.exports = router