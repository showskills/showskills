
import React,{ useState,useEffect } from "react";
import  './MessageForm.css';
import {Link} from 'react-router-dom';
import useAuthListener from '../../hooks/use-auth-listener';
import DataHandeling from './DataHandeling';
import AttachMessageFiles from '../AttachMessageFiles';
const {v4:uuidv4}=require('uuid');


const MessageForm=(props)=>{
     
    const [message,setmessage]=useState("");
    const [projectTitle,setTitle]=useState("");
    const [date,setDate]=useState("");
    const [time,setTime]=useState("");
    const currentUser=useAuthListener().user;
    const [recipientUid,setrecipientUid]=useState("");
     const projectid=uuidv4();
     console.log(projectid)

     
    const currentDate =()=>{
     var newDate=new Date();  
     setDate(newDate.toDateString());
     setTime(newDate.toTimeString());
    }

    const submitForm= async(e)=>{   
        e.preventDefault();
        console.log(projectTitle)
const newEntry={message:message,ProjectTitle:projectTitle,recipient:recipientUid,
    sender:currentUser.uid,date:date ,time:time,projectid:projectid};
  await DataHandeling(newEntry);
    }


    useEffect(()=>{
         currentDate()  ;   
    },[])

    useEffect(()=>{
        
        setrecipientUid(props.recipient);
     },[props])
     console.log(recipientUid);


    return(
        <>

            <div>
                <div>
                <div className="dateAndTime">
                <span>{time}</span>
                <span id="time5">{date}</span>
                </div><br/>
                <label className="formHeading12">
                    Give a brief description about your project
                </label>
                <br/>
                <textarea className="Ptitle"
                 type='text' name='title' value={projectTitle}
                 placeholder="Project-Title"
                    onChange={(e)=>setTitle(e.target.value)}
                ></textarea>
                
                <textarea className='gigInputArea'
                  type="text" placeholder="Enter your message here"
                  name="message1"
                  id="message1"

                  autoComplete="off"
                  value={message}
                  onChange={(e) => setmessage(e.target.value)}
                ></textarea>
                <br/>
           
                <AttachMessageFiles recipient={recipientUid}
                 sender={currentUser.uid} projectid={projectid}/>
               
                </div>
                <button type="submit" onClick={submitForm}>Send</button>
            </div>
        </>
    );
}
export default MessageForm;