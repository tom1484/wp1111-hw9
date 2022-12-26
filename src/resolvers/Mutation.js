const Mutation = {
    async createChatRoom(_, { inputData }, { ChatRoomModel }) {
        const { chatRoomName, userList } = inputData;

        let result = {
            status: "success",
            chatRoom: null,
        };
        await ChatRoomModel.insertMany([{
            name: chatRoomName,
            userList: userList,
            messages: [],
        }]).then((chatRooms) => {
            result.chatRoom = chatRooms[0];
        })

        return result;
    },
    async clearMessages(_, { inputData }, { ChatRoomModel, pubsub }) {
        const { chatRoomName } = inputData;

        let userList;
        await ChatRoomModel.findOneAndUpdate({
            name: chatRoomName,
        }, {
            messages: [],
        }).then((chatRoom) => {
            userList = chatRoom.userList;
        });

        for (let user of userList) {
            pubsub.publish(`messagesCleared`, user, chatRoomName);
        }

        return true;
    },
    async addMessage(_, { inputData }, { ChatRoomModel, pubsub }) {
        const { chatRoomName, sender, content } = inputData;
        const newMessage = {
            sender: sender,
            content: content,
        };

        let userList;
        await ChatRoomModel.findOneAndUpdate({
            name: chatRoomName,
        }, {
            "$push": {
                messages: newMessage
            }
        }).then((chatRoom) => {
            if (chatRoom) {
                userList = chatRoom.userList;
            }
        });

        for (let user of userList) {
            console.log(user)
            pubsub.publish(`newMessage`, user, {
                chatRoomName: chatRoomName,
                message: newMessage
            });
        }
        return true;
    },
};

export default Mutation;