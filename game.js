const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

canvas.width=innerWidth;
canvas.height=innerHeight;

let groundY=canvas.height-120;

let running=true;
let score=0;
let best=localStorage.getItem("SBA_BEST")||0;

document.getElementById("best").innerHTML=best;


// SOUND

let audio;

function sound(type){

    if(!audio)
        audio=new AudioContext();

    let o=audio.createOscillator();
    let g=audio.createGain();

    o.connect(g);
    g.connect(audio.destination);

    o.frequency.value=
    type==="jump"?600:120;

    g.gain.value=0.15;

    o.start();
    o.stop(audio.currentTime+0.15);
}


// WORLD

let speed=7;
let roadMove=0;
let mountainMove=0;
let cloudMove=0;


// BIKE

let bike={
    x:120,
    y:groundY-70,
    w:90,
    h:60,
    vy:0,
    gravity:.8,
    jump:-15,
    ground:true
};


// OBSTACLES

let nails=[];


// BACKGROUND

function background(){

    let sky=ctx.createLinearGradient(0,0,0,canvas.height);

    sky.addColorStop(0,"#55c9ff");
    sky.addColorStop(1,"white");

    ctx.fillStyle=sky;
    ctx.fillRect(0,0,canvas.width,canvas.height);


    // clouds

    cloudMove+=.3;

    ctx.fillStyle="white";

    for(let i=0;i<5;i++){

        let x=(i*300-cloudMove)%(canvas.width+300);

        ctx.beginPath();

        ctx.arc(x,100,30,0,Math.PI*2);
        ctx.arc(x+35,105,25,0,Math.PI*2);
        ctx.arc(x+65,100,30,0,Math.PI*2);

        ctx.fill();

    }


    // mountains

    mountainMove+=speed*.05;

    ctx.fillStyle="#607d8b";

    ctx.beginPath();

    ctx.moveTo(0,groundY);

    for(let x=0;x<canvas.width+300;x+=200){

        ctx.lineTo(
            x-mountainMove,
            groundY-180
        );

        ctx.lineTo(
            x+100-mountainMove,
            groundY
        );
    }

    ctx.fill();


    ctx.fillStyle="#37474f";

    ctx.beginPath();

    ctx.moveTo(0,groundY);

    for(let x=0;x<canvas.width+300;x+=250){

        ctx.lineTo(
            x-mountainMove*2,
            groundY-260
        );

        ctx.lineTo(
            x+120-mountainMove*2,
            groundY
        );
    }

    ctx.fill();

}



// BIKE DRAW

function drawBike(){

    let x=bike.x;
    let y=bike.y;


    // wheels

    ctx.fillStyle="black";

    ctx.beginPath();
    ctx.arc(x+20,y+60,18,0,Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x+70,y+60,18,0,Math.PI*2);
    ctx.fill();


    // rims

    ctx.strokeStyle="silver";
    ctx.lineWidth=4;

    ctx.beginPath();
    ctx.arc(x+20,y+60,10,0,Math.PI*2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x+70,y+60,10,0,Math.PI*2);
    ctx.stroke();


    // frame

    ctx.strokeStyle="red";
    ctx.lineWidth=6;

    ctx.beginPath();

    ctx.moveTo(x+20,y+60);
    ctx.lineTo(x+45,y+25);
    ctx.lineTo(x+70,y+60);
    ctx.lineTo(x+20,y+60);

    ctx.stroke();


    // seat

    ctx.fillStyle="black";
    ctx.fillRect(x+35,y+18,25,6);


    // handle

    ctx.beginPath();
    ctx.moveTo(x+45,y+25);
    ctx.lineTo(x+60,y+10);
    ctx.stroke();

}



// ROAD

function road(){

    ctx.fillStyle="#444";

    ctx.fillRect(
        0,
        groundY,
        canvas.width,
        120
    );


    ctx.fillStyle="#aaa";

    for(let i=0;i<canvas.width;i+=60){

        ctx.fillRect(
            i-roadMove,
            groundY+30,
            35,
            5
        );

    }

    roadMove+=speed;

    if(roadMove>60)
        roadMove=0;

}



// NAILS

function createNail(){

    nails.push({

        x:canvas.width,
        y:groundY-45,
        w:35,
        h:45

    });

}


function drawNails(){

    ctx.fillStyle="#222";

    nails.forEach(n=>{

        ctx.beginPath();

        ctx.moveTo(n.x,n.y+n.h);

        ctx.lineTo(
            n.x+n.w/2,
            n.y
        );

        ctx.lineTo(
            n.x+n.w,
            n.y+n.h
        );

        ctx.fill();

    });

}



// UPDATE

function update(){

    if(!running)return;


    bike.vy+=bike.gravity;
    bike.y+=bike.vy;


    if(bike.y>=groundY-bike.h){

        bike.y=groundY-bike.h;
        bike.vy=0;
        bike.ground=true;

    }



    nails.forEach(n=>{

        n.x-=speed;


        if(
        bike.x<n.x+n.w &&
        bike.x+bike.w>n.x &&
        bike.y<n.y+n.h &&
        bike.y+bike.h>n.y
        ){

            endGame();

        }

    });


    nails=nails.filter(n=>n.x>-100);


    score++;

    speed+=0.001;

    document.getElementById("score").innerHTML=
    Math.floor(score/10);

}



// DRAW

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    background();
    road();
    drawBike();
    drawNails();

}



// GAME LOOP

function loop(){

    update();
    draw();

    requestAnimationFrame(loop);

}



// CONTROLS

function jump(){

    if(bike.ground && running){

        bike.vy=bike.jump;
        bike.ground=false;

        sound("jump");
    }

}


function endGame(){

    running=false;

    sound("gameover");

    let s=Math.floor(score/10);

    if(s>best){

        localStorage.setItem(
            "SBA_BEST",
            s
        );

    }

    document.getElementById("gameOver")
    .style.display="block";

}


function restartGame(){

    location.reload();

}


document.addEventListener(
"keydown",
e=>{

    if(e.code==="Space")
        jump();

});


canvas.addEventListener(
"touchstart",
jump
);


setInterval(()=>{

    if(running)
        createNail();

},1400);


loop();