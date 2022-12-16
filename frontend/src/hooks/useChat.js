import { useRef, useState, useEffect } from 'react'

import { useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import { CHATROOM_QUERY } from '../graphql/queries';
import { SEND_MESSAGE_QUERY, CREATE_CHATROOM_QUERY, CLEAR_MESSAGES_QUERY } from '../graphql/mutations';
import { NEW_MESSAGE_QUERY, MESSAGES_CLEARED_QUERY } from '../graphql/subscriptions';


const useChat = () => {
    const [userName, setUserName] = useState("")

    const [chatRoomLoadingStatus, setChatRoomLoadingStatus] = useState('loading')
    const [chatRoomList, setChatRoomList] = useState([])
    const [activeRoomIndex, setActiveRoomIndex] = useState(-1)

    const [status, setStatus] = useState({})

    const chatboxBottomRef = useRef(null)

    const [qlGetChatRoom] = useLazyQuery(CHATROOM_QUERY)

    const [qlCreateChatRoom] = useMutation(CREATE_CHATROOM_QUERY)
    const [qlSendMessage] = useMutation(SEND_MESSAGE_QUERY)
    const [qlClearMessages] = useMutation(CLEAR_MESSAGES_QUERY)

    const { data: qlNewMessage } = useSubscription(NEW_MESSAGE_QUERY, {
        variables: { receiver: userName },
    })
    const { data: qlMessagesCleared } = useSubscription(MESSAGES_CLEARED_QUERY, {
        variables: { receiver: userName },
    })

    useEffect(() => {
        chatboxBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatRoomList])

    useEffect(() => {
        if (qlNewMessage) {
            const { chatRoomName, message } = qlNewMessage.newMessage
            let newChatRoomList = []
            for (let i = 0; i < chatRoomList.length; i++) {
                let newChatRoom = chatRoomList[i]
                if (chatRoomList[i].name === chatRoomName) {
                    newChatRoom.messages = [
                        ...newChatRoom.messages,
                        message
                    ]
                }
                newChatRoomList.push(newChatRoom)
            }
            setChatRoomList(newChatRoomList)
        }
    }, [qlNewMessage])

    useEffect(() => {
        if (qlMessagesCleared) {
            const chatRoomName = qlMessagesCleared.messagesCleared
            let newChatRoomList = []
            for (let i = 0; i < chatRoomList.length; i++) {
                let newChatRoom = chatRoomList[i]
                if (chatRoomList[i].name === chatRoomName) {
                    newChatRoom.messages = []
                }
                newChatRoomList.push(newChatRoom)
            }
            setChatRoomList(newChatRoomList)
        }
    }, [qlMessagesCleared])

    const login = (userNameToLogin) => {
        setUserName(userNameToLogin);
    }

    const onOpenChatRoomSuccess = (chatRoom, successMessage) => {
        setActiveRoomIndex(chatRoomList.length)
        setChatRoomList((prev) => [
            ...prev, {
                name: chatRoom.name,
                userList: chatRoom.userList,
                messages: chatRoom.messages
            }
        ])

        setChatRoomLoadingStatus('success')
        showStatus('success', successMessage)
    }

    const onOpenChatRoomNotFound = (errorMessage) => {
        setChatRoomLoadingStatus('not found')
        showStatus('error', errorMessage)
    }

    const onOpenChatRoomError = (errorMessage) => {
        setChatRoomLoadingStatus('error')
        showStatus('error', errorMessage)
    }

    const createChatRoom = (chatRoomName, userList) => {
        qlCreateChatRoom({
            variables: {
                chatRoomName: chatRoomName,
                userList: userList
            }
        }).then((result) => {
            const { status, chatRoom } = result.data.createChatRoom;
            switch (status) {
                case "success":
                    onOpenChatRoomSuccess(
                        chatRoom,
                        'Chat room opened'
                    )
                    break
                default:
                    break
            }
        }).catch(() => {
            onOpenChatRoomError('Failed to open chat room')
        })
    }

    const openChatRoom = (chatRoomName) => {

        for (let chatRoom of chatRoomList) {
            if (chatRoom.name === chatRoomName) {
                onOpenChatRoomError('Chat room is opened')
                return
            }
        }

        setChatRoomLoadingStatus('loading')

        qlGetChatRoom({
            variables: {
                chatRoomName: chatRoomName,
                userName: userName,
            }
        }).then((result) => {
            const { status, chatRoom } = result.data.chatRoom;
            console.log(status)
            switch (status) {
                case "found":
                    onOpenChatRoomSuccess(
                        chatRoom,
                        'Chat room opened'
                    )
                    break
                case "not found":
                    onOpenChatRoomNotFound('Chat room not found')
                    break
                case "not authorized":
                    onOpenChatRoomError('You are not in the chat room')
                    break
                default:
                    break
            }
        }).catch(() => {
            onOpenChatRoomError('Failed to open chat room')
        })
    }

    const removeChatRoom = (removeKey) => {
        let newChatRoomList = [];
        chatRoomList.forEach((room, key) => {
            if (key !== removeKey) {
                newChatRoomList.push(room);
            }
        })
        setChatRoomList(newChatRoomList);
        if (activeRoomIndex >= newChatRoomList.length) {
            setActiveRoomIndex(newChatRoomList.length - 1);
        }
    }

    const changeChatRoom = (newActiveRoomIndex) => {
        setActiveRoomIndex(newActiveRoomIndex);
    }

    const sendMessage = (content) => {
        qlSendMessage({
            variables: {
                chatRoomName: chatRoomList[activeRoomIndex].name,
                sender: userName,
                content: content
            }
        }).then((result) => {
            const status = result.data.addMessage;
            if (status) {
                showStatus('success', 'Message sent')
            } else {
                showStatus('error', 'Failed to send message')
            }
        }).catch((error) => {
            showStatus('error', 'Failed to send message')
        })
    }

    const clearMessages = () => {
        if (activeRoomIndex >= 0) {
            qlClearMessages({
                variables: {
                    chatRoomName: chatRoomList[activeRoomIndex].name,
                }
            }).then((result) => {
                const status = result.data.clearMessages;
                if (status) {
                    showStatus('success', 'Message cleared')
                } else {
                    showStatus('error', 'Failed to clear message')
                }
            }).catch((error) => {
                showStatus('error', 'Failed to send message')
            })
        }
    }

    const showStatus = (type, msg) => {
        setStatus({ type: type, msg: msg });
    }

    return {
        userName, login,
        openChatRoom, createChatRoom,
        removeChatRoom, changeChatRoom,
        chatRoomLoadingStatus,
        chatRoomList, activeRoomIndex,
        sendMessage, clearMessages,
        status, showStatus,
        chatboxBottomRef,
    }
}

export default useChat