/**
 * Created by eaco on 24/11/15.
 */
var chars = [];
module.exports = function (io) {
    console.log('loading socket.io');
    var clam =
    {
        xPosition: 0,
        yPosition: 0,
        height: 100,
        width: 100,
        open: true
    };

    getRandom = function(min, max) {
        return min + Math.random() * (max - min);
    };

    randomclam = function() {
        clam.xPosition = getRandom(0, 1920);
        clam.yPosition = getRandom(0, 1080);
    };


    randomclam();
    io.sockets.on('connection', function (socket) {
        console.log('connection from socket: ' + socket.id);
        socket.emit("clamPosition", clam);
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
            rotation: 0
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
                if(chars[i].id == socket.id){
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
            console.log('broadcasting the leaving message');
            socket.broadcast.emit('leaving', socket.id);
        });

        socket.on('rotate', function(rotation){
            var ind = getIndexFromId(socket.id);
            chars[ind].rotation = rotation;
            socket.broadcast.emit('rotationToClient', rotation, socket.id);
        });

        socket.on('claiming', function(){
            console.log('point being claimed');
            randomclam();
            io.sockets.emit('clamPosition', clam);
        });

        socket.on('syncMe', function(char){
            var sync = getIndexFromId(socket.id);
            if(sync != -1){
                var id = chars[sync].id;
                chars[sync] = char;         //this sets ID to zero. Dammit
                chars[sync].id = id;
                socket.broadcast.emit('syncHim', char);
            }
            else{
                console.log('Can\'t synch a char that doesn\'t exist');
            }
        });
        
        socket.on('bang', function (proj) {
            console.log('pow');
            proj.shooterId = socket.id;
           socket.broadcast.emit('pow', proj);
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
};