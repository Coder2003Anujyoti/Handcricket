import React,{useEffect} from 'react'
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Warning from './Warning';
import Home from "./home/Home"
import Create from "./knockouts/Create"
import Game from "./knockouts/Game"
import OnlineDual from "./knockouts/OnlineDual"
import Make from "./roundrobin/Make"
import Play from "./roundrobin/Play"
import OnlineDuals from "./roundrobin/OnlineDuals"
const App = () => {
 useEffect(()=>{
   document.body.className="bg-gray-900"
 })
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
  </Routes>
  </Router>
  </>)
}
export default App