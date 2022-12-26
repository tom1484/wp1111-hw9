const Subscription = {
    newMessage: {
        subscribe: (_, { receiver }, { pubsub }) => {
            return pubsub.subscribe(`newMessage`, receiver);
        },
        resolve: (payload) => {
            return payload;
        },
    },
    messagesCleared: {
        subscribe: (_, { receiver }, { pubsub }) => {
            return pubsub.subscribe(`messagesCleared`, receiver);
        },
        resolve: (payload) => {
            return payload;
        }
    }
};

export default Subscription;