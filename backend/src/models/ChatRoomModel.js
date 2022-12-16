import mongoose from 'mongoose';


const ChatRoomSchema = mongoose.Schema({
    name: String,
    userList: [String],
    messages: [{
        sender: String,
        content: String,
    }],
});
const ChatRoomModel = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRoomModel;