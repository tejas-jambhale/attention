const express = require('express');
const credentials = require('./credentials');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeaves, getRoomUsers, changeItem } = require('./utils/users'); 

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const RoomService = require('./RoomService')(io);
app.use(express.static(path.join(__dirname, 'client')));

io.sockets.on('connection', RoomService.listen);
io.sockets.on('error', e => console.log(e));

io.on('connection', socket => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
      });
    socket.on('joinroom', ({username, room, type, allowed}) => {
        const user = userJoin(socket.id, username, room, type, allowed);
        socket.join(user.room);

        //send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

        //welcome current user
        socket.emit('message', formatMessage('Chat Bot', 'Welcome to chatcord')); //send to single client

        //user connects
        socket.broadcast.to(user.room).emit('message', formatMessage('Chat Bot', `${user.username} has joined the chat`)); //send to all clients except the one connecting
        socket.on('changeArray', id => {
            changeItem(id);
            const user = getCurrentUser(id);
            if(user.allowed)
                socket.to(user.id).emit('message', formatMessage('Chatbot', 'You can now send messages.'));
            else
                socket.to(user.id).emit('message', formatMessage('Chatbot', 'You are restricted from sending messages.'));
        });

        socket.on('requesting', (requestedBy) => {
            const users = getRoomUsers(user.room);
            users.map((user) => {
                if(user.type==="teacher"){
                    socket.to(user.id).emit('message', formatMessage('Chatbot', `${requestedBy} is requesting to send messages`));
                }
            })
        })
    });

    //listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        if(user.allowed === true)
            io.to(user.room).emit('message', formatMessage(user.username, msg));
        else{
            socket.emit('message', formatMessage('Chatbot', "You are not allowed to send messages. Please raise your hand from the button."));
        }
    });

    //user disconnects
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage('Chat Bot', `${user.username} has left the chat`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

    // io.emit() //send to everyone
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`server running on port ${PORT}`));