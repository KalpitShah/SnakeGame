const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
let width = canvas.width;
const block_size = 15;
const speed = 100;
let direction_change = true;

if(screen.width < width) {
    width = parseInt((screen.width - 30)/15) * 15;
    canvas.width = width;
}

const clearScreen = () => {
    var color = 0;
    for(var i = 0; i < canvas.height/block_size; i++) {
        color = !color;
        var color2 = color;
        for(var j = 0; j < canvas.width/block_size; j++) {
            color2 = !color2;
            if(color2 == 0) {
                ctx.fillStyle = "#263445";
            } else {
                ctx.fillStyle = "#202937";
            }
            ctx.fillRect(j*block_size, i*block_size, block_size, block_size);
        }
    }
}

const score = {
    highscore: localStorage.getItem('highscore') ^ 0,
    current: 0
}

const snake = {
    height: block_size,
    width: block_size,
    blocks: [{
        x: parseInt(width/(block_size * 2)) * block_size,
        y: parseInt(height/(block_size * 2)) * block_size,
    }],
    color: "#2e8cd4",
    direction: "top"
}

const drawSnake = async () => {
    direction_change = true;
    ctx.fillStyle = snake.color;
    for(let block in snake.blocks) {
        ctx.fillRect(snake.blocks[block].x, snake.blocks[block].y, snake.width, snake.height);
    }
}

const moveSnake = async () => {
    let direction = { x: 0, y: 0 }
    if(snake.direction == "top") {
        direction.y -= snake.height;
    } else if(snake.direction == "bottom") {
        direction.y += snake.height;        
    } else if(snake.direction == "right") {
        direction.x += snake.width;
    } else if(snake.direction == "left") {
        direction.x -= snake.width;
    }
    snake.blocks.unshift({x: snake.blocks[0].x + direction.x, y: snake.blocks[0].y + direction.y})
    snake.blocks.pop()
}

const objArrayIncludes = (pos, blocks) => {
    if(blocks != []) {
        for(let block in blocks) {
            if(pos.x === blocks[block].x && pos.y === blocks[block].y) {
                return true;
            }
        }
    }
    return false;
}

const randomPos = (blocks) => {
    var x = Math.floor(Math.random() * width/block_size) * block_size;
    var y = Math.floor(Math.random() * height/block_size) * block_size;

    while(objArrayIncludes({x, y}, blocks)) {
        x = Math.floor(Math.random() * width/block_size) * block_size;
        y = Math.floor(Math.random() * height/block_size) * block_size;
    }

    return {
        x: x,
        y: y
    };
}

const food = {
    height: block_size,
    width: block_size,
    position: randomPos(snake.blocks),
    color: "#e24033"
}

const drawFood = () => {
    ctx.fillStyle = food.color;
    ctx.fillRect(food.position.x, food.position.y, food.width, food.height);
}

const newFood = () => {
    food.position = randomPos(snake.blocks);
}

const eatFood = async () => {
    if(food.position.x === snake.blocks[0].x && food.position.y === snake.blocks[0].y) {
        snake.blocks.push({x: food.position.x, y: food.position.y});
        newFood();
        score.current++;
        document.getElementById("currentscore").innerHTML = "Score: " + score.current;
    }
}

const checkCollision = async () => {
    if(snake.blocks[0].x < 0 || snake.blocks[0].y < 0 || snake.blocks[0].x > width - block_size || snake.blocks[0].y > height - block_size) {
        gameover();
        return true;
    }
    return false;
}

const init = () => {
    document.getElementById("game-over").style.display = "none";
    document.getElementById("new-game").innerHTML = "You can play with your keyboard or buttons below"; 
    
    snake.height = block_size;
    snake.width = block_size
    snake.blocks = [{
        x: parseInt(width/(block_size * 2)) * block_size,
        y: parseInt(height/(block_size * 2)) * block_size,
    }];
    snake.direction = "top";

    food.position = randomPos(snake.blocks);
    
    clearScreen();

    // Draw Snake
    drawSnake();

    // Draw Food
    drawFood();
}

const loop = async () => {
    await eatFood();
    await moveSnake();
    if(await checkCollision()) {
        return;
    }
    clearScreen();
    await drawSnake();
    drawFood();

    let tempBlock = [...snake.blocks];
    tempBlock.shift();
    
    if(objArrayIncludes(snake.blocks[0], tempBlock)) {
        gameover();
    }
}

document.addEventListener("keydown", function(event) {
    if((snake.direction === "top" || snake.direction === "bottom") && direction_change) {
        if(event.keyCode === 37) {
            snake.direction = "left";
            direction_change = false;
        } else if(event.keyCode === 39) {
            snake.direction = "right";
            direction_change = false;
        } 
    } else if((snake.direction === "left" || snake.direction === "right") && direction_change) {
        if(event.keyCode === 38) {
            snake.direction = "top";
            direction_change = false;
        } else if(event.keyCode === 40) {
            snake.direction = "bottom";
            direction_change = false;
        }
    }
})


document.getElementById("up-button").addEventListener("click", function(event) {
    if((snake.direction === "left" || snake.direction === "right") && direction_change) {
        snake.direction = "top";
        direction_change = false;
    }
})

document.getElementById("down-button").addEventListener("click", function(event) {
    if((snake.direction === "left" || snake.direction === "right") && direction_change) {
        snake.direction = "bottom";
        direction_change = false;
    }
})

document.getElementById("left-button").addEventListener("click", function(event) {
    if((snake.direction === "top" || snake.direction === "bottom") && direction_change) {
        snake.direction = "left";
        direction_change = false;
    }
})

document.getElementById("right-button").addEventListener("click", function(event) {
    if((snake.direction === "top" || snake.direction === "bottom") && direction_change) {
        snake.direction = "right";
        direction_change = false;
    }
})


let gameInterval;
let once = true;
document.addEventListener("keydown", function(event) {
    if(once && event.keyCode === 32) {
        init();
        once = false;
        gameInterval = setInterval(loop, speed);
    }
})
document.getElementById("space-button").addEventListener("click", function(event) {
    if(once) {
        init();
        once = false;
        gameInterval = setInterval(loop, speed);
    }
})

clearScreen();
score.highscore = localStorage.getItem('highscore') ^ 0;
document.getElementById("highscore").innerHTML = "Highscore: " + score.highscore;


const gameover = () => {
    if(localStorage.getItem('highscore') < score.current) {
        localStorage.setItem('highscore', score.current);
        score.highscore = localStorage.getItem('highscore') ^ 0;
        document.getElementById("highscore").innerHTML = "Highscore: " + score.highscore;
    }

    document.getElementById("game-over").style.display = "block";
    document.getElementById("new-game").innerHTML = "Space Button to start the Game";
    clearInterval(gameInterval);
    once = true;
}