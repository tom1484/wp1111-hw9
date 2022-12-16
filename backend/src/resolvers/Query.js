const Query = {
    async chatRoom(_, { chatRoomName, userName }, { ChatRoomModel }, info) {

        let result = {
            status: "not found",
            chatRoom: null,
        }

        await ChatRoomModel.findOne({
            name: chatRoomName,
        }).then((chatRoom) => {
            if (chatRoom) {
                if (chatRoom.userList.indexOf(userName) === -1) {
                    result.status = "not authorized";
                } else {
                    result.status = "found";
                    result.chatRoom = chatRoom;
                }
            }
        })

        return result;
    },
};

export default Query;