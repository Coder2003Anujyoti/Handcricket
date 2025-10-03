// socket.js
import { io } from "socket.io-client";
export const socket = io("http://localhost:8000/",{
  transports: ["websocket"], }); // or your backend URL