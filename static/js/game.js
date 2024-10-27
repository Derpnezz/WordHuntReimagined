class WordHuntGame {
    constructor() {
        // Bind all methods to this instance
        this.setupEventListeners = this.setupEventListeners.bind(this);
        this.setupSocketListeners = this.setupSocketListeners.bind(this);
        this.startSinglePlayerGame = this.startSinglePlayerGame.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.updateLeaderboards = this.updateLeaderboards.bind(this);
        this.updateScore = this.updateScore.bind(this);
        this.updateFoundWords = this.updateFoundWords.bind(this);
        this.drawGrid = this.drawGrid.bind(this);
        this.handleWordSubmission = this.handleWordSubmission.bind(this);
        
        this.canvas = document.getElementById('gameGrid');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 100;
        this.grid = [];
        this.score = 0;
        this.foundWords = new Set();
        this.selectedCells = [];
        this.currentWord = '';
        this.isPlaying = false;
        this.isSinglePlayer = false;
        this.timer = null;
        this.timeLeft = 80; // 80 seconds game duration
        this.isMouseDown = false;
        
        // Initialize Socket.IO
        this.socket = io();
        
        // Set up event listeners and socket listeners
        this.setupEventListeners();
        this.setupSocketListeners();
        
        // Initialize leaderboards
        this.updateLeaderboards();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('touchstart', this.handleTouchStart);
        this.canvas.addEventListener('touchmove', this.handleTouchMove);
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        
        document.getElementById('createRoomBtn').addEventListener('click', () => {
            this.socket.emit('create_room');
        });

        document.getElementById('joinRoomBtn').addEventListener('click', () => {
            const roomId = document.getElementById('roomIdInput').value.trim();
            if (roomId) {
                this.socket.emit('join_room', { room_id: roomId });
            }
        });

        document.getElementById('playSoloBtn').addEventListener('click', () => {
            this.startSinglePlayerGame();
        });

        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.socket.emit('start_game', { room_id: this.roomId });
        });

        document.getElementById('newGame').addEventListener('click', () => {
            window.location.reload();
        });
    }

    setupSocketListeners() {
        this.socket.on('connected', (data) => {
            this.userId = data.user_id;
            console.log('Connected with user ID:', this.userId);
        });

        this.socket.on('room_joined', (data) => {
            this.roomId = data.room_id;
            document.getElementById('menuOptions').style.display = 'none';
            document.getElementById('waitingRoom').style.display = 'block';
            document.getElementById('roomIdDisplay').textContent = this.roomId;
            this.updatePlayersList(data.players);
        });

        this.socket.on('room_created', (data) => {
            this.roomId = data.room_id;
            this.isHost = true;
            document.getElementById('menuOptions').style.display = 'none';
            document.getElementById('waitingRoom').style.display = 'block';
            document.getElementById('roomIdDisplay').textContent = this.roomId;
            document.getElementById('hostControls').style.display = 'block';
            this.updatePlayersList(data.players);
        });

        this.socket.on('player_joined', (data) => {
            this.updatePlayersList(data.players);
            if (data.players.length === 2 && this.isHost) {
                document.getElementById('startGameBtn').disabled = false;
            }
        });
    }

    startSinglePlayerGame() {
        this.isSinglePlayer = true;
        document.getElementById('startModal').style.display = 'none';
        document.getElementById('player2Score').style.display = 'none';
        
        fetch('/new-grid')
            .then(response => response.json())
            .then(data => {
                this.grid = data.grid;
                this.score = 0;
                this.foundWords.clear();
                this.updateScore();
                this.updateFoundWords();
                this.drawGrid();
                this.startTimer();
                this.isPlaying = true;
            });
    }

    handleMouseDown(event) {
        if (!this.isPlaying) return;
        this.isMouseDown = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cell = this.getCellFromCoordinates(x, y);
        if (cell) {
            this.selectCell(cell);
        }
    }

    handleMouseMove(event) {
        if (!this.isMouseDown || !this.isPlaying) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const cell = this.getCellFromCoordinates(x, y);
        if (cell) {
            this.selectCell(cell);
        }
    }

    handleMouseUp() {
        if (!this.isPlaying) return;
        this.isMouseDown = false;
        this.handleWordSubmission();
    }

    handleTouchStart(event) {
        if (!this.isPlaying) return;
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const cell = this.getCellFromCoordinates(x, y);
        if (cell) {
            this.selectCell(cell);
        }
    }

    handleTouchMove(event) {
        if (!this.isPlaying) return;
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const cell = this.getCellFromCoordinates(x, y);
        if (cell) {
            this.selectCell(cell);
        }
    }

    handleTouchEnd(event) {
        if (!this.isPlaying) return;
        event.preventDefault();
        this.handleWordSubmission();
    }

    getCellFromCoordinates(x, y) {
        const row = Math.floor(y / this.cellSize);
        const col = Math.floor(x / this.cellSize);
        
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            return { row, col };
        }
        return null;
    }

    selectCell(cell) {
        if (this.isValidSelection(cell)) {
            this.selectedCells.push(cell);
            this.currentWord = this.getWordFromSelection();
            this.drawGrid();
        }
    }

    isValidSelection(newCell) {
        if (this.selectedCells.length === 0) return true;
        
        const lastCell = this.selectedCells[this.selectedCells.length - 1];
        const rowDiff = Math.abs(newCell.row - lastCell.row);
        const colDiff = Math.abs(newCell.col - lastCell.col);
        
        if (rowDiff <= 1 && colDiff <= 1) {
            return !this.selectedCells.some(cell => 
                cell.row === newCell.row && cell.col === newCell.col
            );
        }
        return false;
    }

    getWordFromSelection() {
        return this.selectedCells.map(cell => 
            this.grid[cell.row][cell.col]
        ).join('');
    }

    handleWordSubmission() {
        if (!this.currentWord || this.currentWord.length < 3) {
            this.resetSelection();
            return;
        }

        fetch('/validate/' + this.currentWord)
            .then(response => response.json())
            .then(data => {
                if (data.valid && !this.foundWords.has(this.currentWord)) {
                    const points = {3: 100, 4: 400, 5: 800, 6: 1400}[this.currentWord.length] || 0;
                    this.score += points;
                    this.foundWords.add(this.currentWord);
                    this.updateScore();
                    this.updateFoundWords();
                }
                this.resetSelection();
            });
    }

    resetSelection() {
        this.selectedCells = [];
        this.currentWord = '';
        this.drawGrid();
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                this.ctx.fillStyle = this.isSelected(row, col) ? '#3498db' : '#2c3e50';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                this.ctx.strokeStyle = '#34495e';
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                
                if (this.grid[row] && this.grid[row][col]) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = 'bold 48px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        this.grid[row][col],
                        x + this.cellSize / 2,
                        y + this.cellSize / 2
                    );
                }
            }
        }
    }

    isSelected(row, col) {
        return this.selectedCells.some(cell => 
            cell.row === row && cell.col === col
        );
    }

    showGameOverScreen(finalScores, isWinner) {
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        
        if (this.isSinglePlayer) {
            gameOverModal.innerHTML = `
                <div class="game-over-content">
                    <h2>Game Over!</h2>
                    <div class="final-scores mb-3">
                        <h3>Final Score: ${this.score}</h3>
                    </div>
                    <button class="btn btn-primary" onclick="window.location.reload()">Play Again</button>
                </div>
            `;
            
            fetch('/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: this.score,
                    mode: 'solo'
                })
            }).then(() => this.updateLeaderboards());
        } else {
            let scoresList = '';
            Object.keys(finalScores).forEach((userId, index) => {
                scoresList += '<p>Player ' + (index + 1) + ': ' + finalScores[userId] + 
                             (userId === this.userId ? ' (You)' : '') + '</p>';
            });

            gameOverModal.innerHTML = `
                <div class="game-over-content">
                    <h2>${isWinner ? 'You Won!' : 'Game Over!'}</h2>
                    <div class="final-scores mb-3">
                        <h3>Final Scores:</h3>
                        ${scoresList}
                    </div>
                    <button class="btn btn-primary" onclick="window.location.reload()">Play Again</button>
                </div>
            `;
        }
        
        document.body.appendChild(gameOverModal);
        this.updateLeaderboards();
    }

    updateScore() {
        const playerScores = document.querySelectorAll('.player-score');
        playerScores.forEach((scoreElement, index) => {
            scoreElement.textContent = `Player ${index + 1}: ${this.score}`;
        });
    }

    updateFoundWords() {
        const foundWordsList = document.getElementById('foundWords');
        foundWordsList.innerHTML = '';
        Array.from(this.foundWords).sort().forEach(word => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = word;
            foundWordsList.appendChild(li);
        });
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timeLeft = 80;
        const timerElement = document.getElementById('timer');
        
        const updateTimer = () => {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.timeLeft === 0) {
                clearInterval(this.timer);
                const finalScores = this.isSinglePlayer ? { [this.userId]: this.score } : null;
                this.showGameOverScreen(finalScores, false);
                this.isPlaying = false;
                return;
            }
            this.timeLeft--;
        };

        updateTimer();
        this.timer = setInterval(updateTimer, 1000);
    }

    updateLeaderboards() {
        fetch('/leaderboard')
            .then(response => response.json())
            .then(data => {
                const soloTbody = document.querySelector('#singleplayer-scores tbody');
                const multiTbody = document.querySelector('#multiplayer-scores tbody');
                
                if (soloTbody && multiTbody) {
                    soloTbody.innerHTML = '';
                    multiTbody.innerHTML = '';
                    
                    data.solo_scores.forEach((score, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${score.score}</td>
                            <td>${new Date(score.game_date).toLocaleString()}</td>
                        `;
                        soloTbody.appendChild(row);
                    });
                    
                    data.multi_scores.forEach((score, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${score.score}</td>
                            <td>${new Date(score.game_date).toLocaleString()}</td>
                        `;
                        multiTbody.appendChild(row);
                    });
                }
            })
            .catch(error => console.error('Error updating leaderboards:', error));
    }

    updatePlayersList(players) {
        const playersList = document.getElementById('playersList');
        if (playersList) {
            playersList.innerHTML = '';
            players.forEach((playerId, index) => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = `Player ${index + 1}${playerId === this.userId ? ' (You)' : ''}`;
                playersList.appendChild(li);
            });
        }
    }
}

// Wait for DOM to be fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new WordHuntGame();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});
