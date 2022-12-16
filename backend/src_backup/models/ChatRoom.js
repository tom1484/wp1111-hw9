import mongoose from 'mongoose';


const ChatRoomSchema = mongoose.Schema({
    roomID: String,
    messages: [{
        name: String,
        message: String,
    }],
});
const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRoom;