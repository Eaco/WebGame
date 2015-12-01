$(function(){
    //Declaring Global Variables
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    var gameon = true;







    move = function(char, delta){
        if(char.left && char.xPosition >= 0)
            char.xPosition += char.speed * delta;
        if(char.right && char.xPosition <= context.canvas.width)
            char.xPosition -= char.speed * delta;
        if(char.up)
            char.yPosition -= char.speed * delta;
        if(char.down)
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
        context.rect(char.xPosition, char.yPosition, char.width, char.height);
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
    main = function(){
        //console.log("main game loop")
        now = Date.now();
        delta = (now - then)/1000;
        then = now;
        logic(delta);

        render();

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
};

chars.push(character);

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
    };
    chars.push(newCharacter);
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