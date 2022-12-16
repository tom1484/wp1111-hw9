import { gql } from '@apollo/client'

export const CHATROOM_QUERY = gql`
query getChatRoom($chatRoomName: String!, $userName: String!) {
    chatRoom(chatRoomName: $chatRoomName, userName: $userName) {
        status
        chatRoom {
            name
            userList
            messages {
                sender
                content
            }
        }
    }
}
`