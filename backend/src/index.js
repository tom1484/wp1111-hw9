import server from './server';
import mongo from './mongo';


mongo.connect();


const port = process.env.PORT || 4000;
server.listen({ port }, () => {
    console.log(`Server ready at http://localhost:${port}`);
    console.log(`Subscriptions ready at ws://localhost:${port}`);
});
