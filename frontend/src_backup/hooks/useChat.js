import { useRef, useState, useEffect } from 'react'
import { w3cwebsocket as W3CWebSocket } from "websocket"

const useChat = (initialUser) => {
    const [user, setUser] = useState(initialUser)
    const [roomList, setRoomList] = useState([])
    const [activeRoom, setActiveRoom] = useState(0)
    const [status, setStatus] = useState({})
    const chatboxBottomRef = useRef(null);


    const client = new W3CWebSocket('ws://localhost:4000')

    const sendData = (data) => {
        client.send(JSON.stringify(data))
    }

    const sendMessage = (payload) => {
        const ID = roomList[activeRoom].roomID
        sendData({
            task: "input",
            roomID: ID,
            content: payload,
        })
    }

    useEffect(() => {
        chatboxBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [roomList]);

    client.onmessage = (byteString) => {
        const data = JSON.parse(byteString.data);
        const task = data[0];

        switch (task) {
            case "loaded": {
                const roomID = data[1];
                const roomName = data[2];
                const payload = data[3];
                setRoomList([
                    ...roomList,
                    {
                        targetUser: roomName,
                        roomID: roomID,
                        messages: [...payload],
                    },
                ]);
                setActiveRoom(roomList.length);
                break;
            }
            case "update": {
                const roomID = data[1];
                const payload = data[2];
                setRoomList(roomList.map((room) => {
                    if (room.roomID === roomID) {
                        const newRoom = {
                            ...room,
                            messages: [...room.messages, ...payload],
                        };
                        return newRoom;
                    }
                    else {
                        return room;
                    }
                }));
                break;
            }
            case "cleared": {
                const roomID = data[1];
                setRoomList(roomList.map((room) => {
                    if (room.roomID === roomID) {
                        return {
                            ...room,
                            messages: [],
                        };
                    }
                    else {
                        return room;
                    }
                }));
                break;
            }
            case "status": {
                const payload = data[1];
                setStatus(payload);
                break;
            }
            default:
                break;
        }
    }

    const login = (username) => {
        setUser(username);
    }

    const generateRoomId = (targetUser) => {
        const order = [user, targetUser].sort();
        return `${order[0]}_${order[1]}`;
    }

    const openRoom = (newTargetUser) => {
        const roomID = generateRoomId(newTargetUser);
        sendData({
            task: "load",
            roomID: roomID,
            roomName: newTargetUser,
        });
    }

    const removeRoom = (removeKey) => {
        let newRoomList = [];
        roomList.forEach((room, key) => {
            if (key !== removeKey) {
                newRoomList.push(room);
            }
        })
        setRoomList(newRoomList);
        if (activeRoom >= newRoomList.length) {
            setActiveRoom(newRoomList.length - 1);
        }
    }

    const changeRoom = (newActiveRoom) => {
        setActiveRoom(newActiveRoom);
    }

    const clearMessages = () => {
        const ID = roomList[activeRoom].roomID
        sendData({
            task: "clear",
            roomID: ID,
        })
    }

    const showStatus = (type, msg) => {
        setStatus({ type: type, msg: msg });
    }

    return {
        user, setUser, login,
        roomList, openRoom, removeRoom,
        activeRoom, changeRoom,
        status, sendMessage, clearMessages,
        showStatus,
        chatboxBottomRef,
    }
}

export default useChat