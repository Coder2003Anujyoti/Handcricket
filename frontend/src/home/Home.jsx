import React,{useState,useEffect} from 'react'
import { HashLink } from 'react-router-hash-link'
const Home=()=> {
  const [mode,setMode]=useState("knockout")
  const teams=["Mi","Dc","Kkr","Csk","Pbks","Srh","Rcb","Rr","Lsg","Gt"]
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
   <>
  <div className="relative w-full bg-slate-800 flex items-center justify-between p-2 z-50 md:px-4 md:py-3">
  <img className="w-28 h-16" src={`Icons/Logo.webp`} />
  </div>
  <div className="flex justify-evenly mt-4">
<button onClick={() => {setMode("knockout")}}
className={`px-4 py-2 font-bold  ${mode === "knockout" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Knockouts</button>
<button onClick={() => setMode("round-robin")}
className={`px-4 py-2 font-bold  ${mode === "round-robin" ? 'border-b border-b-white text-white' : 'text-white border-b border-b-transparent'}`}>Round-Robin
  </button>
  </div>
  <h1 className='text-white font-bold text-center my-8 lg:text-xl'>Create Tournament</h1>
  <div className="w-full flex flex-row flex-wrap justify-center items-center my-8 gap-8 px-4 sm:px-8">
{mode == "knockout" && <>
  <div className='w-96 h-64 bg-slate-800 rounded-md flex flex-row'>
  <div className='w-1/2 flex justify-center items-center p-6'>
  <img src="Icons/trophy.webp" className='w-28 h-28' />
  </div>
  <div className='w-1/2 flex flex-col gap-y-6 justify-center items-center p-1 items-center'>
   <div className='w-full flex flex-row flex-wrap justify-center items-center gap-1 items-center'>
   {
  teams.map((i, index) => (
    <div key={index}>
      <img src={`Logos/${i}.webp`} className="w-9 h-9" alt={i} />
    </div>
  ))
}
    </div>
    <div className='w-full flex flex-row flex-wrap justify-center items-center gap-3  items-center'>
    <HashLink smooth to="/create">
     <button  className="flex bg-slate-900 text-white font-bold py-2 px-7 rounded-md transition duration-300">
      Knockouts
      </button>
    </HashLink>
   </div>
  </div>
  </div>
</>}
  {mode=="round-robin" && <><div className='w-96 h-64 bg-slate-800 rounded-md flex flex-row'>
  <div className='w-1/2 flex justify-center items-center p-6'>
  <img src="Icons/throw.webp" className='w-28 h-28' />
  </div>
  <div className='w-1/2 flex flex-col gap-y-6 justify-center items-center items-center'>
   <div className='w-full flex flex-row flex-wrap p-1 justify-center items-center gap-1 items-center'>
   {
  teams.map((i, index) => (
    <div key={index}>
      <img src={`Logos/${i}.webp`} className="w-9 h-9" alt={i} />
    </div>
  ))
}
    </div>
    <div className='w-full flex flex-row flex-wrap justify-center items-center gap-3  items-center'>
      <HashLink smooth to="/make">
    <button  className="flex bg-slate-900 text-white font-bold py-2 px-6 rounded-md transition duration-300">
      Round-Robin
      </button>
      </HashLink>
      </div>
  </div>
  </div></>}
  </div>
   </>
  )
}

export default Home