import * as store from './store.js'
import * as wss from './wss.js'
import * as webrtcHandler from './webrtcHandler.js'
import * as constant from './constant.js'
import { getIncomingCallDialog } from './element.js'


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

