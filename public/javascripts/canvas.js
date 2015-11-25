$(function(){
    //Declaring Global Variables
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    var gameon = true;







    move = function(char){
        if(char.left)
            char.xPosition += char.speed;
        if(char.right)
            char.xPosition -= char.speed;
        if(char.up)
            char.yPosition -= char.speed;
        if(char.down)
            char.yPosition += char.speed;
    };

    logic = function(){
        chars.forEach(function(char){
            move(char);
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

    main = function(){
        //console.log("main game loop")
        logic();

        render();

        requestAnimationFrame(main);
    };

    main();
});

var socket = io.connect();
var LEFT_KEY_CODE = 68;
var RIGHT_KEY_CODE = 65;
var UP_KEY_CODE = 87;
var DOWN_KEY_CODE = 83;
var down = [];
var chars = [];

var character =
{
    id: 0,
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
        else if(code == RIGHT_KEY_CODE){
            character.right = true;
        }
        else if(code == LEFT_KEY_CODE){
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
        else if(code == RIGHT_KEY_CODE){
            character.right = false;
        }
        else if(code == LEFT_KEY_CODE){
            character.left = false;
        }
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
        speed: 5,
        xPosition: 150,
        yPosition: 100,
        up: false,
        down: false,
        left: false,
        right: false,
    };
    chars.push(newCharacter);
});