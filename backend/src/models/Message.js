import mongoose from 'mongoose';


const MessageSchema = mongoose.Schema({
    name: String,
    message: String,
});
const Message = mongoose.model("Message", MessageSchema);

export default Message;