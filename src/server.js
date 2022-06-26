const express = require('express');
const ACTIONS = require('./constants/Action');

const app = express();
const httpServer = require('http').createServer(app);

const userSocketMap = new Map();

const dataMap = new Map();


const io = require("socket.io")(httpServer, {
    cors: {
      origin: "*"
    }
  });


io.on("connection", (socket)=>{
    console.log("socket connected", socket.id);

    socket.on(ACTIONS.JOIN ,({roomId , userName})=>{
        if(userSocketMap[socket.id]==null){
            userSocketMap.set(socket.id, { userName , roomId , sockeId: socket.id})
            console.log(`User ${userName} has joined in room ${roomId}`)
            socket.join(roomId);
            socket.to(roomId).emit(ACTIONS.JOINED, {
                userName,
                socketId: socket.id,
                elementsData:dataMap.get(roomId)
            });
        }
       
    })

    

    socket.on("on-newelements", ({elementsData, userName , roomId})=>{
            
            console.log("Sending the data to client")
            dataMap.set(roomId,elementsData);
            socket.to(roomId).emit("on-newelements", {
                elementsData,
                userName
            });
    })

    socket.on(ACTIONS.DISCONNECTING, ({userName}) => {

        console.log("Disconnecting..");
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                userName: userSocketMap.get(socket.id),
            });
        });
        userSocketMap.delete(userName)
        socket.leave();
    });
})

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT , ()=> console.log(`listening on port ${PORT}`));
