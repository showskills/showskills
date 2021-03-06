import { db } from '../../lib/firebase.prod';
import React, { useEffect, useState } from 'react';
import { Carousel, Container, Row, Col, Button } from 'react-bootstrap';
import './profilePage.css';
import { Link, Redirect, useHistory } from "react-router-dom";
import useAuthListener from '../../hooks/use-auth-listener';


import MessageModal from '../../Container/MessageModal';
const {v4:uuidv4}=require('uuid');

const ProfileDescription = (props) => {
   const [profiledata, setprofileData] = useState({});
   const [gigdata, setgigData] = useState({});
   const [skills, setSkills] = useState([]);
   const [Reviews, setReviews] = useState({});
   const currentUser = useAuthListener().user;
   const projectid=uuidv4();
   // arrays to how user reviews
   const [getReview, setReview] = useState([]);
   const [getRating, setRating] = useState([]);
   const [reviewUsername, setUsername] = useState([]);
   const [recipientUid, setrecipientUid] = useState("");
   const [uid, setuid] = useState(props.location.state.uid);
   const history = useHistory();

   const profiledb = async () => {
      //  // uid of freelancer whose profile
      // i am viewing

      await db.collection('freelancer-profile').doc(uid).get().
         then(doc => {
            if (doc.exists) {
               var array = [];

               doc.data()['Skills'].map(skill => {
                  array.push(skill.skillName);

               })
               setSkills(array);

               setprofileData(doc.data());
            }

         })
   }

   const gigdb = () => {

      db.collection('Gig-Data').doc(uid).get().
         then(doc => {
            setgigData(doc.data());
         })
   }

   const reviewdb = () => {
      console.log('jcb kcb');

      db.collection("Reviews").doc(uid).get().
         then(doc => {
            if (doc.exists) {
               if (doc.data()) {
                  setReviews(doc.data());
               }
            }

         });

   }
   const getreviewdb = () => {
      db.collection('Reviews').doc(uid)
         .collection('CustomerReviews').get().then(docs => {

            var showRatings = [];
            var showReviews = [];
            var username = [];
            var count = 0;
            docs.forEach(doc => {
               console.log(showReviews);
               const data = doc.data();

               count += 1;
               if (count < 5) {
                  username.push(data.FromUser);
                  showRatings.push(data.Rating);
                  showReviews.push(data.Review);
               }
            })
            setReview(showReviews);
            setRating(showRatings);
            setUsername(username);
         })
   }

   useEffect(() => {
      setuid(props.location.state.uid);
   }, [props.location.state.uid])
   useEffect(() => {
      gigdb();
   }, []);

   useEffect(() => {
      profiledb();
   }, []);

   useEffect(() => {
      reviewdb();
   }, []);

   useEffect(() => {
      getreviewdb();
   }, []);

   useEffect(() => {
      setrecipientUid(uid);
   }, [])

   console.log(recipientUid);

   return (<>

      <div className='ProfileDescContainer'>
         <Container>
            <Row>
               <Col>

                  <div>

                     <h className="heading12">{gigdata['Title']}</h><br />
                  
                     <div className="box39">
                        {/* <span><img className="pic11" src={profiledata['ProfilePhotoUrl']} /></span> */}
                        <span>{profiledata['Username']}</span>&nbsp;
                    {Reviews.AverageRating ? <div>{[...Array(Reviews.AverageRating)].map((e, i) => <span className="material-icons" key={i} style={{ color: '#FFBE5B' }}>star</span>)}
                           <span className="staryell">{Reviews['AverageRating']}({Reviews['NumberOfReviews']})</span></div> : ''}

                     </div>
                  </div>
                  <br />

               </Col>
               <Col>
               <img className="gigpic34" src={gigdata['PhotoURL']} /><br />
               </Col>
            </Row>

            <Row>
               <Col>
                 

                  <h1>About the Gig</h1>
                  <p>{gigdata['Description']}</p><br></br>
                  <p> I like to work on {gigdata['Category']}&nbsp; projects</p>
                  <p>&nbsp;&#10004; Expertise in {gigdata['SubCategory']}</p>
                  <p>Starting from Rs. {gigdata['Price']}</p>
                  <p>{gigdata['Duration']} Delivery</p><br></br>
                  <p>Instructions for the User:<br /> {gigdata['Instructions']}</p>
               </Col>
            </Row>
            <br /><br />

            <Row>
               <Col>
                  <h1>About the Seller </h1>

                  {Object.keys(profiledata).length>0?<div className="box12">
                     {/* <img className="userpic2" src={profiledata['ProfilePhotoUrl']} /> */}

                     <div className="box123">
                        <p>{profiledata['Username']} </p>
                        <p>{profiledata['Description']}</p>
                        <div className="box12">
                           {Reviews.AverageRating ? [...Array(Reviews.AverageRating)].map((e, i) => <span className="material-icons" key={i} style={{ color: '#FFBE5B' }}>star</span>) : ''}
                           {Reviews.AverageRating ? <p className="staryell">{Reviews['AverageRating']}({Reviews['NumberOfReviews']})</p> : ''}

                        </div>
                        <MessageModal recipient={uid} />
                     </div>
                  </div>
                        :<div>
                           <div style={{margin:'20px 0',fontSize:'20px'}}>No Info</div>
                           <MessageModal recipient={uid} />  
                        </div>}
                  <br />

                  <div className="box1234">
                     <h1>Proffesional in :</h1>

                    {Object.keys(skills).length>0?skills.map((skill, i) =>
                        <span className="box39">
                           <span className="material-icons" key={i} style={{ color: 'brown' }}>done</span>
                           <span id="print2">{skill}</span>
                        </span>
                     )
                     :<div style={{margin:'20px 0',fontSize:'20px'}}>No Info</div>}
                  </div>
               </Col>
            </Row>
         </Container>

      </div>
      <div className="heading123">What people loved about this Seller</div>

      {Reviews.NumberOfReviews > 0 ? <Carousel>
         {[...Array(4)].map((e, i) =>
            <Carousel.Item interval={5000}>

               <div
                  className="imgc"
               ></div>

               <Carousel.Caption>
                  <p className="rating78"> {reviewUsername[i]} &#x2605; {getRating[i]} </p>
                  <p className="review78">
                  {
                     getReview[i]? 
                     
                     getReview[i].length>200?
                    <p>{getReview[i].substring(0,200)} .....</p>
                     :<p> {getReview[i]}</p>

                     :''
                  
                  }

                  </p>

                  <div className="link34" onClick={
                    ()=>{
                       history.push({pathname:'/userReviews',state:{uid:uid}})
                    }
                  }>more...</div>
               </Carousel.Caption>
            </Carousel.Item>
         )}


      </Carousel> : <div style={{margin:'20px 0',fontSize:'20px'}}>No Reviews available</div>}
      <br></br>
   </>
   );
};

export default ProfileDescription;