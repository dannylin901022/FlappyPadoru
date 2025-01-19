let board;
let boardHeight = 640;
let boardWidth = 360;
let context;
let bg = new Image()
bg.src = "./bg.png"


let Padoru = {
    x: boardWidth/8,
    y: boardHeight/2,
    width:68,
    height:78
}
let PadoruImages = [];
let PadoruImageIndex = 0;


let TreeArray = [];
let TreeWidth = 64;
let TreeHeight = 360;
let TreeX = boardWidth;
let TreeY = 0;

let topTreeImg;
let bottomTreeImg;


let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let totalSeconds = 0;

let wingSound = new Audio("./wingSound.wav");
let hitSound = new Audio("./hitSound.wav");
let passSound = new Audio("./passSound.wav");
let bgm = new Audio("./bgm.mp3");
bgm.loop = true;
let clickPage = false;

window.onload = () => {
    let board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    for(let i = 1; i < 17; i++){
        let PadoruImage = new Image();
        PadoruImage.src = `./padoru/padoru (${i}).png`;
        PadoruImages.push(PadoruImage);
    }

    topTreeImg = new Image();
    topTreeImg.src = "./topTree.png";

    bottomTreeImg = new Image();
    bottomTreeImg.src = "./bottomTree.png";


    requestAnimationFrame(update);
    setInterval(placeTrees, 1500);
    setInterval(animatePadoru, 100);
    document.addEventListener("keydown", movePadoru);
    document.addEventListener("mousedown", movePadoru);
    
}

function update(){
    lastFrameTime = Date.now();
    requestAnimationFrame(update);
    if(gameOver){
        return;
    }


    context.clearRect(0,0,boardWidth,boardHeight);

    bgMove(lastFrameTime);

    velocityY += gravity;
    Padoru.y = Math.max(Padoru.y + velocityY, 0);
    context.drawImage(PadoruImages[PadoruImageIndex],Padoru.x,Padoru.y,Padoru.width,Padoru.height);
    
    if(Padoru.y > boardHeight){
        gameOver = true;
    }

    for(let i = 0; i < TreeArray.length; i++){
        let Tree = TreeArray[i];
        Tree.x += velocityX;
        context.drawImage(Tree.img,Tree.x,Tree.y,Tree.width,Tree.height);

        if(!Tree.passed && Padoru.x > Tree.x + Tree.width){
            score += 0.5;
            passSound.playbackRate = 1.5;
            passSound.play();
            Tree.passed = true;
        }

        if(detectCollision(Padoru, Tree)){
            hitSound.play();
            gameOver = true;
        }
    }

    while(TreeArray.length > 0 && TreeArray[0].x < -TreeWidth - 10){
        TreeArray.shift();
    }

    context.fillStyle = "rgb(255, 255, 255)"
    context.font = "45px sans-serif";
    context.fillText(score, 20,45);

    if(gameOver){
        context.fillText("GameOver", boardWidth/5,boardHeight/2);
    }
}

function animatePadoru(){
    PadoruImageIndex++;
    PadoruImageIndex %= PadoruImages.length;

}

function bgMove(lastFrameTime) {
    
    let now = Date.now();
    let deltaSeconds = (now - lastFrameTime)/192;
    lastFrameTime = now;

    totalSeconds += deltaSeconds;

    let vx = 192; 
    let numImages = Math.ceil(boardWidth / 1920);
    let xpos = totalSeconds * vx % 1920;

    context.save();
    context.translate(-xpos, 0);
    for (let i = 0; i < numImages; i++) {
        context.drawImage(bg, i * 1920, 0);
    }
    context.restore();
    
}

function placeTrees(){
    if(gameOver){
        return;
    }


    let randomTreeY = TreeY - TreeHeight/4 - Math.random()*(TreeHeight/2);
    let openingSpace = boardHeight/2.5;

    let topTree = {
        img:topTreeImg,
        x:TreeX,
        y:randomTreeY,
        width:TreeWidth,
        height:TreeHeight,
        passed:false
    }
    TreeArray.push(topTree);

    let bottomTree = {
        img:bottomTreeImg,
        x:TreeX,
        y:randomTreeY + TreeHeight + openingSpace,
        width:TreeWidth,
        height:TreeHeight,
        passed:false
    }
    TreeArray.push(bottomTree);
}

function movePadoru(e){
    if(!clickPage){
        bgm.play();
        clickPage = true;
    }
    if(e.code == "Space" || e.code == "KeyW" || e.code == "ArrowUp"){
        wingSound.play();
        velocityY = -8;
    }
    else if(e.type == "mousedown"){
        wingSound.play();
        velocityY = -8;
    }

    if(gameOver){
        Padoru.y = boardHeight/2;
        TreeArray = [];
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