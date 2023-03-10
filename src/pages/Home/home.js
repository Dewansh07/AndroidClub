import Navbar from "../../components/Navbar/Navbar"
import { useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseconfig";
import { collection, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { getDocs, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { Authcontext } from "../../contextProvider";
import "./home.css";
import homeBg from "../../images/home-bg.png"

function Home() {
    const [Event, setEvent] = useState([])
    const [Ev, setEv] = useState({})
    const [vis, setVis] = useState("hidden")
    const { currentUser } = useContext(Authcontext)
    const [UserDetails, setDetails] = useState({})
    const [userEvents, setUserEvents] = useState([])
    // const [RgSt,setSt] = useState(false)

    const eventsRef = collection(db, "events");
    const usersRef = collection(db, "users");


    const FetchEvents = async () => {
        const q = query(eventsRef)
        const temp = []
        const querySnapShot = await getDocs(q)
        try {
            querySnapShot.forEach((doc) => {
                temp.push(doc.data())
            })
            setEvent(temp)
        } catch (err) {
            console.log(err)
        }
    }


    const FetchUserDetails = async () => {
        const q = query(usersRef, where('email', '==', currentUser.email))
        const temp = []
        const querySnapShot = await getDocs(q)
        try {
            querySnapShot.forEach((doc) => {
                temp.push(doc.data())
            })
            setDetails({ email: temp[0].email, name: `${temp[0].name}`, paymentVerified: "N", phone: `${temp[0].phone}`, regNo: `${temp[0].regNo}` })
            setUserEvents(temp[0].allRegisteredEvents)
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        FetchEvents()
        FetchUserDetails()
    }, [])


    // for testing use only 

    useEffect(() => {
        console.log(Ev)
    }, [Ev])


    const HandleRegister = async (EventName) => {
        setVis("visible")
        const q = query(eventsRef, where("notificationGroup", "==", `${EventName}`))
        const querySnapShot = await getDocs(q)
        const temp = []
        try {
            querySnapShot.forEach((doc) => {
                temp.push(doc.data())
            })
            setEv(temp)
            console.log(temp)
            let RegEmails = temp[0]["Registered Emails"]
            RegEmails = [...RegEmails, `${currentUser.email}`]
            let RegInfo = temp[0]["Registered Users"]
            RegInfo = [...RegInfo, UserDetails]

            let UserEvents = userEvents
            UserEvents = [...UserEvents, temp[0]]
            await updateDoc(doc(db, "users", currentUser.uid), {
                allRegisteredEvents: UserEvents
            })

            await updateDoc(doc(db, "events", Ev[0].notificationGroup), {
                "Registered Emails": RegEmails,
                "Registered Users": RegInfo,
            })
        } catch (err) {
            console.log(err)
        }
    }
    return (
        <div className="Home">
            {/* <PopUpWindow style={{visibility:`${vis}`}}/> */}
            {
                !currentUser &&
                <div className="PopUpWindow" onClick={() => { setVis("hidden") }} style={{ visibility: `${vis}` }}>
                    <div className="PopUpForm">
                        <p>Hey Learner!! <br></br>Login In or Register to Access all features.</p>
                        <Link id='New' to='../login'>Login</Link>
                        <Link id='New' to='../Register'>Register</Link>
                        <input className="CancelBtn" type='button' onClick={() => { setVis("hidden") }} value='Close'></input>
                    </div>
                </div>
            }

            <Navbar />
            <h1 className="first-heading">Welcome to <br /> Android club VIT Bhopal </h1> <br />
            <div className="club-intro">
                <p>We at Android Club are driven to achieve excellence and solve problems while at it. Dedicated to educating and creating awareness about modern Mobile App development, we host workshops, hackathons, webinars, and all possible events under the sun, that help us build an inclusive community of like-minded people who explore and learn together. So, wear your thinking caps, put on some creativity, and let's develop some amazing apps!</p>
                <div className="home-bg-div">
                {/* <img src={homeBg} className="home-bg-img" alt="" /> */}
                </div>
            </div>
            <div className="upcoming-events">
                <p className='upcoming-events-heading'>All Upcoming Events</p>
                {/* <p className='upcoming-events-heading'>Events</p> */}
                <div className="upcoming-events-container">
                    {
                        Event.map((Events) => {
                            if (Events.completion === false) {
                                return (
                                    <div className="upcoming-event-block" onClick={() => { setVis("visible") }} style={{ backgroundImage: `url(${Events.bannerURL})` }}>
                                        <div className="upcoming-event-info">
                                            <div className="upcoming-event-name">{Events.name}</div> <br />
                                            <p className="upcoming-event-mode" >Mode : {Events.location}</p>
                                            <p className="description">Details : {Events.description}</p>
                                            <p className="upcoming-event-time">Time : {Events.time}</p>
                                            <p className="upcomin-event-price">Price : ₹{Events.price}</p>
                                        </div>
                                        {
                                            currentUser &&
                                            // <button className="RegisterBtn" onClick={() => { HandleRegister(Events.notificationGroup) }}><span type='text'>Register</span></button>
                                            <button className="RegisterBtn" onClick={() => { HandleRegister(Events.notificationGroup) }}>Register</button>
                                        }
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
            <div className="completed-events">
                <p className='completed-events-heading'>Completed Events</p>
                <div className="completed-events-container">
                    {
                        Event.map((Events) => {
                            if (Events.completion === true) {
                                return (
                                    <div className="completed-event-block" onClick={() => { setVis("visible") }} style={{ backgroundImage: `url(${Events.bannerURL})` }}>
                                        <div className="completed-event-info">
                                            <div className="completed-event-name">{Events.name}</div>
                                            <p className="description">{Events.description}</p>
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
        </div>
    )
}
export default Home