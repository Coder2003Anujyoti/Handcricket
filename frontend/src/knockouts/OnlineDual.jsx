import React,{useState,useEffect,useRef} from "react";
import {HashLink} from 'react-router-hash-link'
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {socket} from "../socket/socket"
const OnlineDual = () => {
const [searchParams] = useSearchParams();
const [load,setLoad]=useState(true)
const [text,setText]=useState("")
const [msg,setMsg]=useState("")
const [start,setStart]=useState(false)
const [data,setData]=useState([])
const [opt,setOpt]=useState(0)
const [imp,setImp]=useState("")
const [disable,setDisable]=useState(false)
const buttons=[1,2,3,4,5,6]
const inactivityTimeout = useRef(null);
const countdownInterval = useRef(null);
const [timer, setTimer] = useState(20);
const teamicons=[{team:"Csk",image:"online/Gaikwad.webp"},{team:"Dc",image:"online/Pant.webp"},{team:"Kkr",image:"online/S.Iyer.webp"},{team:"Mi",image:"online/Hardik.webp"},{team:"Rr",image:"online/Samson.webp"},{team:"Gt",image:"online/Gill.webp"},{team:"Pbks",image:"online/Dhawan.webp"},{team:"Rcb",image:"online/Duplesis.webp"},{team:"Srh",image:"online/Cummins.webp"},{team:"Lsg",image:"online/KL Rahul.webp"}]
const id = searchParams.get("id");
const admin=searchParams.get("player");
const adminteam=searchParams.get("playerteam");
const idteam = searchParams.get("computerteam");
const matchID = searchParams.get("matchID")
useEffect(()=>{
  setTimeout(()=>{
    setLoad(false)
  },3000)
},[])
useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const triggerInactivity = () => {
    setImp('Connection issues...');
    socket.disconnect()
  };
  const resetInactivityTimer = () => {
  if (!start || data.game.result !== "") return;
  if (inactivityTimeout.current) {
  clearTimeout(inactivityTimeout.current);
  }
  if (countdownInterval.current) {
  clearInterval(countdownInterval.current);
}
  inactivityTimeout.current = setTimeout(triggerInactivity,20000);
  setTimer(20);
  countdownInterval.current = setInterval(() => {
    setTimer(prev => {
      if (prev <= 1) {
        clearInterval(countdownInterval.current);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};
useEffect(()=>{
   window.scrollTo({ top: 0, behavior: "smooth" });
 },[])
  useEffect(() => {
    socket.on('dualwait', (message) => {
    setMsg(message);
  });

  socket.on('dualstartGame', (message) => {
    setStart(true);
    setMsg("")
    setData(message);
  });
  socket.on('dualchoiceturn',(ms)=>{
    if(ms=="Your Turn"){
    setMsg(ms)
    setOpt(0)
    resetInactivityTimer();
    }
    else{
      setMsg(ms)
      clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
    setTimer(0)
    }
  })
  socket.on('dualmakescore',(mesg)=>{
  if(mesg.game.result!=''){
  clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
  }
    setData(mesg)
  })
  socket.on('dualLeft',(mseg)=>{
  clearInterval(countdownInterval.current);
  clearTimeout(inactivityTimeout.current);
    setImp(mseg)
  
  })
  return () => {
    socket.off('dualwait')
    socket.off('dualLeft')
    socket.disconnect()// Clean up
    clearInterval(countdownInterval.current);
    clearTimeout(inactivityTimeout.current);
  };
}, []);
useEffect(() => {
  if (start==true && data.game.result === "" && msg === "Your Turn") {
    resetInactivityTimer();
  }
}, [start, msg]);
useEffect(() => {
  if (!socket.connected) {
    socket.connect();
  }
}, []);
const add_Name=(i,it)=>{
  if (disable==false) {
  socket.emit('dualjoinRoom', {name:id,team:i,player:it,matchID});
    setDisable(true)
    }
}
const optio=(i)=>{
  if(opt==0){
   socket.emit('dualgomove',i)
  clearInterval(countdownInterval.current);
  clearTimeout(inactivityTimeout.current);
  setOpt(i)
  }
}

  return (
  <>
       {load == true && <>
    <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center z-50 overflow-hidden">
      {/* Moving spotlights */}
      <motion.div
        className="absolute w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Lightning flash */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          repeat: Infinity,
          duration: 0.2,
          repeatDelay: 1.7
        }}
      />

      {/* Spark particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth - window.innerWidth / 2,
            y: Math.random() * window.innerHeight - window.innerHeight / 2,
            opacity: 0
          }}
          animate={{
            y: [null, (Math.random() - 0.5) * 200],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            delay: Math.random() * 2,
            repeat: Infinity
          }}
        />
      ))}

      {/* Logos + V/S */}
      <div className="flex flex-col items-center gap-6 sm:gap-10 z-10">
        <motion.img
         src={`Logos/${adminteam}.webp`}
          className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 drop-shadow-[0_0_20px_gold]"
          initial={{ x: -300, opacity: 0, rotate: -30 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 1 }}
        />
        <motion.span
          className="text-2xl sm:text-2xl md:text-3xl font-bold text-white glow"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          V/S
        </motion.span>
        <motion.img
          src={`Logos/${idteam}.webp`} 
          className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 drop-shadow-[0_0_20px_skyblue]"
          initial={{ x: 300, opacity: 0, rotate: 30 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  </>}
  { load==false && <>
{ start===false && imp=='' && <>
{ msg=='' && 
<>
 <div className="flex flex-col ml-2 mr-2 gap-4 my-4 justify-center items-center lg:px-20 md:justify-center md:items-center md:py-3 lg:ml-16 lg:gap-10 lg:items-center lg:justify-center lg:flex-row lg:flex-wrap">
    <div className="flex flex-col rounded-md flex-wrap lg:w-96 lg:h-90 md:w-96 md:h-84">
 <div className="w-full mt-2 flex flex-row">
 <div className="w-2/5 ml-2 gap-1 flex flex-col items-center justify-center">
 <img src={teamicons.filter((it)=>it.team==adminteam)[0].image} className="w-auto h-auto" />
  <img src={`Logos/${adminteam}.webp`} className="w-12 h-12"/>
 </div>
  <div className="w-1/5 ml-2 mr-2 flex flex-col items-center justify-center">
<h1 className="text-base text-white font-bold">V/S</h1>
 </div>
 <div className="w-2/5 gap-1 mr-2 flex flex-col items-center justify-center">
 <img src={teamicons.filter((it)=>it.team==idteam)[0].image} className="w-auto h-auto" />
  <img src={`Logos/${idteam}.webp`} className="w-12 h-12"/>
 </div>
    </div>
    </div>
</div>
{
  id==admin && <>
  <div className="w-full items-center flex  flex-col justify-center">
  <img src={teamicons.filter((i)=>i.team==adminteam)[0].image} className="w-36 h-36"/>
    <img src={`Logos/${adminteam}.webp`} className="w-12 h-12 my-2" />
<button onClick={()=>add_Name(adminteam,teamicons.filter((i)=>i.team==adminteam)[0].image)} className="bg-slate-800 my-12 text-white text-base px-6 py-2 font-bold rounded-md shadow-md"> Play Game</button>
  </div>
  </>
}
{
  id!=admin && <>
  <div className="w-full flex flex-col items-center justify-center">
  <img src={teamicons.filter((i)=>i.team==idteam)[0].image} className="w-36 h-36"/>
    <img src={`Logos/${idteam}.webp`} className="w-12 h-12 my-2" />
    <button onClick={()=>add_Name(idteam,teamicons.filter((i)=>i.team==idteam)[0].image)} className="bg-slate-800 text-white text-base px-6 py-2 my-12 font-bold rounded-md shadow-md"> Play Game</button>
  </div>
  </>
}
</>
}
{ msg!="" &&
<div className="my-44 text-center text-white font-bold">
<h1>{msg}</h1>
</div>
}
</>
}
{
  start==true && imp==''  && <>
  <div className="w-full my-4 font-bold text-center">
{ msg=="Your Turn" && data.game.result=='' && <h2 className="text-center font-bold text-white">
  You have {timer} seconds to choose!
</h2>}
{ data.game.result=="" && <h1 className="font-bold text-white text-center my-2">{data.game.turn} start to Bat </h1>}
<div className="w-full flex justify-center flex-wrap gap-6 my-6">
  {data.players.map((i, idx) => (
    <div key={idx} className="flex w-40 h-72 flex-col items-center bg-black rounded-lg p-4 transition duration-300 ease-in-out transform hover:scale-105">
      <h1 className="text-slate-400 text-lg font-bold mb-2">{i.team.toUpperCase()}</h1>
      <img src={i.player} className="w-auto h-auto" />
      <p className="my-4 text-xs font-bold text-slate-400">{i.name}</p>
      <div className=" bg-black rounded-b-sm px-4 py-2">
        <p className="text-slate-400 text-xl font-bold">{i.choice}</p>
      </div>
    </div>
  ))}
</div>
{ data.game.result=='' && <h1 className="text-center font-bold text-white">{msg}</h1>}
{ msg=="Your Turn" && data.game.result=='' && opt==0 &&
    <div className="flex flex-row flex-wrap justify-center py-6 gap-4">
      {buttons.map((i)=>{
        return(<>
          <div className="px-4 py-4 rounded-full bg-slate-800" onClick={()=>optio(i)}>
            <button className="text-xl text-slate-400 font-bold">{i}</button>
          </div>
        </>)
      })}
    </div>
    }
  {
    msg=="Opposition Turn" && data.game.result=="" &&  opt!=0 &&
    <>
    <h1 className="font-bold text-center text-white my-4">You choose {opt} </h1>
    </>
  }
  { data.game.result=='' &&
  <>
    <div className="w-full flex justify-center flex-col items-center font-bold">
    <div className="w-full flex justify-center flex items-center font-bold">
    {
      data.players.map((i)=>{
        if(i.name==data.game.turn){
          return(<>
     <img src={`Logos/${i.team}.webp`} className="w-20 h-20" />
      <h1 className="text-white text-center font-bold">{data.game.turn} score-: {data.game.scores[data.game.turn]} run(s)</h1>
          </>)
        }
      })
    }
    </div>
    {data.game.innings==2 &&  <h1 className="my-2 text-white text-center font-bold">Target is {data.game.target} run(s)</h1>}
    </div>
</>  }
  {
    data.game.result!='' && 
        <div className="text-center flex flex-col gap-1 justify-center items-center text-white font-bold my-6">
        <img src="Icons/trophy.webp" className=" w-10 h-10"/>
    <h1>{data.game.result}</h1>
    {
      Object.entries(data.game.scores).map(([key,value])=>{
        return(<>
    <div className="flex text-center justify-center items-center gap-2">
  {
    data.players[0].name==key ?       <img src={`Logos/${data.players[0].team}.webp`} className="w-12 h-12 rounded-md" />
    : <img src={`Logos/${data.players[1].team}.webp`} className="w-12 h-12 rounded-md" />
  }
     <h1>{key} scored-: {value} run(s)</h1>
     </div>
        </>)
      })
    }
 {data.game.result == "Match is tied" && 
     <button className="w-28 py-2 my-6 px-2 flex justify-center items-center bg-slate-800 text-white rounded-md font-bold" onClick={()=>window.location.reload()}>Restart</button>
 }
     </div>
  }
    </div>

  </>
    }
{
  imp!='' && 
    <div className="text-center flex flex-col gap-4 justify-center items-center font-bold my-44 text-white font-bold">
    <h1>{imp}</h1>
     <button className="w-28 py-2 my-6 px-2 flex justify-center items-center bg-slate-800 text-white rounded-md font-bold" onClick={()=>window.location.reload()}>Restart</button>
    </div>
}
</>
}
</>
  );
};


export default OnlineDual;