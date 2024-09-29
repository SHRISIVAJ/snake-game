// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const boxSize = 25; 
let snake = [{x: 10 * boxSize, y: 10 * boxSize}];
let direction = 'RIGHT';
let food = getRandomFoodPosition();
let score = 0;
let interval;

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    if (event.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    else if (event.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
    else if (event.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    else if (event.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
}

function getRandomFoodPosition() {
    return {
        x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
        y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
    };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#00FF00' : '#ADFF2F';
        ctx.fillRect(snake[i].x, snake[i].y, boxSize, boxSize);
    }

    ctx.fillStyle = '#FF6347';
    ctx.fillRect(food.x, food.y, boxSize, boxSize);

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === 'UP') headY -= boxSize;
    if (direction === 'DOWN') headY += boxSize;
    if (direction === 'LEFT') headX -= boxSize;
    if (direction === 'RIGHT') headX += boxSize;

    if (headX === food.x && headY === food.y) {
        score++;
        food = getRandomFoodPosition();
    } else {
        snake.pop();
    }

    const newHead = { x: headX, y: headY };

    if (
        headX < 0 || headY < 0 || headX >= canvas.width || headY >= canvas.height ||
        snake.some(segment => segment.x === headX && segment.y === headY)
    ) {
        clearInterval(interval);
        alert(`Game Over! Your score is ${score}`);
        submitScore();
        return;
    }

    snake.unshift(newHead);
}

function startGame() {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
        alert('Please enter your name.');
        return;
    }
    score = 0;
    snake = [{x: 10 * boxSize, y: 10 * boxSize}];
    direction = 'RIGHT';
    clearInterval(interval);
    interval = setInterval(draw, 100);
}

function submitScore() {
    const playerName = document.getElementById('playerName').value.trim();
    fetch('/submit_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score })
    }).then(response => response.json())
    .then(data => {
        loadLeaderboard();
        loadHistory();
    });
}

function loadLeaderboard() {
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => {
            const leaderboard = document.getElementById('leaderboard');
            leaderboard.innerHTML = '';
            data.forEach((entry, index) => {
                leaderboard.innerHTML += `<li>${index + 1}. ${entry.name} - ${entry.score}</li>`;
            });
        });
}

function loadHistory() {
    fetch('/history')
        .then(response => response.json())
        .then(data => {
            const history = document.getElementById('history');
            history.innerHTML = '';
            data.forEach(entry => {
                history.innerHTML += `<li>${entry.name}: ${entry.score}</li>`;
            });
        });
}

loadLeaderboard();
loadHistory();
