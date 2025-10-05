// socket.js
import { io } from "socket.io-client";
export const socket = io("https://miniature-toma-aliudufu-dfe931ca.koyeb.app/",{
  transports: ["websocket"], }); // or your backend URL