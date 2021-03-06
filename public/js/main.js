import * as store from './store.js'
import * as wss from './wss.js'
import * as webrtcHandler from './webrtcHandler.js'
import * as constant from './constant.js'
import * as ui from './ui.js'
import * as recordingUtils from './recordingUtils.js'


const socket = io("/");
wss.registerSocketEvents(socket)

webrtcHandler.getLocalPreview()

const personalCodeCopyButton = document.getElementById('personal_code_copy_button')
const personalCodeChatButton = document.getElementById('personal_code_chat_button')
const personalCodeVideoButton = document.getElementById('personal_code_video_button')


personalCodeCopyButton.addEventListener('click', () =>{
  const personalCode = store.getState().socketId
  navigator.clipboard && navigator.clipboard.writeText(personalCode)
})


personalCodeChatButton.addEventListener('click', () =>{
  console.log("chat button clicked")
  const calleePersonalCode = document.getElementById('personal_code_input').value
  const callType = constant.callType.CHAT_PERSONAL_CODE
  webrtcHandler.sendPreOffer(callType, calleePersonalCode)
})

personalCodeVideoButton.addEventListener('click', () =>{
  console.log('video button clicked')
  const calleePersonalCode = document.getElementById('personal_code_input').value
  const callType = constant.callType.VIDEO_PERSONAL_CODE
  webrtcHandler.sendPreOffer(callType, calleePersonalCode)
})


//event listner for video calls button
const micButton = document.getElementById('mic_button')
micButton.addEventListener('click', () =>{
  const localStream = store.getState().localStream
  const micEnabled = localStream.getAudioTracks()[0].enabled
  localStream.getAudioTracks()[0].enabled = !micEnabled
  ui.updateMicButton(micEnabled)
})


const cameraButton = document.getElementById('camera_button')
cameraButton.addEventListener('click', () =>{
  const localStream = store.getState().localStream
  const cameraEnabled = localStream.getVideoTracks()[0].enabled
  localStream.getVideoTracks()[0].enabled = !cameraEnabled
 ui.updateCameraButton(cameraEnabled)
})



  const switchForScreenSharingButton = document.getElementById('screen_sharing_button')
  switchForScreenSharingButton.addEventListener('click', () => {
    const screenSharingActive = store.getState().screenSharingActive
    webrtcHandler.switchBetweenCameraAndScreenSharing(screenSharingActive)
  })


  //messenger
  const newMessageInput = document.getElementById('new_message_input')
  newMessageInput.addEventListener('keydown', (event) =>{
    console.log('change occured')
    const key = event.key

    if(key === 'Enter'){
      webrtcHandler.sendMessageUsingDataChannel(event.target.value)
      ui.appendMessage(event.target.value, true)
      newMessageInput.value = ""
    }
  })


  const sendMessageButton = document.getElementById('send_message_button')
  sendMessageButton.addEventListener('click', () =>{
    const message = newMessageInput.value
    webrtcHandler.sendMessageUsingDataChannel(message)
    ui.appendMessage(message, true)
    newMessageInput.value = ""
  })


  //recording
  const startRecordingButton = document.getElementById('start_recording_button')
  startRecordingButton.addEventListener('click', () =>{
    recordingUtils.startRecording()
    ui.showRecordingPanel()
  })


  const stopRecordingButton = document.getElementById('stop_recording_button')
  stopRecordingButton.addEventListener('click', () =>{
    recordingUtils.stopRecording()
    ui.resetRecordingButtons()
  })


  const pauseRecordingButton = document.getElementById('pause_recording_button')
  pauseRecordingButton.addEventListener('click', () =>{
    recordingUtils.pauseRecording()
    ui.switchRecordingButtons(true)
  })


  const resumeRecordingButton = document.getElementById('resume_recording_button')
  resumeRecordingButton.addEventListener('click', () =>{
    recordingUtils.resumeRecording()
    ui.switchRecordingButtons(false)
  })



  //hang up
  const hangUpButton = document.getElementById('hang_up_button')
  hangUpButton.addEventListener('click', () =>{
    webrtcHandler.handleHangUp()
  })


  const hangUpChatButton = document.getElementById('finish_chat_call_button')
  hangUpChatButton.addEventListener('click', () =>{
    webrtcHandler.handleHangUp()
  })
