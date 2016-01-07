$(function(){
    //Declaring Global Variables
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');

    //Image loading
    var imageObj = new Image();
    imageObj.src = "http://www.otter-world.com/wp-content/uploads/Otter_Standing_Showing_Teeth_600.jpg";
    var bulImg = new Image();
    bulImg.src = "http://www.clker.com/cliparts/6/W/n/M/T/D/rock-outline-turn.svg"
    var mousePos = {x: 0, y: 0};
    var clamimg = new Image();
    clamimg.src = "http://school.discoveryeducation.com/clipart/images/shell.gif"



    //eventListeners
    context.canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(canvas, evt);
        //console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
    }, false);

    canvas.addEventListener('click', function(evt) {
        console.log('Click heard at ' + evt.pageX + ' ' + evt.pageY);
        var click = {x: evt.pageX, y: evt.pageY};
        projectile(click);
    }, false);


    window.addEventListener("beforeunload", function (event) {
        socket.emit('disconnect');                                          //just to make sure that we send a disconnect no matter what
    });

        //Main game logic functions
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

    ProjCollision = function(bul, index){
        chars.forEach(function(char){
            if(char.xPosition < bul.xPos && (char.xPosition + char.width) > bul.xPos){
                if(char.yPosition < bul.yPos && (char.yPosition + char.height) > bul.yPos){
                    if(bul.shooterId != char.id){
                        console.log('HIT');
                    }
                    else{
                        console.log('friendly fire ignored');
                    }
                }
            }
        })
    };

    ProjMove = function(bul, delta){
        bul.xPos += bul.xSpeed * delta;
        bul.yPos += bul.ySpeed * delta;
    };

    ProjAge = function(bul, index){
        age = Date.now() - bul.age;
        if(age > 3000){
            proj.splice(index, 1);
        }
    };

    logic = function(delta){
        chars.forEach(function(char){
            move(char, delta);
        });

        proj.forEach(function(bul, index, array){
            ProjMove(bul, delta);
            ProjAge(bul, index);
            ProjCollision(bul, index);
        })
    };
    resetCanvas = function() {
        context.canvas.width  = window.innerWidth;
        context.canvas.height = window.innerHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    drawChar = function(char){
        //console.log(char.rotation);
        //console.log('drawing char ' + char.id + ' at rotation ' + char.rotation);
        context.translate( char.xPosition + char.width / 2, char.yPosition + char.height / 2 );
        context.rotate(-char.rotation);
        context.translate( -char.width / 2, - char.height / 2 );
        context.rect(0, 0, char.width, char.height);
        context.drawImage(imageObj, 0, 0, 100,100);
        context.translate( char.width / 2, char.height / 2 );
        context.rotate(char.rotation);
        context.translate( -(char.xPosition +  char.width / 2), -(char.yPosition + char.height / 2));
        context.stroke();
    };

    drawBul = function(bul) {
        context.drawImage(bulImg, bul.xPos, bul.yPos, 20, 20);
    };

    render = function(){
        //console.log("rendering");

        resetCanvas();
        chars.forEach(function(char){
            drawChar(char);
        });
        proj.forEach(function(bul){
            drawBul(bul);
        });
        //draw the clam "goal"
        if(clam != null) {
            context.drawImage(clamimg, clam.xPosition, clam.yPosition, clam.width, clam.height);
        };


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
var clam = {};
var socket = io.connect();
var RIGHT_KEY_CODE = 68;
var LEFT_KEY_CODE = 65;
var UP_KEY_CODE = 87;
var DOWN_KEY_CODE = 83;
var down = [];                              //to keep track of keys down
var chars = [];                             //list of characters
var proj = [];                              //list of projectiles

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
    if (diffX < 0)
        return (3.14159 + Math.atan(tanner));
    else
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
            ForceSync(character);
        }
        else if(code == DOWN_KEY_CODE){
            character.down = false;
            ForceSync(character);
        }
        else if(code == LEFT_KEY_CODE){
            character.right = false;
            ForceSync(character);
        }
        else if(code == RIGHT_KEY_CODE){
            character.left = false;
            ForceSync(character);
        }
        socket.emit('!key', code)

        console.log(code + " up");
    }
});



//helper functions
ForceSync = function(char){
    socket.emit('syncMe', char);
};



getIndexFromId = function (id){
    for(var i = 0, charLen = chars.length; i<charLen; i++ ){
        if(chars[i].id == id){
            return i;
        }
    }
    return -1;
}

projectile = function(click){
    var xex = Math.cos(character.rotation);
    var yex = Math.sin(character.rotation);
    var xspeed;
    var yspeed
    if(yex > 0 && xex > 0){
        yspeed = 400/(xex + yex) * -yex;             //shoul calc the speed for x and y if total is 400
        xspeed = 400/(xex + yex) * xex;
    }
    else if(yex > 0 && xex <= 0)
    {
        yspeed = 400/(-xex + yex) * -yex;             //shoul calc the speed for x and y if total is 400
        xspeed = 400/(-xex + yex) * xex;
    }
    else if(yex <= 0 && xex > 0)
    {
        yspeed = 400/(xex + -yex) * -yex;             //shoul calc the speed for x and y if total is 400
        xspeed = 400/(xex + -yex) * xex;
    }
    else if(yex <= 0 && xex <= 0)
    {
        yspeed = 400/(-xex + -yex) * -yex;             //shoul calc the speed for x and y if total is 400
        xspeed = 400/(-xex + -yex) * xex;
    }
    console.log('here we create a new projectile with x = ' + xspeed + ' and y speed ' + yspeed);

    CreateProjectile(xspeed, yspeed);

};

CreateProjectile = function(xspeed, yspeed){
    var xPos = character.xPosition + character.width/2;
    var yPos = character.yPosition + character.height/2;
    var projectile  = {
        xPos: xPos,
        yPos: yPos,
        xSpeed: xspeed,
        ySpeed: yspeed,
        age: Date.now(),
        shooterId: 0,
    };
    proj.push(projectile);
    socket.emit('bang', projectile);

};

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

socket.on('syncHim', function(char){
    var ind = getIndexFromId(char.id);
    if(ind != -1)
    {
        chars[ind] = char;
        console.log('character synched successfully ' + char.id)
    }
    else
    {
        console.log('what char?');
    }
});

socket.on('pow', function(bul){
    //console.log('POW!');
    proj.push(bul);
});

socket.on('leaving', function (id){
    var ind = getIndexFromId(id);
    if(ind != -1)
    {
        chars.splice(ind, 1);
        console.log('character logged out')
    }
    else
    {
        console.log('Tried to disconnect a user that didnt exist');
    }
});


socket.on("clamPosition", function (newClam){
    console.log('lol worked ' +  newClam.xPosition + ' ' + newClam.yPosition);
    clam = newClam;
});