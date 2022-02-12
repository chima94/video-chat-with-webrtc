import * as wss from './wss.js'
import * as constants from './constant.js'
import * as ui from './ui.js'
import * as store from './store.js'

let connectedUserDetails
let peerConnection
let dataChannel

const defaultConstraints = {
    audio: true,
    video: true
}

const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.1.google.com:13902'
        }
    ]
}

export const getLocalPreview = () =>{
    navigator.mediaDevices.getUserMedia(defaultConstraints)
        .then((stream) =>{
            ui.updateLocalVideo(stream)
            ui.showVideoCallButtons()
            store.setCallState(constants.callState.CALL_AVAILABLE)
            store.setLocalStream(stream)
        }).catch((err) =>{
            console.log("error occured when trying to get an access to camera")
            console.log(err)
        })
}




const createPeerConnection = () =>{
    peerConnection = new RTCPeerConnection(configuration)

    dataChannel = peerConnection.createDataChannel('chat')

    peerConnection.ondatachannel = (event) =>{
        const dataChannel = event.channel

        dataChannel.onopen = () =>{
            console.log('peer connection is ready to receive data channel messages')
        }

        dataChannel.onmessage = (event) =>{
            console.log('message came from data channel')
            const message = JSON.parse(event.data)
            ui.appendMessage(message)
        }
    }

    peerConnection.onicecandidate = (event) =>{
        if(event.candidate){
            wss.sendDataUsingWebRTCSignalling({
                connectedUserSocketId: connectedUserDetails.socketId,
                type: constants.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate
            })

        }
    }

    peerConnection.onconnectionstatechange = (event) =>{
        if(peerConnection.connectionState === 'connected'){
            console.log('successfully connected with other peer')
        }
    }

    //receiving tracks
    const remoteStream = new MediaStream()
    store.setRemoteStream(remoteStream)
    ui.updateRemoteVideo(remoteStream)

    peerConnection.ontrack = (event) =>{
        remoteStream.addTrack(event.track)
    }


    //add stream to peer connection 
    if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE){
        const localStream = store.getState().localStream
        
        for(const track of localStream.getTracks()){
            peerConnection.addTrack(track, localStream)
        }
    }
}



export const sendMessageUsingDataChannel = (message) =>{
    const stringifiedMessage = JSON.stringify(message)
    dataChannel.send(stringifiedMessage)
}


export const sendPreOffer = (callType, calleePersonalCode) =>{
    connectedUserDetails = {
        callType,
        socketId: calleePersonalCode
    }

    if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){

        const data = {
            callType,
            calleePersonalCode
        }
        
        ui.showCallingDialog(callingDialogRejectCallHandler)
        wss.sendPreOffer(data)
    }
   
}


export const handlePreOffer = (data) =>{
    const {callType, callerSocketId} = data

    connectedUserDetails = {
        socketId: callerSocketId,
        callType
    }

    if(callType === constants.callType.CHAT_PERSONAL_CODE || callType === constants.callType.VIDEO_PERSONAL_CODE){
        ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler)
    }
}


const acceptCallHandler = () =>{
    console.log("call accepted")
    createPeerConnection()
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED)
    ui.showCallElements(connectedUserDetails.callType)
}


const rejectCallHandler = () =>{
    console.log("call rejected")
    sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED)
}


const callingDialogRejectCallHandler = () =>{
    console.log("rejecting call")
}


const sendPreOfferAnswer = (preOfferAnswer) =>{
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer
    }
    ui.removeAllDialog()
    wss.sendPreOfferAnswer(data)
}


export const handlePreOfferAnswer = (data) =>{
    const {preOfferAnswer} = data
    ui.removeAllDialog()

    if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
        ui.showInfoDialog(preOfferAnswer)
     }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE){
        ui.showInfoDialog(preOfferAnswer)
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED){
        ui.showInfoDialog(preOfferAnswer)
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED){
       ui.showCallElements(connectedUserDetails.callType)
       createPeerConnection()
       sendWebRTCOffer()
    }
}


const sendWebRTCOffer = async () =>{
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    wss.sendDataUsingWebRTCSignalling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.OFFER,
        offer: offer
    })
}


export const handleWebRTCOffer = async (data) =>{
    await peerConnection.setRemoteDescription(data.offer)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    wss.sendDataUsingWebRTCSignalling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ANSWER,
        answer: answer
    })
}


export const handleWebRTCAnswer = async (data) =>{
    await peerConnection.setRemoteDescription(data.answer)
}




export const handleWebRTCCandidate = async (data) =>{
    console.log("handling webrtc candidate")
    try{
       await peerConnection.addIceCandidate(data.candidate) 
    }catch(err){
        console.error("error occured when trying to add and receive candidate", err)
    }
}


let screenSharingStream

export const switchBetweenCameraAndScreenSharing = async (screenSharingActive) =>{
    if(screenSharingActive){
        const localStream = store.getState().localStream
        const senders = peerConnection.getSenders()

        const sender = senders.find((sender) =>
        sender.track.kind === localStream.getVideoTracks()[0].kind
    )

    if(sender){
        sender.replaceTrack(localStream.getVideoTracks()[0])
    }
    store.getState().screenSharingStream.getTracks().forEach((track) => track.stop())
    store.setScreenSharingActive(!screenSharingActive)
    ui.updateLocalVideo(localStream)

    }else{
       console.log("switching for sharing")
       try {
           screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
               video: true
           })
           store.setScreenSharingStream(screenSharingStream)
           const senders = peerConnection.getSenders()

           const sender = senders.find((sender) =>
               sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
           )

           if(sender){
               sender.replaceTrack(screenSharingStream.getVideoTracks()[0])
           }
           store.setScreenSharingActive(!screenSharingActive)
           ui.updateLocalVideo(screenSharingStream)
       } catch (error) {
           console.error('error occured when trying to get screen sharing stream', error)
       } 
    }
}


//hang up
export const handleHangUp = () =>{
    console.log("finishing call")
    const data = {
        connectedUserSocketId: connectedUserDetails.socketId
    }
    wss.sendUserHangedUp(data)
    closePeerConnectionAndResetState()
}

export const handleConnectedUserHangedUp = () =>{
    closePeerConnectionAndResetState()
}


const closePeerConnectionAndResetState = () =>{
    if(peerConnection){
        peerConnection.close()
        peerConnection = null
    }

    if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE){
        store.getState().localStream.getVideoTracks()[0] = true
        store.getState().localStream.getAudioTracks()[0] = true
    }

    ui.updateUIAfterHangUp(connectedUserDetails.callType)
    connectedUserDetails = null
}