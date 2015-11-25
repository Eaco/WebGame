/**
 * Created by eaco on 24/11/15.
 */
module.exports = function (io) {
    console.log('loading socket.io')
    io.sockets.on('connection', function (socket) {
        console.log('connection from socket: ' + socket.id);
        var chars = [];
        var character =
        {
            id: socket.id,
            height: 100,
            width: 100,
            speed: 5,
            xPosition: 150,
            yPosition: 100,
            up: false,
            down: false,
            left: false,
            right: false,
        };
        chars.push(character);
        socket.broadcast.emit('newchar', socket.id);

        socket.on('connect', function () {
            console.log('Connecting to client');
        });
        socket.on('key', function(key){
            console.log(key);
            //console.log(chars);
        });
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}