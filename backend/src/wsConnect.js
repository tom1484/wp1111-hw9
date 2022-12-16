// import Message from "./models/Message"
import ChatRoom from "./models/ChatRoom";

const sendData = (data, ws) => {
    ws.send(JSON.stringify(data));
};

const sendBroadcastData = (data, wss) => {
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify(data));
    });
};

const sendStatus = (content, ws) => {
    ws.send(JSON.stringify(["status", content]));
};

const updateChatRoom = (roomID, content) => {
    return ChatRoom.findOneAndUpdate(
        { roomID: roomID },
        { '$push': { messages: content } },
    ).exec();
};

const loadChatRoom = (roomID) => {
    return ChatRoom.findOneAndUpdate(
        { roomID: roomID }, {},
        { upsert: true, new: true },
    ).exec();
}

const clearChatRoom = (roomID) => {
    return ChatRoom.findOneAndUpdate(
        { roomID: roomID }, { messages: [] },
    ).exec();
}

export default {
    onMessage: (wss, ws) => (
        async (byteString) => {
            const data = JSON.parse(byteString.data);
            const task = data.task;
            switch (task) {
                case "input": {
                    const { roomID, content } = data;
                    updateChatRoom(roomID, content).then(() => {
                        console.log("Message saved");
                        // sendData(["update", roomID, [content]], ws);
                        sendBroadcastData(["update", roomID, [content]], wss);
                        sendStatus({
                            type: "success",
                            msg: "Message sent",
                        }, ws);
                    }).catch(() => {
                        console.log("Message not saved");
                        sendStatus({
                            type: "error",
                            msg: "Message not sent",
                        });
                    });
                    break;
                }
                case "load": {
                    const { roomID, roomName } = data;
                    loadChatRoom(roomID).then((chatRoom) => {
                        const messages = chatRoom.messages;
                        sendData(["loaded", roomID, roomName, messages], ws);
                        sendStatus({
                            type: "success",
                            msg: "Messages loaded",
                        }, ws);
                    }).catch(() => {
                        sendStatus({
                            type: "error",
                            msg: "Messages not loaded",
                        }, ws);
                    });
                    break;
                }
                case "clear": {
                    const { roomID } = data;
                    clearChatRoom(roomID).then(() => {
                        console.log("Messages cleared");
                        sendBroadcastData(["cleared", roomID], wss);
                        sendStatus({
                            type: "success",
                            msg: "Messages cleared",
                        }, ws);
                    }).catch(() => {
                        console.log("Message not cleared");
                        sendStatus({
                            type: "error",
                            msg: "Cannot clear messages",
                        });
                    });
                    break;
                }
                default:
                    break;
            }
        }
    )
};