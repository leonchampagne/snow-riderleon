const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let gameRunning = false;
let score = 0;
let giftsCollected = 0;
let level = 1;
let gameSpeed = 3;

// Player
const player = {
    x: canvas.width / 2 - 15,
    y: canvas.height - 40,
    width: 30,
    height: 40,
    speed: 6,
    moving: false
};

// Arrays for game objects
let obstacles = [];
let gifts = [];
let snowflakes = [];

// Key states
const keys = {};

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function startGame() {
    document.getElementById('startMenu').classList.add('hidden');
    gameRunning = true;
    score = 0;
    giftsCollected = 0;
    level = 1;
    gameSpeed = 3;
    obstacles = [];
    gifts = [];
    snowflakes = [];
    gameLoop();
}

function restartGame() {
    document.getElementById('gameOverMenu').classList.add('hidden');
    startGame();
}

function gameLoop() {
    update();
    draw();
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

function update() {
    // Player movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        if (player.x > 0) player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        if (player.x < canvas.width - player.width) player.x += player.speed;
    }

    // Spawn obstacles
    if (Math.random() < 0.02) {
        spawnObstacle();
    }

    // Spawn gifts
    if (Math.random() < 0.015) {
        spawnGift();
    }

    // Spawn snowflakes
    if (Math.random() < 0.3) {
        spawnSnowflake();
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += gameSpeed;

        // Collision detection with player
        if (checkCollision(player, obstacles[i])) {
            endGame();
            return;
        }

        // Remove if off screen
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            score += 10;
        }
    }

    // Update gifts
    for (let i = gifts.length - 1; i >= 0; i--) {
        gifts[i].y += gameSpeed;
        gifts[i].rotation += 0.1;

        // Collision detection with player
        if (checkCollision(player, gifts[i])) {
            giftsCollected++;
            gifts.splice(i, 1);
            score += 50;
            
            // Level up every 5 gifts
            if (giftsCollected % 5 === 0) {
                level++;
                gameSpeed += 0.5;
            }
            continue;
        }

        // Remove if off screen
        if (gifts[i].y > canvas.height) {
            gifts.splice(i, 1);
        }
    }

    // Update snowflakes
    for (let i = snowflakes.length - 1; i >= 0; i--) {
        snowflakes[i].y += snowflakes[i].speed;
        snowflakes[i].x += Math.sin(snowflakes[i].y * 0.02) * 0.5;

        if (snowflakes[i].y > canvas.height) {
            snowflakes.splice(i, 1);
        }
    }

    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('gifts').textContent = giftsCollected;
    document.getElementById('level').textContent = level;
}

function spawnObstacle() {
    const width = 40 + Math.random() * 30;
    const x = Math.random() * (canvas.width - width);
    obstacles.push({
        x: x,
        y: -20,
        width: width,
        height: 20
    });
}

function spawnGift() {
    const x = Math.random() * (canvas.width - 30);
    gifts.push({
        x: x,
        y: -30,
        width: 30,
        height: 30,
        rotation: 0
    });
}

function spawnSnowflake() {
    snowflakes.push({
        x: Math.random() * canvas.width,
        y: -10,
        size: 2 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1.5
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalGifts').textContent = giftsCollected;
    document.getElementById('gameOverMenu').classList.remove('hidden');
}

function draw() {
    // Background
    ctx.fillStyle = '#e0f6ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Snow pattern
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(i * 80, 0, 40, canvas.height);
    }

    // Draw snowflakes
    ctx.fillStyle = 'white';
    for (let flake of snowflakes) {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw obstacles (trees/rocks)
    ctx.fillStyle = '#8B4513';
    for (let obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        // Add a pattern
        ctx.fillStyle = '#654321';
        ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, obstacle.height - 10);
        ctx.fillStyle = '#8B4513';
    }

    // Draw gifts
    for (let gift of gifts) {
        ctx.save();
        ctx.translate(gift.x + gift.width / 2, gift.y + gift.height / 2);
        ctx.rotate(gift.rotation);
        
        // Gift box
        ctx.fillStyle = '#FF1493';
        ctx.fillRect(-gift.width / 2, -gift.height / 2, gift.width, gift.height);
        
        // Gift ribbon
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-gift.width / 2 + 2, -3, gift.width - 4, 6);
        ctx.fillRect(-3, -gift.height / 2 + 2, 6, gift.height - 4);
        
        ctx.restore();
    }

    // Draw player (skier)
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    
    // Player body
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    // Player head
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.arc(0, -player.height / 2 - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-4, -player.height / 2 - 8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -player.height / 2 - 8, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Skis
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, player.height / 2);
    ctx.lineTo(-8, player.height / 2 + 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, player.height / 2);
    ctx.lineTo(8, player.height / 2 + 15);
    ctx.stroke();
    
    ctx.restore();
}

// Start with menu
document.getElementById('startMenu').classList.remove('hidden');