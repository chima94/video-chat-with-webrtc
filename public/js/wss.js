
import * as store from './store.js'
import * as ui from './ui.js'
import * as webrtcHandler from './webrtcHandler.js'

let socketIO = null

export const registerSocketEvents = (socket) =>{

    socketIO = socket
    socket.on("connect", () => {
      console.log("succesfully connected to socket.io server");
      store.setSocketId(socket.id)
      ui.updatePersonalCode(socket.id)
      });

      socket.on("pre-offer", (data) => {
        webrtcHandler.handlePreOffer(data)
      })

      socket.on("pre-offer-answer", (data) =>{
        webrtcHandler.handlePreOfferAnswer(data)
      })
}


export const sendPreOffer = (data) =>{
  socketIO.emit("pre-offer", data)
}


export const sendPreOfferAnswer = (data) =>{
  socketIO.emit("pre-offer-answer", data)
}