import React,{useState,useEffect} from "react"
import {useSearchParams}from "react-router-dom"
import {HashLink} from 'react-router-hash-link'
import Confetti from "react-confetti";
import { motion } from "framer-motion";
const Game = () => {
const [searchParams] = useSearchParams();
const [loading,setLoading] = useState(true)
const [val,setVal]=useState([])
const [chart,setChart]=useState([])
const [msg,setMsg]=useState("")
const [mode,setMode]=useState("profile")
const id = searchParams.get("id");       
const name = searchParams.get("name");
const rawTeams = searchParams.get("teams");
const teams = rawTeams ? JSON.parse(decodeURIComponent(rawTeams)) : [];
const teamicons=[{team:"Csk",image:"online/Gaikwad.webp"},{team:"Dc",image:"online/Pant.webp"},{team:"Kkr",image:"online/S.Iyer.webp"},{team:"Mi",image:"online/Hardik.webp"},{team:"Rr",image:"online/Samson.webp"},{team:"Gt",image:"online/Gill.webp"},{team:"Pbks",image:"online/Dhawan.webp"},{team:"Rcb",image:"online/Duplesis.webp"},{team:"Srh",image:"online/Cummins.webp"},{team:"Lsg",image:"online/KL Rahul.webp"}]
useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
const join_room=async()=>{
  if(id.length>0 && name.length>0){
   try {
    const response = await fetch("https://miniature-toma-aliudufu-dfe931ca.koyeb.app/add-knockouts-contestant", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({name:name,id:id}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
if(result?.message){
    setTimeout(()=>{
  setLoading(false)
  setMsg("Room is deleted by admin")
  },3000)
}
else{
  var table=result.contestants.map((i)=>{
      return {team:i.team,
      matches:result.matches.filter((it)=> (it.firstteam.name == i.name || it.secondteam.name== i.name) && it.winner !== "").length,
      win:result.matches.filter((it)=> (it.firstteam.name == i.name || it.secondteam.name == i.name) && it.winner === i.team).length,
      lose:result.matches.filter((it)=> (it.firstteam.name == i.name || it.secondteam.name == i.name) && it.loser === i.team).length
      }
    })
  setTimeout(()=>{
  setLoading(false)
  setVal([result])
  setChart(table)
  },3000)
}
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
}
useEffect(()=>{
  join_room()
  sessionStorage.clear()
},[id,name])
  return (
  <>
    {loading==true && <>
   <div className="fixed inset-0  z-50 flex flex-col items-center justify-center text-white text-center overflow-hidden">
  {/* Confetti */}
 
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={250}
    />
  

  {/* Trophy */}
  <motion.img
    src="Icons/trophy.webp"
    alt="Trophy"
    className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ duration: 2, type: "spring", stiffness: 100 }}
  />

  {/* Title */}
  <motion.h1
    className="text-lg md:text-xl font-bold mt-4 text-yellow-400"
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    Welcome to the Indian Premier League!
  </motion.h1>

  {/* Logos */}
  <div className="flex flex-wrap justify-center gap-4 my-4 max-w-[90vw] overflow-hidden">
    {teams.map((logo, index) => (
      <motion.img
        key={index}
        src={`Logos/${logo}.webp`}
        alt={`Team ${index + 1}`}
        className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, delay: index * 0.2 }}
      />
    ))}
  </div>
</div>
  </>}
{
    loading==false && msg != "" && 
    <>
    <div className="relative w-full bg-slate-800 flex items-center justify-between p-2 md:px-4 md:py-3">
  <img className="w-28 h-16" src={`Icons/Logo.webp`} />
  </div>
    <p className="text-center text-sm lg:text-base my-36 text-white font-bold">{msg}</p>
    </>
}
  {
  val.length >0 && loading==false && <>
   <div className="relative w-full bg-slate-800 flex items-center justify-between p-2 md:px-4 md:py-3">
  <img className="w-28 h-16" src={`Icons/Logo.webp`} />
  </div>
  {mode=="profile" && <p className="text-center text-sm my-2 text-white font-bold p-2">Tournament ID-: {val[0].id}</p>}
  <div className="flex justify-evenly mt-4">
<button onClick={() => {setMode("profile")}}
className={`px-4 py-2 font-bold  ${mode === "profile" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Profile</button>
{ (val[0].winner == "" || val[0].runnerup == "" || val[0].thirdplace == "" ) && <button onClick={() => setMode("play")}
className={`px-4 py-2 font-bold  ${mode === "play" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Play 
  </button> }
 {(val[0].winner == "" || val[0].runnerup == "" || val[0].thirdplace == "" ) && <button onClick={() => setMode("matches")}
className={`px-4 py-2 font-bold  ${mode === "matches" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Schedule
  </button> }
{(val[0].winner !== "" && val[0].runnerup !== "" &&  val[0].thirdplace !== "" ) && <button onClick={() => setMode("result")}
className={`px-4 py-2 font-bold  ${mode === "result" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Result
  </button> } 
  </div>
{mode== "profile" && <>
<div className="w-full flex justify-center items-center">
<div className="w-72 h-52 bg-slate-800 my-4 flex flex-row justify-center items-center rounded-md mt-12 mb-6 lg:w-84 lg:h-90">
{ val[0].matches.filter((it)=> it.firstteam.name == name || it.secondteam.name== name).map((i,ind)=>{
  return(<>
<div key={ind} className="w-1/2 flex flex-col justify-center items-center">
<img src={teamicons.filter((it)=> it.team == (i.firstteam.name==name ? i.firstteam.team : i.secondteam.team))[0].image} className="w-36 h-36" />
<img src={`Logos/${teamicons.filter((it)=> it.team == (i.firstteam.name==name ? i.firstteam.team : i.secondteam.team))[0].team}.webp`} className="w-12 h-12" />
</div>
  </>)
})
}
<div className="flex flex-col justify-center items-center">
<p className="text-center text-sm my-2 text-white font-bold">{name}</p>
  <div className="flex flex-row mt-6 justify-center gap-3 ">
<button onClick={()=>window.location.reload()} className="bg-gray-900 text-white text-base w-24 h-9 font-bold rounded-md shadow-md">Reload</button>
</div>
</div>
</div>
</div>
<div className="max-w-2xl mx-auto p-4 bg-gray-900 text-white">
<p className="text-center text-base font-bold mb-4">Points Table</p>
<table className="w-full border-collapse">
 <thead>
<tr className="border-b border-gray-600 text-gray-400">
<th className="p-2 text-left">#</th>
<th className="p-2 text-left">Team</th>
<th className="p-2">M</th>
<th className="p-2">W</th>
<th className="p-2">L</th>
<th className="p-2">PTS</th>
</tr>
</thead>
<tbody>
{chart.slice().sort((a,b)=> b.win - a.win).map((team, index) => (
<tr key={team.id} className="border-b border-gray-700 text-center font-bold">
<td className="p-2">{index + 1}</td>
<td className="p-2 flex items-center font-bold">
<img src={`Logos/${team.team}.webp`} alt={team.team} className="w-8 h-8 mr-2" />
</td>
<td className="p-2">{team.matches}</td>
<td className="p-2">{team.win}</td>
<td className="p-2">{team.lose}</td>
<td className="p-2">{2*team.win}</td>
</tr>))}
</tbody>
</table>
</div>
</>}
{mode=="play" && <> 
{ val[0].matches.filter((it)=> (it.firstteam.name == name || it.secondteam.name== name) && it.winner=="").length >0 && <>
 <div className="flex flex-col ml-2 mr-2 gap-4 my-16 justify-center items-center">
 {val[0].matches.filter((it)=> it.firstteam.name == name || it.secondteam.name== name).map((i)=>{
    return(<>
    <div className="w-72 h-54 p-2 bg-slate-800 flex flex-col rounded-md flex-wrap lg:w-96 lg:h-90 md:w-96 md:h-84">
<p className="text-center text-sm text-white font-bold">Semi-Final</p>
 <div className="w-full mt-2 flex flex-row">
 <div className="w-2/5 ml-2 gap-1 flex flex-col items-center justify-center">
 <img src={teamicons.filter((it)=> it.team == i.firstteam.team)[0].image} className="w-auto h-auto" />
  <img src={`Logos/${teamicons.filter((it)=> it.team == i.firstteam.team)[0].team}.webp`} className="w-12 h-12"/>
    <h1 className="text-sm text-white font-bold">{i.firstteam.name}</h1>
 </div>
  <div className="w-1/5 ml-2 mr-2 flex flex-col items-center justify-center">
<h1 className="text-sm text-white font-bold">V/S</h1>
 </div>
 <div className="w-2/5 gap-1 mr-2 flex flex-col items-center justify-center">
 <img src={teamicons.filter((it)=>it.team==i.secondteam.team)[0].image} className="w-auto h-auto" />
  <img src={`Logos/${teamicons.filter((it)=>it.team==i.secondteam.team)[0].team}.webp`} className="w-12 h-12"/>
<h1 className="text-sm font-bold text-white">{i.secondteam.name}</h1>
 </div>
    </div>
<div className="flex flex-row mt-2 justify-center gap-3 ">
<HashLink smooth to={`/onlinedual?id=${encodeURIComponent(name)}&&player=${encodeURIComponent(i.firstteam.name)}&&playerteam=${encodeURIComponent(i.firstteam.team)}&&computerteam=${encodeURIComponent(i.secondteam.team)}&&matchID=${encodeURIComponent(id)}`}>
<button className="bg-slate-900 text-white text-base px-6 py-2 font-bold rounded-md shadow-md"> Play</button>
</HashLink>
 </div>
    </div>
    </>)
  })}
  </div>
  </>
  }
{
  val[0].matches.filter((i)=>i.winner=="").length == 0 &&
  <>
{
  val[0].contestants.filter((i)=> i.team == val[0].matches[0].winner || i.team == val[0].matches[1].winner).filter((i)=>
    i.name == name).length > 0 && val[0].winner=="" && val[0].runnerup=="" && <>
 <div className="flex flex-col ml-2 mr-2 gap-4 my-16 justify-center items-center">
<div className="w-72 h-54 p-2 bg-slate-800 flex flex-col rounded-md flex-wrap lg:w-96 lg:h-90 md:w-96 md:h-84">
<p className="text-center text-sm text-white font-bold">Final</p>
 <div className="w-full mt-2 flex flex-row">
 <div className="w-2/5 ml-2 gap-1 flex flex-col items-center justify-center">
 <img src={teamicons.filter((it)=> it.team == val[0].matches[0].winner)[0].image} className="w-auto h-auto" />
  <img src={`Logos/${teamicons.filter((it)=> it.team == val[0].matches[0].winner)[0].team}.webp`} className="w-12 h-12"/>
    <h1 className="text-sm text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].matches[0].winner)[0].name}</h1>
 </div>
  <div className="w-1/5 ml-2 mr-2 flex flex-col items-center justify-center">
<h1 className="text-sm text-white font-bold">V/S</h1>
 </div>
 <div className="w-2/5 gap-1 mr-2 flex flex-col items-center justify-center">
 <img src={teamicons.filter((it)=>it.team== val[0].matches[1].winner)[0].image} className="w-auto h-auto" />
  <img src={`Logos/${teamicons.filter((it)=>it.team==val[0].matches[1].winner)[0].team}.webp`} className="w-12 h-12"/>
<h1 className="text-sm font-bold text-white">{val[0].contestants.filter((i)=> i.team == val[0].matches[1].winner)[0].name}</h1>
 </div>
</div>
 <div className="flex flex-row mt-2 justify-center gap-3 ">
<HashLink smooth to={`/onlinedual?id=${encodeURIComponent(name)}&&player=${encodeURIComponent(val[0].contestants.filter((i)=> i.team == val[0].matches[0].winner)[0].name)}&&playerteam=${encodeURIComponent(val[0].matches[0].winner)}&&computerteam=${encodeURIComponent(val[0].matches[1].winner)}&&matchID=${encodeURIComponent(id)}`}>
<button className="bg-slate-900 text-white text-base px-6 py-2 font-bold rounded-md shadow-md"> Play</button>
</HashLink>
 </div>
</div>
</div>
</>
}
{
  val[0].contestants.filter((i)=> i.team == val[0].matches[0].loser || i.team == val[0].matches[1].loser).filter((i)=>
    i.name == name).length > 0 && val[0].thirdplace=="" && <>
 <div className="flex flex-col ml-2 mr-2 gap-4 my-16 justify-center items-center">
<div className="w-72 h-54 p-2 bg-slate-800 flex flex-col rounded-md flex-wrap lg:w-96 lg:h-90 md:w-96 md:h-84">
<p className="text-center text-sm text-white font-bold">Third-Place</p>
 <div className="w-full mt-2 flex flex-row">
 <div className="w-2/5 ml-2 gap-1 flex flex-col items-center justify-center">
 <img src={teamicons.filter((it)=> it.team == val[0].matches[0].loser)[0].image} className="w-auto h-auto" />
  <img src={`Logos/${teamicons.filter((it)=> it.team == val[0].matches[0].loser)[0].team}.webp`} className="w-12 h-12"/>
    <h1 className="text-sm text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].matches[0].loser)[0].name}</h1>
 </div>
  <div className="w-1/5 ml-2 mr-2 flex flex-col items-center justify-center">
<h1 className="text-sm text-white font-bold">V/S</h1>
 </div>
 <div className="w-2/5 gap-1 mr-2 flex flex-col items-center justify-center">
 <img src={teamicons.filter((it)=>it.team== val[0].matches[1].loser)[0].image} className="w-auto h-auto" />
  <img src={`Logos/${teamicons.filter((it)=>it.team==val[0].matches[1].loser)[0].team}.webp`} className="w-12 h-12"/>
<h1 className="text-sm font-bold text-white">{val[0].contestants.filter((i)=> i.team == val[0].matches[1].loser)[0].name}</h1>
 </div>
</div>
 <div className="flex flex-row mt-2 justify-center gap-3 ">
<HashLink smooth to={`/onlinedual?id=${encodeURIComponent(name)}&&player=${encodeURIComponent(val[0].contestants.filter((i)=> i.team == val[0].matches[0].loser)[0].name)}&&playerteam=${encodeURIComponent(val[0].matches[0].loser)}&&computerteam=${encodeURIComponent(val[0].matches[1].loser)}&&matchID=${encodeURIComponent(id)}`}>
<button className="bg-slate-900 text-white text-base px-6 py-2 font-bold rounded-md shadow-md"> Play</button>
</HashLink>
 </div>
</div>
</div>
</>
}
  </>
}
{
  val[0].matches.filter((i)=>i.winner == "").length > 0 && val[0].matches.filter((i)=> (i.firstteam.name == name || i.secondteam.name == name) && i.winner=="").length == 0 && <>
   <div className="flex flex-col ml-2 mr-2 gap-4 my-16 justify-center items-center">
  {
    val[0].contestants.filter((i)=>i.name == name).map((i)=>{ return(<>
 <div className="w-72 h-54 p-2 bg-slate-800 flex flex-col items-center justify-center rounded-md flex-wrap lg:w-96 lg:h-90 md:w-96 md:h-84">
 <img src={teamicons.filter((it)=> it.team == i.team)[0].image} className="w-40 h-40" />
  <img src={`Logos/${teamicons.filter((it)=> it.team == i.team)[0].team}.webp`} className="w-12 h-12"/>
    <h1 className="text-sm p-4 text-white font-bold">Waiting for Next match.....</h1>
 </div>
    </>)})
  }
  </div>
  </>
}
{
  val[0].matches.filter((i)=>i.winner=="").length == 0 &&
  <>
{
  val[0].contestants.filter((i)=> i.team == val[0].matches[0].winner || i.team == val[0].matches[1].winner).filter((i)=>
    i.name == name).length > 0 && val[0].winner!=="" && val[0].runnerup!=="" && val[0].thirdplace=="" && <>
   <div className="flex flex-col ml-2 mr-2 gap-4 my-16 justify-center items-center">
  {
    val[0].contestants.filter((i)=>i.name == name).map((i)=>{ return(<>
 <div className="w-72 h-54 p-2 bg-slate-800 flex flex-col items-center justify-center rounded-md flex-wrap lg:w-96 lg:h-90 md:w-96 md:h-84">
 <img src={teamicons.filter((it)=> it.team == i.team)[0].image} className="w-40 h-40" />
  <img src={`Logos/${teamicons.filter((it)=> it.team == i.team)[0].team}.webp`} className="w-12 h-12"/>
    <h1 className="text-sm p-4 text-white font-bold">Waiting for Results.....</h1>
 </div>
    </>)})
  }
  </div>
</>
}
{
  val[0].contestants.filter((i)=> i.team == val[0].matches[0].loser || i.team == val[0].matches[1].loser).filter((i)=>
    i.name == name).length > 0 && val[0].thirdplace!=="" && val[0].winner=="" && val[0].runnerup== "" && <>
   <div className="flex flex-col ml-2 mr-2 gap-4 my-16 justify-center items-center">
  {
    val[0].contestants.filter((i)=>i.name == name).map((i)=>{ return(<>
 <div className="w-72 h-54 p-2 bg-slate-800 flex flex-col items-center justify-center rounded-md flex-wrap lg:w-96 lg:h-90 md:w-96 md:h-84">
 <img src={teamicons.filter((it)=> it.team == i.team)[0].image} className="w-40 h-40" />
  <img src={`Logos/${teamicons.filter((it)=> it.team == i.team)[0].team}.webp`} className="w-12 h-12"/>
    <h1 className="text-sm p-4 text-white font-bold">Waiting for Results.....</h1>
 </div>
    </>)})
  }
  </div>
</>
}
  </>
}
</>
}
{mode == "matches" && <> 
{ (val[0].winner == "" || val[0].runnerup == "" || val[0].thirdplace == "") && <>
{ val[0].matches.filter((i)=>i.winner=="").length >0 && <>
<div className="lg:w-full lg:flex lg:justify-center lg:items-center lg:flex-row lg:gap-x-24 lg:my-16">
<div className="flex gap-y-6 my-10 flex-col lg:items-center lg:justify-center">
<div className="w-full flex justify-center items-center lg:w-80">
<p className="text-center text-sm text-white font-bold">Semi-Final</p>
</div>
<div className="w-full flex lg:w-80">
<div className="w-1/2 flex justify-center items-center flex-col gap-2">
<img src={teamicons.filter((i)=> i.team == val[0].matches[0].firstteam.team)[0].image} className="w-32 h-32" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].matches[0].firstteam.team)[0].team}.webp`} className="w-10 h-10" />
<p className="text-center text-sm text-white font-bold">{val[0].matches[0].firstteam.name}</p>
</div>
<div className="flex justify-center items-center">
<p className="text-center text-sm text-white font-bold">V/S</p>
</div>
<div className="w-1/2 flex justify-center items-center flex-col gap-2">
<img src={teamicons.filter((i)=> i.team == val[0].matches[0].secondteam.team)[0].image} className="w-32 h-32" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].matches[0].secondteam.team)[0].team}.webp`} className="w-10 h-10" />
<p className="text-center text-sm text-white font-bold">{val[0].matches[0].secondteam.name}</p>
</div>
</div>
</div>
<div className="flex gap-y-6 my-10 flex-col lg:items-center lg:justify-center">
<div className="w-full flex justify-center items-center lg:w-80">
<p className="text-center text-sm text-white font-bold">Semi-Final</p>
</div>
<div className="w-full flex lg:w-80">
<div className="w-1/2 flex justify-center items-center flex-col gap-2">
<img src={teamicons.filter((i)=> i.team == val[0].matches[1].firstteam.team)[0].image} className="w-32 h-32" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].matches[1].firstteam.team)[0].team}.webp`} className="w-10 h-10" />
<p className="text-center text-sm text-white font-bold">{val[0].matches[1].firstteam.name}</p>
</div>
<div className="flex justify-center items-center">
<p className="text-center text-sm text-white font-bold">V/S</p>
</div>
<div className="w-1/2 flex justify-center items-center flex-col gap-2">
<img src={teamicons.filter((i)=> i.team == val[0].matches[1].secondteam.team)[0].image} className="w-32 h-32" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].matches[1].secondteam.team)[0].team}.webp`} className="w-10 h-10" />
<p className="text-center text-sm text-white font-bold">{val[0].matches[1].secondteam.name}</p>
</div>
</div>
</div>
</div>
</>
}

  { val[0].matches.filter((i)=>i.winner=="").length == 0 &&  <>
<div className="w-full flex gap-y-6 my-8 flex-col">
<div className="w-full flex justify-center items-center">
<p className="text-center text-sm text-white font-bold">Third-Place</p>
</div>
<div className="w-full flex">
<div className="w-1/2 flex justify-center items-center flex-col gap-2">
<img src={teamicons.filter((i)=> i.team == val[0].matches[0].loser)[0].image} className="w-32 h-32" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].matches[0].loser)[0].team}.webp`} className="w-10 h-10" />
<p className="text-center text-sm text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].matches[0].loser )[0].name}</p>
</div>
<div className="flex justify-center items-center">
<p className="text-center text-sm text-white font-bold">V/S</p>
</div>
<div className="w-1/2 flex justify-center items-center flex-col gap-2">
<img src={teamicons.filter((i)=> i.team == val[0].matches[1].loser)[0].image} className="w-32 h-32" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].matches[1].loser)[0].team}.webp`} className="w-10 h-10" />
<p className="text-center text-sm text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].matches[1].loser )[0].name}</p>
</div>
</div>
<div className="w-full flex justify-center items-center">
<p className="text-center text-sm text-white font-bold">Final</p>
</div>
<div className="w-full flex">
<div className="w-1/2 flex justify-center items-center flex-col gap-2">
<img src={teamicons.filter((i)=> i.team == val[0].matches[0].winner)[0].image} className="w-32 h-32" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].matches[0].winner)[0].team}.webp`} className="w-10 h-10" />
<p className="text-center text-sm text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].matches[0].winner )[0].name}</p>
</div>
<div className="flex justify-center items-center">
<p className="text-center text-sm text-white font-bold">V/S</p>
</div>
<div className="w-1/2 flex justify-center items-center flex-col gap-2">
<img src={teamicons.filter((i)=> i.team == val[0].matches[1].winner)[0].image} className="w-32 h-32" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].matches[1].winner)[0].team}.webp`} className="w-10 h-10" />
<p className="text-center text-sm text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].matches[1].winner )[0].name}</p>
</div>
</div>
</div>
</>
}
</>
}
</>
}
{mode == "result" && <> 
{
  (val[0].winner != "" && val[0].runnerup != "" && val[0].thirdplace != "") &&
  <>
  <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={250}
      recycle={false}
    />
<div className="w-full flex justify-center my-8 items-center flex-row gap-x-4 gap-y-4 flex-wrap">
<div className="w-full flex justify-center items-center">
<img src="Icons/trophy.webp"  className="w-16 h-16" />
</div>
<div className="flex justify-center items-center flex-col gap-2">
<p className="text-yellow-400 text-xs font-bold">Winner</p>
<img src={teamicons.filter((i)=> i.team == val[0].winner)[0].image} className="w-24 h-24" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].winner)[0].team}.webp`} className="w-8 h-8" />
<p className="text-center text-xs text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].winner )[0].name}</p>
</div>
<div className="flex justify-center items-center flex-col gap-2">
<p className="text-yellow-400 text-xs font-bold">Second</p>
<img src={teamicons.filter((i)=> i.team == val[0].runnerup)[0].image} className="w-24 h-24" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].runnerup)[0].team}.webp`} className="w-8 h-8" />
<p className="text-center text-xs text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].runnerup)[0].name}</p>
</div>
<div className="flex justify-center items-center flex-col gap-2">
<p className="text-yellow-400 text-xs font-bold">Third</p>
<img src={teamicons.filter((i)=> i.team == val[0].thirdplace)[0].image} className="w-24 h-24" />
<img src={`Logos/${teamicons.filter((i)=> i.team == val[0].thirdplace)[0].team}.webp`} className="w-8 h-8" />
<p className="text-center text-xs text-white font-bold">{val[0].contestants.filter((i)=> i.team == val[0].thirdplace)[0].name}</p>
</div>
{ val[0].contestants.filter((i)=> i.team != val[0].winner && i.team != val[0].runnerup && i.team != val[0].thirdplace).map((it)=>{
  return(<>
  <div className="flex justify-center items-center flex-col gap-2">
<p className="text-yellow-400 text-xs font-bold">Loser</p>
<img src={teamicons.filter((i)=> i.team == it.team)[0].image} className="w-24 h-24" />
<img src={`Logos/${teamicons.filter((i)=> i.team == it.team)[0].team}.webp`} className="w-8 h-8" />
<p className="text-center text-xs text-white font-bold">{val[0].contestants.filter((i)=> i.team == it.team)[0].name}</p>
</div>
  </>)
})}
</div>
  </>
}
</>
}
</>
}
  </>
  );
};
export default Game;