import React,{useState,useEffect} from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';
import {useNavigate} from "react-router-dom"
function Make() {
 const [mode,setMode]=useState("create")
 const [tournamentid,setTournamentid]=useState("")
 const [showpassword,setShowpassword]=useState(false)
 const [name,setName]=useState("")
 const [tournamentpassword,setTournamentpassword]=useState("")
 const navigate = useNavigate()
 useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
 const add_room=async()=>{
 if(tournamentid.length>0 && tournamentpassword.length>0 ){
   try {
    const response = await fetch("http://localhost:8000/add-roundrobin-room", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id:tournamentid,password:tournamentpassword}),
    });
    if (!response.ok) {
     toast.error("Server error")
    }
    const result = await response.json();
    if(result.type == "error"){
      toast.error(`${result.message}`)
    }
    else{
      toast.success(`${result.message}`)
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
  finally{
    setTournamentid("")
    setTournamentpassword("")
  }
}
 }
const delete_room=async()=>{
 if(tournamentid.length>0 && tournamentpassword.length>0){
   try {
    const response = await fetch("http://localhost:8000/delete-roundrobin-room", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id:tournamentid,password:tournamentpassword}),
    });

    if (!response.ok) {
      toast.error("Server error")
    }
    const result = await response.json();
     if(result.type == "error"){
      toast.error(`${result.message}`)
    }
    else{
      toast.success(`${result.message}`)
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
  finally{
  setTournamentid("")
    setTournamentpassword("")
  }
}
 }
const join_room=async()=>{
  if(tournamentid.length>0 && name.length>0){
   try {
    const response = await fetch("http://localhost:8000/add-roundrobin-contestant", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({name:name,id:tournamentid}),
    });

    if (!response.ok) {
      toast.error("Server error")
    }
    const result = await response.json(); 
   if(result?.contestants?.length ==4 ){
    const arr = result.contestants.map((i)=> i.team)
const encoded = encodeURIComponent(JSON.stringify(arr));
    navigate(`/play?id=${tournamentid}&&name=${name}&&teams=${encoded}`)
    }
  else if(result?.contestants?.length < 4){
    if(result.type == "error"){
      toast.error(`${result.message}`)
    }
    else{
      toast.success(`${result?.message ? result.message : "Registered Successfully"}`)
    }
  }
  else{
   if(result.type == "error"){
      toast.error(`${result.message}`)
    }
    else{
      toast.success(`${result.message}`)
    }
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
}
finally{
  setTournamentid("")
  setName("")
}
}
}

  return (
  <>
  <Toaster position="top-center" toastOptions={{ className:"font-bold", duration: 2000 }} />
  <div className="relative w-full bg-slate-800 flex items-center justify-between p-2 z-50 md:px-4 md:py-3">
  <img className="w-28 h-16" src={`Icons/Logo.webp`} />
  </div>
  <div className="flex justify-evenly mt-4">
<button onClick={() => {setMode("create")}}
className={`px-4 py-2 font-bold  ${mode === "create" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Create</button>
<button onClick={() => setMode("join")}
className={`px-4 py-2 font-bold  ${mode === "join" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Join
  </button>
<button onClick={() => setMode("delete")}
className={`px-4 py-2 font-bold  ${mode === "delete" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Delete
  </button>
  </div>
  {
  mode=="create" ? (<>
  <div className="max-w-xl w-full mx-auto mt-4 px-4 sm:px-6 py-4 rounded-xl space-y-6">
  <div className="w-full flex items-center justify-center">
  <img src="Icons/stadium.webp" className="w-36 h-36" />
  </div>
 <h2 className="text-xl font-bold text-center text-white">Create Room</h2>
 <input type="text" placeholder="Enter Tournament ID" className="w-full p-3 font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none"
value={tournamentid} onChange={(e) => setTournamentid(e.target.value.replace(/\s/g,""))}
      />
<div className="relative w-full mb-4">
<input type={showpassword ? 'text' : 'password'} placeholder="Enter Tournament Password" value={tournamentpassword}
onChange={(e) => setTournamentpassword(e.target.value.replace(/\s/g,""))} className="w-full px-4 py-2 border rounded-md font-semibold focus:outline-none pr-10" />
<button type="button" onClick={() => setShowpassword(!showpassword)}
className="absolute inset-y-0 right-2 flex items-center text-gray-500" >
{showpassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
</button>
</div>
  </div>
  <div className="flex flex-row mt-6 justify-center gap-3 ">
<button onClick={add_room} className="bg-slate-800 text-white text-base px-6 py-2 font-bold rounded-md shadow-md">Create Room</button>
  </div>
  </>) : (mode=="join") ? (<>
    <div className="max-w-xl w-full mx-auto mt-4 px-4 sm:px-6 py-4 rounded-xl space-y-6">
  <div className="w-full flex items-center justify-center">
  <img src="Icons/c2.webp" className="w-36 h-36" />
  </div>
 <h2 className="text-xl font-bold text-center text-white">Join Room</h2>
  <input type="text" placeholder="Enter User Name" className="w-full p-3 border font-semibold border-gray-300 rounded-md shadow-sm focus:outline-none" value={name} onChange={(e) => setName(e.target.value.replace(/\s/g,""))} />
 <input type="text" placeholder="Enter Tournament ID" className="w-full p-3 font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none"
value={tournamentid} onChange={(e) => setTournamentid(e.target.value.replace(/\s/g,""))}
      />
  </div>
<div className="flex flex-row mt-6 justify-center gap-3 ">
<button onClick={join_room} className="bg-slate-800 text-white text-base px-6 py-2 font-bold rounded-md shadow-md">Join Room</button>
  </div>
  </>) :
  (<>
    <div className="max-w-xl w-full mx-auto mt-4 px-4 sm:px-6 py-4 rounded-xl space-y-6">
  <div className="w-full flex items-center justify-center">
  <img src="Icons/throw.webp" className="w-36 h-36" />
  </div>
 <h2 className="text-xl font-bold text-center text-white">Delete Room</h2>
 <input type="text" placeholder="Enter Tournament ID" className="w-full p-3 font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none"
value={tournamentid} onChange={(e) => setTournamentid(e.target.value.replace(/\s/g,""))}
      />
<div className="relative w-full mb-4">
<input type={showpassword ? 'text' : 'password'} placeholder="Enter Tournament Password" value={tournamentpassword}
onChange={(e) => setTournamentpassword(e.target.value.replace(/\s/g,""))} className="w-full px-4 py-2 border rounded-md font-semibold focus:outline-none pr-10" />
<button type="button" onClick={() => setShowpassword(!showpassword)}
className="absolute inset-y-0 right-2 flex items-center text-gray-500" >
{showpassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
</button>
</div>
  </div>
  <div className="flex flex-row mt-6 justify-center gap-3 ">
<button onClick={delete_room} className="bg-slate-800 text-white text-base px-6 py-2 font-bold rounded-md shadow-md">Delete Room</button>
  </div>
  </>)
}
  </>
  )
}

export default Make