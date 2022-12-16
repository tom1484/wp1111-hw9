import { gql } from '@apollo/client';

export const NEW_MESSAGE_QUERY = gql`
subscription getNewMessage($receiver: String!) {
    newMessage(receiver: $receiver) {
        chatRoomName
        message {
            sender
            content
        }
    }
}
`;

export const MESSAGES_CLEARED_QUERY = gql`
subscription getMessagesCleared($receiver: String!) {
    messagesCleared(receiver: $receiver)
}
`