const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 720;

let gameRunning = false;
let score = 0;
let giftsCollected = 0;
let level = 1;
let gameSpeed = 4;
let cameraY = 0;

// Player (Skier)
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 20,
    height: 28,
    speed: 7,
    targetX: canvas.width / 2
};

// Game objects
let obstacles = [];
let gifts = [];
let terrainLines = [];

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
    gameSpeed = 4;
    cameraY = 0;
    obstacles = [];
    gifts = [];
    terrainLines = [];
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    
    // Initialize terrain
    for (let i = 0; i < 50; i++) {
        terrainLines.push({
            y: i * 40,
            width: 60 + Math.random() * 80
        });
    }
    
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
        player.targetX = Math.max(30, player.targetX - player.speed);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.targetX = Math.min(canvas.width - 30, player.targetX + player.speed);
    }
    
    // Smooth player movement
    player.x += (player.targetX - player.x) * 0.15;

    // Spawn obstacles
    if (Math.random() < 0.025 * (1 + level * 0.1)) {
        spawnObstacle();
    }

    // Spawn gifts
    if (Math.random() < 0.02) {
        spawnGift();
    }

    // Update camera
    cameraY += gameSpeed;

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].screenY = obstacles[i].y - cameraY;

        // Collision detection
        if (checkCollision(player, obstacles[i])) {
            endGame();
            return;
        }

        // Remove if off screen
        if (obstacles[i].screenY > canvas.height) {
            obstacles.splice(i, 1);
            score += 10;
        }
    }

    // Update gifts
    for (let i = gifts.length - 1; i >= 0; i--) {
        gifts[i].screenY = gifts[i].y - cameraY;
        gifts[i].rotation += 0.08;

        // Collision detection
        if (checkCollision(player, gifts[i])) {
            giftsCollected++;
            gifts.splice(i, 1);
            score += 50;
            
            if (giftsCollected % 5 === 0) {
                level++;
                gameSpeed += 0.5;
            }
            continue;
        }

        // Remove if off screen
        if (gifts[i].screenY > canvas.height) {
            gifts.splice(i, 1);
        }
    }

    // Update terrain
    while (terrainLines.length > 0 && terrainLines[0].y < cameraY - 50) {
        terrainLines.shift();
    }
    
    while (terrainLines[terrainLines.length - 1].y < cameraY + canvas.height + 100) {
        const lastLine = terrainLines[terrainLines.length - 1];
        terrainLines.push({
            y: lastLine.y + 40,
            width: 60 + Math.random() * 80
        });
    }

    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('gifts').textContent = giftsCollected;
    document.getElementById('level').textContent = level;
}

function spawnObstacle() {
    const width = 50 + Math.random() * 60;
    const x = 30 + Math.random() * (canvas.width - 60 - width);
    obstacles.push({
        x: x,
        y: cameraY - canvas.height,
        width: width,
        height: 30,
        type: Math.random() > 0.5 ? 'tree' : 'rock',
        screenY: 0
    });
}

function spawnGift() {
    const x = 40 + Math.random() * (canvas.width - 80);
    gifts.push({
        x: x,
        y: cameraY - canvas.height,
        width: 28,
        height: 28,
        rotation: 0,
        screenY: 0
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.screenY + rect2.height &&
           rect1.y + rect1.height > rect2.screenY;
}

function endGame() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalGifts').textContent = giftsCollected;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOverMenu').classList.remove('hidden');
}

function draw() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snow track lanes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 3, 0);
    ctx.lineTo(canvas.width / 3, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo((canvas.width * 2) / 3, 0);
    ctx.lineTo((canvas.width * 2) / 3, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw terrain depth (white lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let line of terrainLines) {
        const screenY = line.y - cameraY;
        if (screenY >= -50 && screenY <= canvas.height + 50) {
            const lineWidth = line.width * (1 - (line.y - cameraY) / (canvas.height * 1.5));
            ctx.beginPath();
            ctx.moveTo((canvas.width - lineWidth) / 2, screenY);
            ctx.lineTo((canvas.width + lineWidth) / 2, screenY);
            ctx.stroke();
        }
    }

    // Draw obstacles
    for (let obstacle of obstacles) {
        if (obstacle.screenY >= -50 && obstacle.screenY <= canvas.height) {
            if (obstacle.type === 'tree') {
                drawTree(obstacle.x, obstacle.screenY, obstacle.width, obstacle.height);
            } else {
                drawRock(obstacle.x, obstacle.screenY, obstacle.width, obstacle.height);
            }
        }
    }

    // Draw gifts
    for (let gift of gifts) {
        if (gift.screenY >= -50 && gift.screenY <= canvas.height) {
            drawGift(gift.x, gift.screenY, gift.width, gift.height, gift.rotation);
        }
    }

    // Draw player (skier)
    drawSkier(player.x, player.y, player.width, player.height);
}

function drawSkier(x, y, w, h) {
    // Skier body
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);

    // Head
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.arc(x, y - h / 2 - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - 3, y - h / 2 - 10, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 3, y - h / 2 - 10, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Skis
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + h / 2);
    ctx.lineTo(x - 6, y + h / 2 + 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 6, y + h / 2);
    ctx.lineTo(x + 6, y + h / 2 + 12);
    ctx.stroke();
}

function drawTree(x, y, w, h) {
    // Trunk
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + w / 3, y + h / 2, w / 3, h * 1.5);

    // Foliage
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.closePath();
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 2);
    ctx.lineTo(x + w * 0.75, y + h * 0.6);
    ctx.lineTo(x + w / 2, y + h - 2);
    ctx.closePath();
    ctx.fill();
}

function drawRock(x, y, w, h) {
    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = '#505050';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + 3, w / 2.5, h / 4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawGift(x, y, w, h, rotation) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rotation);

    // Gift box
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Border
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Ribbon (horizontal)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-w / 2, -3, w, 6);

    // Ribbon (vertical)
    ctx.fillRect(-3, -h / 2, 6, h);

    // Bow
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(-5, -h / 2 - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -h / 2 - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Start with menu
document.getElementById('startMenu').classList.remove('hidden');