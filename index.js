// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
    var addedUser = false;
    console.info('connection ok');
    console.info(socket.id);


    socket.emit('message', {
        message: 'server login'
    },(data) => {
        console.info('message server ack', data);
    });


    socket.on('server-info', (data, callback) => {
        console.info('server-info', data);

        var result = {};
        let type = data.type || 'server';
        let namespace = data.namespace || '/';
        let room = data.namespace || '';
        switch(type) {
            case 'socketid':
                result = socket.id;

                if (callback)
                    callback({'type': type, 'data': result});

                break;
            case 'socket':
                result = socket;
                if (callback)
                    callback({'type': type, 'data': result});

                break;

            case 'sockets':
                //io.sockets.sockets是一个所有在线客户端的socket数组
                result = io.sockets.sockets;
                console.info('io.sockets.sockets', result);
                if (callback)
                    callback({'type': type, 'data': result});

                break;

            case 'rooms':
                let rooms = Object.keys(socket.rooms);
                result = rooms;
                console.info(rooms);
                if (callback)
                    callback({'type': type, 'data': result});

                break;

            case 'clients':
                io.clients((error, clients) => {
                    if (error)
                        throw error;

                    result = clients;
                    console.log('clients',clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]

                    if (callback)
                        callback({'type': type, 'data': result});
                });

                //console.info(result,result);
                break;

            case 'clients2':

                io.of('/').clients((error, clients) => {
                    if (error)
                        throw error;
                    console.log('room1',clients); // => [Anw2LatarvGVVXEIAAAD]
                });
                //console.info(result,result);
                break;

            case 'clients-namespace':

                io.of('/chat').clients((error, clients) => {
                    if (error)
                        throw error;
                    console.log('room1',clients); // => [Anw2LatarvGVVXEIAAAD]
                });
                //console.info(result,result);
                break;

            case 'clients-room1':

                io.of('/').in('room1').clients((error, clients) => {
                    if (error)
                        throw error;
                    console.log('room1',clients); // => [Anw2LatarvGVVXEIAAAD]
                });
                //console.info(result,result);
                break;

            case 'clients-room2':

                io.in('room2').clients((error, clients) => {
                    if (error)
                        throw error;
                    console.log('room1',clients); // => [Anw2LatarvGVVXEIAAAD]
                });
                //console.info(result,result);
                break;

            default:
                result = socket;
                if (callback)
                    callback({'type': type, 'data': result});

                break;
        }

    });


    socket.on('server-debug', (data, callback) => {
        console.info('server-info', data);

        var result = {};
        let type = data.type || 'server';
        switch(type) {
            case 'emit':
                result = socket.id;

                socket.emit("server-debug",data, function (data) {
                   console.info('server-debug emit ack');
                });

                break;

            default:
                result = socket;
                if (callback)
                    callback({'type': type, 'data': result});

                break;
        }

    });



    socket.on('message', (data, callback) => {
        console.info('data', data);
        data.type = 'server';

        if (callback)
            callback(data)

        socket.emit("broadcast", {id: "3232322"}, function (data) {
            console.info('message message success', data)
        });
    });


    socket.on('broadcast', (data, callback) => {
        data.type = 'form server';

        if (callback)
            callback(data)

        socket.broadcast.emit("broadcast",{ message : "this is broadcast from server"},);
    });


    socket.on('join-room', (data, callback) => {
        console.log('join room',data);
        data.type = 'form server';
        let room = data.room;

        if(callback)
            callback(data);

        socket.join(room, () => {
            let rooms = Object.keys(socket.rooms);
            console.log(rooms); // [ <socket.id>, 'room 237' ]
            console.info('join-room message success', data)
        });
    });


    socket.on('leave-room', (data, callback) => {
        console.log('leave room',data);
        data.type = 'form server';
        let room = data.room;

        if(callback)
            callback(data);

        socket.leave(room, () => {
            let rooms = Object.keys(socket.rooms);
            console.log(rooms); // [ <socket.id>, 'room 237' ]
            console.info('leave-room message success', data)
        });
    });


    socket.on('say-room', (data, callback) => {
        console.log('say to room',data);
        data.type = 'form server';
        let room = data.room;
        let msg = data.message;

        if(callback)
            callback(data);

        //emit
        socket.to(room).emit('message', data);
        console.info('say-room message success', data)
    });


    socket.on('say-user', (data, callback) => {
        console.log('say to someone',data);
        data.type = 'form server';
        let id = data.user;
        let msg = data.message;

        if(callback)
            callback(data);

        //emit
        socket.to(id).emit('message', data);
        console.info('say-user message success', data)
    });


    socket.on('say-user2', (data, callback) => {
        console.log('say2 to someone',data);
        data.type = 'form server';
        let id = data.user;
        let msg = data.message;

        if(callback)
            callback(data);

        //emit
        if (io.sockets.connected[id]) {
            io.sockets.connected[id].emit('message', data);
        }
        //socket.to(id).emit('message', data);
        console.info('say-user message success', data)

    });


    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        console.info('disconnect ok');
    });
});
