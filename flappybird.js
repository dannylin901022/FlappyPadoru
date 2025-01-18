let board;
let boardHeight = 640;
let boardWidth = 360;
let context;


let bird = {
    x: boardWidth/8,
    y: boardHeight/2,
    width:34,
    height:24
}
let birdImages = [];
let birdImageIndex = 0;


let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;


let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;

let wingSound = new Audio("./sfx_wing.wav");
let hitSound = new Audio("./sfx_hit.wav");
let bgm = new Audio("./bgm.mp3");
bgm.loop = true;

window.onload = () => {
    let board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    for(let i = 0; i < 4; i++){
        let birdImage = new Image();
        birdImage.src = `./flappybird${i}.png`;
        birdImages.push(birdImage);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";


    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
    setInterval(animateBird, 100);
    document.addEventListener("keydown", moveBird);
    document.addEventListener("mousedown", moveBird);

    bgm.play();
}

function update(){
    requestAnimationFrame(update);
    if(gameOver){
        return;
    }


    context.clearRect(0,0,boardWidth,boardHeight);

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImages[birdImageIndex],bird.x,bird.y,bird.width,bird.height);
    
    if(bird.y > boardHeight){
        gameOver = true;
    }

    for(let i = 0; i < pipeArray.length; i++){
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);

        if(!pipe.passed && bird.x > pipe.x + pipe.width){
            score += 0.5;
            pipe.passed = true;
        }

        if(detectCollision(bird, pipe)){
            hitSound.play();
            gameOver = true;
        }
    }

    while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth - 10){
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5,45);

    if(gameOver){
        context.fillText("GameOver", boardWidth/5,boardHeight/2);
    }
}

function animateBird(){
    birdImageIndex++;
    birdImageIndex %= birdImages.length;

}

function placePipes(){
    if(gameOver){
        return;
    }


    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = boardHeight/4;

    let topPipe = {
        img:topPipeImg,
        x:pipeX,
        y:randomPipeY,
        width:pipeWidth,
        height:pipeHeight,
        passed:false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img:bottomPipeImg,
        x:pipeX,
        y:randomPipeY + pipeHeight + openingSpace,
        width:pipeWidth,
        height:pipeHeight,
        passed:false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e){
    if(e.code == "Space" || e.code == "KeyW" || e.code == "ArrowUp"){
        wingSound.play();
        velocityY = -6;
    }
    else if(e.type == "mousedown"){
        wingSound.play();
        velocityY = -6;
    }

    if(gameOver){
        bird.y = boardHeight/2;
        pipeArray = [];
        score = 0;
        gameOver = false;
    }
}

function detectCollision(a, b){
    return  a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}