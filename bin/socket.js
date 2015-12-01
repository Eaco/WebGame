/**
 * Created by eaco on 24/11/15.
 */
var chars = [];
module.exports = function (io) {
    console.log('loading socket.io')
    io.sockets.on('connection', function (socket) {
        console.log('connection from socket: ' + socket.id);
        var character =
        {
            id: socket.id,
            height: 100,
            width: 100,
            speed: 255,
            xPosition: 150,
            yPosition: 100,
            up: false,
            down: false,
            left: false,
            right: false,
        };
        chars.push(character);

        socket.broadcast.emit('newchar', socket.id);
        console.log('what is going on here');
        socket.broadcast.emit('soundOff');

        socket.on('loaded', function(){
            socket.emit('currentCharacters', chars, socket.id);
        });

        socket.on('sounder', function(char){
            console.log('attempting to update player with Id: ' + socket.id);
            char.id = socket.id;
            console.log(char);
            for(var i = 0, charLen = chars.length; i<charLen; i++ ){
                if(chars[i].id == socket.id){1
                    console.log('character with id: ' + socket.id + ' being updated successfully')
                    chars[i] = char;
                }
            }
        });

        socket.on('connect', function () {
            console.log('Connecting to client');
        });

        socket.on('key', function(key){
            socket.broadcast.emit('keyDown', key,socket.id)
        });
        socket.on('!key', function(key){
            socket.broadcast.emit('keyUp', key, socket.id)
        });

        socket.on('disconnect', function () {
            var rem = getIndexFromId(socket.id);
            if(rem != -1) {
                chars.splice(rem, 1);
                console.log('user disconnected');
            }
            else {
                console.log('User not disconnected properly')
            }
        });


        getIndexFromId = function (id){
            for(var i = 0, charLen = chars.length; i<charLen; i++ ){
                if(chars[i].id == id){
                    return i;
                }
            }
            return -1;
        }
    });
}