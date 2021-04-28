import { useEffect, useState } from "react";
import useAuthListener from "../hooks/use-auth-listener";

const Payment = (props) => {

  const uid=useAuthListener().user.uid;
  const [recipientUid, setrecipientUid]=useState(props.location.state.uid);
  const [amount,setAmount]=useState(props.location.state.amount);
   useEffect(()=>{
        setrecipientUid(props.location.state.uid);
        setAmount(props.location.state.amount);
   },[props.location.state])

    function isDate(val) {
        // Cross realm comptatible
        return Object.prototype.toString.call(val) === '[object Date]'
      }
      
      function isObj(val) {
        return typeof val === 'object'
      }
      
       function stringifyValue(val) {
        if (isObj(val) && !isDate(val)) {
          return JSON.stringify(val)
        } else {
          return val
        }
      }
      
      function buildForm({ action, params }) {
        const form = document.createElement('form')
        form.setAttribute('method', 'post')
        form.setAttribute('action', action)
      
        Object.keys(params).forEach(key => {
          const input = document.createElement('input')
          input.setAttribute('type', 'hidden')
          input.setAttribute('name', key)
          input.setAttribute('value', stringifyValue(params[key]))
          form.appendChild(input)
        })
      
        return form
      }
      
       function post(details) {
        const form = buildForm(details)
        document.body.appendChild(form)
        form.submit()
        form.remove()
      }
    
  const getData=(data)=>
  {

    return fetch(`http://localhost:5000/api/payment`,{
        method:"POST",
        headers:{
            Accept:"application/json",
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    }).then(response=>response.json()).catch(err=>console.log(err))
  }



    const makePayment=()=>
    { 
getData({amount:Number(amount),email:'abc@gmail.com',uid:uid,recipientUid:recipientUid}).then(response=>{
    //  console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%')
    console.log(response);
   
    var information={
        action:"https://securegw-stage.paytm.in/order/process",
        params:response
    }
  post(information)

})
    }
    return (
        <div>
            <button onClick={makePayment}>PAY USING PAYTM</button>
        </div>
    )
}
 
export default Payment;