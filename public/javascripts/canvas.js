$(function(){
    //Declaring Global Variables
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var imageObj = new Image();
    imageObj.src = "http://www.otter-world.com/wp-content/uploads/Otter_Standing_Showing_Teeth_600.jpg";
    var mousePos = {x: 0, y: 0};
    context.canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
        //console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
    }, false);

    move = function(char, delta){
        if(char.left && char.xPosition <= (context.canvas.width - char.width))
            char.xPosition += char.speed * delta;
        if(char.right && char.xPosition >= 0)
            char.xPosition -= char.speed * delta;
        if(char.up && char.yPosition  >= 0)
            char.yPosition -= char.speed * delta;
        if(char.down && char.yPosition <= context.canvas.height - char.height)
        char.yPosition += char.speed * delta;
    };

    logic = function(delta){
        chars.forEach(function(char){
            move(char, delta);
        });
    };
    resetCanvas = function() {
        context.canvas.width  = window.innerWidth;
        context.canvas.height = window.innerHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    drawChar = function(char){
        //console.log(char.rotation);
        console.log('drawing char ' + char.id + ' at rotation ' + char.rotation);
        context.translate( char.xPosition + char.width / 2, char.yPosition + char.height / 2 );
        context.rotate(-char.rotation);
        context.translate( -char.width / 2, - char.height / 2 );
        context.rect(0, 0, char.width, char.height);1
        context.drawImage(imageObj, 0, 0, 100,100);
        context.translate( char.width / 2, char.height / 2 );
        context.rotate(char.rotation);
        context.translate( -(char.xPosition), -(char.yPosition ));
        context.stroke();
    };

    render = function(){
        //console.log("rendering");

        resetCanvas();
        chars.forEach(function(char){
            drawChar(char);
        });


    };
    var now = Date.now();
    var delta;
    var then = Date.now();

    var rotateRefresh = 0;
    var ROTATE_REFRESH_RATE = 5;

    main = function(){
        //console.log("main game loop")
        now = Date.now();
        chars[0].rotation = convertToRadians(mousePos);
        delta = (now - then)/1000;
        then = now;
        logic(delta);

        render();

        if(rotateRefresh == ROTATE_REFRESH_RATE){
            socket.emit('rotate', character.rotation);
            rotateRefresh = 0;
        }
        else{
            rotateRefresh++;
        }
        requestAnimationFrame(main);

    };
    socket.emit('loaded');
    main();
});

var socket = io.connect();
var RIGHT_KEY_CODE = 68;
var LEFT_KEY_CODE = 65;
var UP_KEY_CODE = 87;
var DOWN_KEY_CODE = 83;
var down = [];
var chars = [];

var character =
{
    id: 0,
    height: 100,
    width: 100,
    speed: 255,
    xPosition: 150,
    yPosition: 100,
    up: false,
    down: false,
    left: false,
    right: false,
    rotation: 0,
};

chars.push(character);


// CLIENT INPUT HERER
getMousePos =  function(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

convertToRadians = function (mouse){
    //console.log('Getting rotation of player')
    var diffX = mouse.x - (character.xPosition + character.width / 2);
    var diffY = (character.yPosition + character.height / 2) - mouse.y;
    var tanner = diffY / diffX;
    return Math.atan(tanner);
};


$(document).keydown(function(e){
    var code = e.keyCode;
    if (!down[code]){
        down[code] = true;
        if(code == UP_KEY_CODE){
            character.up = true;
        }
        else if(code == DOWN_KEY_CODE){
            character.down = true;
        }
        else if(code == LEFT_KEY_CODE){
            character.right = true;
        }
        else if(code == RIGHT_KEY_CODE){
            character.left = true;
        }
        socket.emit('key', code);

        console.log(code + " Down");
    }
});

$(document).keyup(function(e){
    var code = e.keyCode;
    if (down[code]){
        down[code] = false;
        if(code == UP_KEY_CODE){
            character.up = false;
        }
        else if(code == DOWN_KEY_CODE){
            character.down = false;
        }
        else if(code == LEFT_KEY_CODE){
            character.right = false;
        }
        else if(code == RIGHT_KEY_CODE){
            character.left = false;
        }
        socket.emit('!key', code)

        console.log(code + " up");
    }
});



//helper functions
getIndexFromId = function (id){
    for(var i = 0, charLen = chars.length; i<charLen; i++ ){
        if(chars[i].id == id){
            return i;
        }
    }
    return -1;
}

//Socket logic here

socket.on('newchar', function(id){
    console.log('joiner: ' + id);
    var newCharacter =
    {
        id: id,
        height: 100,
        width: 100,
        speed: 255,
        xPosition: 150,
        yPosition: 100,
        up: false,
        down: false,
        left: false,
        right: false,
        rotation: 0,
    };
    chars.push(newCharacter);
});

socket.on('rotationToClient', function(rotation, id){
    console.log('reaching rotation from ' + id);
    var ind = getIndexFromId(id);
    if(chars[ind] != null){
        chars[ind].rotation = rotation;
    }
});

socket.on('currentCharacters', function(serverChars, id){
    console.log('totes worked');
    serverChars.forEach(function(char){
        console.log(char.id);
        if(char.id != id) {
            chars.push(char);
        }
    })
});
socket.on('soundOff', function(){
    console.log('soundOff');
    socket.emit('sounder', character);
});

socket.on('keyDown', function(key, id){
    console.log(id + '  down  ' + key);
    for(var i = 0, charLen = chars.length; i<charLen; i++ ){
        if(chars[i].id == id){

            if(key == UP_KEY_CODE){
                chars[i].up = true;
            }
            else if(key == DOWN_KEY_CODE){
                chars[i].down = true;
            }
            else if(key == LEFT_KEY_CODE){
                chars[i].right = true;
            }
            else if(key == RIGHT_KEY_CODE){
                chars[i].left = true;
            }
        }
    }
});

socket.on('keyUp', function(key, id){
    console.log(id + '  up  ' + key);
    for(var i = 0, charLen = chars.length; i<charLen; i++ ){
        if(chars[i].id == id){

            if(key == UP_KEY_CODE){
                chars[i].up = false;
            }
            else if(key == DOWN_KEY_CODE){
                chars[i].down = false;
            }
            else if(key == LEFT_KEY_CODE){
                chars[i].right = false;
            }
            else if(key == RIGHT_KEY_CODE){
                chars[i].left = false;
            }
        }
    }
});