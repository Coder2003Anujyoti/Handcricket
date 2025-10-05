import React,{useState,useEffect} from 'react'
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { MdWarningAmber } from "react-icons/md";
import Warning from './Warning';
import Home from "./home/Home"
import Create from "./knockouts/Create"
import Game from "./knockouts/Game"
import OnlineDual from "./knockouts/OnlineDual"
import Make from "./roundrobin/Make"
import Play from "./roundrobin/Play"
import OnlineDuals from "./roundrobin/OnlineDuals"
import Structure from "./series/Structure"
import Plays from "./series/Plays"
import Onlines from "./series/Onlines"
const App = () => {
const [blocked, setBlocked] = useState(false);
useEffect(() => {
const handleResize = () => {
const width = window.innerWidth;
if (width <= 320) {
setBlocked(true);
} else {
setBlocked(false);
}
};
handleResize();
window.addEventListener("resize", handleResize);
return () => window.removeEventListener("resize", handleResize);
}, []);
useEffect(() => {
document.body.className = "bg-gray-900";
}, []);
if (blocked) {
return (
<div className="w-full h-screen text-white flex items-center justify-center text-center p-4">
<div>
<MdWarningAmber className="text-6xl text-yellow-500 mx-auto mb-4" />
<h1 className="text-xl font-bold">Access Restricted</h1>
<p className="mt-2">This site is not accessible on your screen.</p>
</div>
</div>
);
}
  return(<>
  <Router>
  <Routes>
  <Route path="/" element={<Warning><Home /></Warning>} />
  <Route path="/create" element={<Warning><Create /></Warning>} />
  <Route path="/game"  element={<Warning><Game /></Warning>} />
  <Route path='/onlinedual' element={<Warning><OnlineDual /></Warning>} />
  <Route path="/make" element={<Warning><Make /></Warning>} />
  <Route path="/play" element={<Warning><Play /></Warning>} />
  <Route path='/onlineduals' element={<Warning><OnlineDuals /></Warning>} />
  <Route path='/structure' element={<Warning><Structure /></Warning>} />
    <Route path='/plays' element={<Warning><Plays /></Warning>} />
     <Route path='/onlines' element={<Warning><Onlines /></Warning>} />
  </Routes>
  </Router>
  </>)
}
export default App