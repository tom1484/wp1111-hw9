import { gql } from '@apollo/client'

export const SEND_MESSAGE_QUERY = gql`
mutation sendMessage($chatRoomName: String!, $sender: String!, $content: String!) {
    addMessage(
        inputData: {
            chatRoomName: $chatRoomName
            sender: $sender
            content: $content
        }
    )
}
`

export const CLEAR_MESSAGES_QUERY = gql`
mutation clearMessages($chatRoomName: String!) {
    clearMessages(
        inputData: {
            chatRoomName: $chatRoomName
        }
    )
}
`

export const CREATE_CHATROOM_QUERY = gql`
mutation createChatRoom($chatRoomName: String!, $userList: [String!]!) {
    createChatRoom(
        inputData: {
            chatRoomName: $chatRoomName
            userList: $userList
        }
    ) {
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