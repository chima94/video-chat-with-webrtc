
import * as constants from './constant.js'
import * as element from './element.js'

export const updatePersonalCode = (personalCode) =>{
    const personalCodeParagraph = document.getElementById('personal_code_paragraph')
    personalCodeParagraph.innerHTML = personalCode
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