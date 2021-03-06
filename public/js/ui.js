
import * as constants from './constant.js'
import * as element from './element.js'


export const updatePersonalCode = (personalCode) =>{
    const personalCodeParagraph = document.getElementById('personal_code_paragraph')
    personalCodeParagraph.innerHTML = personalCode
}



export const updateLocalVideo = (stream) =>{
    const localVideo = document.getElementById("local_video")
    localVideo.srcObject = stream

    localVideo.addEventListener('loadedmetadata', () =>{
        localVideo.play()
    })
}


export const updateRemoteVideo = (stream) =>{
    const remoteVideo = document.getElementById('remote_video')
    remoteVideo.srcObject = stream
}


export const showIncomingCallDialog = (callType, acceptCallHandler, rejectCallHandler) =>{
    const callTypeInfo = callType === constants.callType.CHAT_PERSONAL_CODE ? 'Chat' : 'Video'
    const incomingCallDialog = element.getIncomingCallDialog(callTypeInfo, acceptCallHandler, rejectCallHandler)

    const dialog = document.getElementById('dialog')
    //dialog.querySelectorAll('*').forEach((dialog) => dialog.remove())
    dialog.appendChild(incomingCallDialog)
}


export const showCallingDialog = (rejectCallHandler) =>{
    const callingDialog = element.getCallingDialog(rejectCallHandler)

    const dialog = document.getElementById("dialog")
    //dialog.querySelectorAll("*").forEach((dialog) => dialog.remove())

    dialog.appendChild(callingDialog)
}

export const removeAllDialog = () =>{
    const dialog = document.getElementById("dialog")
    dialog.querySelectorAll("*").forEach((dialog) => dialog.remove())
}



export const showCallElements = (callType) =>{
    if(callType === constants.callType.CHAT_PERSONAL_CODE){
        showChatCallElements()
    }

    if(callType === constants.callType.VIDEO_PERSONAL_CODE){
        showVideoCallElement()
    }
}



const showChatCallElements = () =>{
    const finishConnectionChatButtonContainer = document.getElementById(
        "finish_chat_button_container"
        )
    showElement(finishConnectionChatButtonContainer)

    const newMessageInput = document.getElementById("new_message")
    showElement(newMessageInput)

    disabledDashboard()
}



const showVideoCallElement = () =>{
    const callButtons = document.getElementById('call_buttons')
    showElement(callButtons)

    const placeholder = document.getElementById("video_placeholder")
    hideElement(placeholder)
    
    const removeVideo = document.getElementById("remote_video")
    showElement(removeVideo)

    const newMessageInput = document.getElementById("new_message")
    showElement(newMessageInput)
    disabledDashboard()

}


export const showInfoDialog = (preOfferAnswer) =>{
    let infoDialog = null
    if(preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED){
        infoDialog = element.getInfoDialog(
            'Call rejected',
            'Callee rejected your call'
        )
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND){
        infoDialog = element.getInfoDialog(
            'Call not found',
            'Please check personal code'
        )
    }

    if(preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE){
        infoDialog = element.getInfoDialog(
            'Call is not possible',
            'Probably callee is busy. Please try again later'
        )
    }

    if(infoDialog){
        const dialog = document.getElementById("dialog")
        dialog.appendChild(infoDialog)
        setTimeout(() =>{
            removeAllDialog()
        }, [4000])
    }


}


const micOnImgSrc = './utils/images/mic.png'
const micOffImgSrc = './utils/images/micOff.png'


export const updateMicButton = (micActive) =>{
    const micButtonImage = document.getElementById("mic_button_image")
    micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc
}


const cameraOnSrc = './utils/images/camera.png'
const cameraOffSrc = './utils/images/cameraOff.png'

export const updateCameraButton = (cameraActive) =>{
    const cameraButtonImage = document.getElementById('camera_button_image')
    cameraButtonImage.src = cameraActive ? cameraOffSrc : cameraOnSrc
}



//ui message
export const appendMessage = (message, right = false) =>{
    const messagesContainer = document.getElementById('messages_container')
    const messageElement = right 
            ? element.getRightMessage(message) 
            : element.getLeftMessage(message)
    messagesContainer.appendChild(messageElement)
}


export const clearMessenger = () =>{
    const messagesContainer = document.getElementById("messages_container")
    messagesContainer.querySelectorAll('*').forEach((n) => n.remove())
}


export const showRecordingPanel = () =>{
    const recordingButton = document.getElementById('video_recording_buttons')
    showElement(recordingButton)

    //hide start recording button when active
    const startRecordingButton = document.getElementById('start_recording_button')
    hideElement(startRecordingButton)
}


export const resetRecordingButtons = () =>{
    const startRecordingButton = document.getElementById(
        'start_recording_button'
    )
    const recordingButton = document.getElementById('video_recording_buttons')

    hideElement(recordingButton)
    showElement(startRecordingButton)
}



export const switchRecordingButtons = (switchForResumeButton = false) =>{
    const resumeButton = document.getElementById('resume_recording_button')
    const pauseButton = document.getElementById('pause_recording_button')

    if(switchForResumeButton){
        hideElement(pauseButton)
        showElement(resumeButton)
    }else{
        showElement(pauseButton)
        hideElement(resumeButton)
    }
}



export const updateUIAfterHangUp = (callType) =>{
    enableDashboard()

    if(callType === constants.callType.VIDEO_PERSONAL_CODE){
        const callButtons = document.getElementById('call_buttons')
        hideElement(callButtons)
    }else{
        const chatCallButtons = document.getElementById('finish_chat_button_container')
        hideElement(chatCallButtons)
    }

    const newMessageInput = document.getElementById('new_message')
    hideElement(newMessageInput)
    clearMessenger()
    updateMicButton(false)
    updateCameraButton(false)

    const remoteVideo = document.getElementById('remote_video')
    hideElement(remoteVideo)

    const placeholder = document.getElementById('video_placeholder')
    showElement(placeholder)

    removeAllDialog()
}


export const showVideoCallButtons = () =>{
   

}


const enableDashboard = () =>{
    const dashboardBlocker = document.getElementById('dashboard_blur')
    if(!dashboardBlocker.classList.contains("display_none")){
        dashboardBlocker.classList.add("display_none")
    }
}


const disabledDashboard = () =>{
    const dashboardBlocker = document.getElementById("dashboard_blur")
    if(dashboardBlocker.classList.contains("display_none")){
        dashboardBlocker.classList.remove("display_none")
    }
}


const hideElement = (element) =>{
    if(!element.classList.contains("display_none")){
        element.classList.add("display_none")
    }
}

const showElement = (element) =>{
    if(element.classList.contains("display_none")){
        element.classList.remove("display_none")
    }
}