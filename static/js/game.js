class WordHuntGame {
    constructor() {
        this.canvas = document.getElementById('gameGrid');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 100;
        this.score = 0;
        this.foundWords = new Set();
        this.selectedCells = [];
        this.currentWord = '';
        this.gameTime = 80;
        this.isPlaying = false;
        this.isGameOver = false;
        this.grid = Array(4).fill().map(() => Array(4).fill(''));
        this.isMouseDown = false;
        
        // Initialize Socket.IO
        this.socket = io();
        this.roomId = null;
        this.userId = null;
        this.isHost = false;

        // Initialize sounds
        this.validWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');
        this.invalidWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbL1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');

        this.setupEventListeners();
        this.setupSocketListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        document.getElementById('newGame').addEventListener('click', () => {
            window.location.reload();
        });
    }

    setupSocketListeners() {
        this.socket.on('connected', (data) => {
            this.userId = data.user_id;
            console.log('Connected with user ID:', this.userId);
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

        this.socket.on('join_error', (data) => {
            alert(data.message);
        });

        this.socket.on('game_ready', () => {
            if (this.isHost) {
                document.getElementById('startGameBtn').disabled = false;
            }
        });

        this.socket.on('game_started', (data) => {
            document.getElementById('startModal').style.display = 'none';
            this.grid = data.grid;
            this.score = 0;
            this.foundWords.clear();
            this.updateScore();
            this.updateFoundWords();
            this.drawGrid();
            this.startTimer();
            this.isPlaying = true;
        });

        this.socket.on('score_update', (data) => {
            const playerScores = data.scores;
            Object.keys(playerScores).forEach((userId, index) => {
                const scoreElement = document.getElementById('player' + (index + 1) + 'Score');
                if (scoreElement) {
                    scoreElement.textContent = 'Player ' + (index + 1) + ': ' + playerScores[userId];
                }
            });

            if (data.user_id === this.userId && data.word) {
                this.foundWords.add(data.word);
                this.updateFoundWords();
                this.showFeedback(true, data.points);
            }
        });

        this.socket.on('game_ended', (data) => {
            this.isGameOver = true;
            this.isPlaying = false;
            clearInterval(this.timerInterval);
            const isWinner = data.winner === this.userId;
            this.showGameOverScreen(data.final_scores, isWinner);
            
            // Refresh leaderboard after game ends
            fetch('/leaderboard')
                .then(response => response.json())
                .then(scores => {
                    const tbody = document.querySelector('.leaderboard tbody');
                    tbody.innerHTML = '';
                    scores.forEach((score, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${score.score}</td>
                            <td>${new Date(score.game_date).toLocaleString()}</td>
                        `;
                        tbody.appendChild(row);
                    });
                });
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

    resetSelection() {
        this.selectedCells = [];
        this.currentWord = '';
        this.drawGrid();
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells and letters
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                // Draw cell background
                this.ctx.fillStyle = this.isSelected(row, col) ? '#3498db' : '#2c3e50';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // Draw cell border
                this.ctx.strokeStyle = '#34495e';
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                
                // Draw letter
                if (this.grid[row][col]) {
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
        
        // Draw lines connecting selected cells
        if (this.selectedCells.length > 1) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 4;
            
            const firstCell = this.selectedCells[0];
            this.ctx.moveTo(
                firstCell.col * this.cellSize + this.cellSize / 2,
                firstCell.row * this.cellSize + this.cellSize / 2
            );
            
            for (let i = 1; i < this.selectedCells.length; i++) {
                const cell = this.selectedCells[i];
                this.ctx.lineTo(
                    cell.col * this.cellSize + this.cellSize / 2,
                    cell.row * this.cellSize + this.cellSize / 2
                );
            }
            
            this.ctx.stroke();
        }
    }

    isSelected(row, col) {
        return this.selectedCells.some(cell => 
            cell.row === row && cell.col === col
        );
    }

    showStartScreen() {
        const startModal = document.getElementById('startModal');
        if (startModal) {
            startModal.style.display = 'flex';
            
            const createRoomBtn = document.getElementById('createRoomBtn');
            const joinRoomBtn = document.getElementById('joinRoomBtn');
            
            createRoomBtn.onclick = () => {
                this.socket.emit('create_room');
            };

            joinRoomBtn.onclick = () => {
                const roomId = document.getElementById('roomIdInput').value.trim();
                if (roomId) {
                    this.socket.emit('join_room', { room_id: roomId });
                } else {
                    alert('Please enter a room ID');
                }
            };

            const startGameBtn = document.getElementById('startGameBtn');
            startGameBtn.onclick = () => {
                if (this.roomId) {
                    this.socket.emit('start_game', { room_id: this.roomId });
                }
            };
        }
    }

    updatePlayersList(players) {
        const playersList = document.getElementById('playersList');
        if (!playersList) return;
        
        playersList.innerHTML = '';
        players.forEach((playerId, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = 'Player ' + (index + 1) + (playerId === this.userId ? ' (You)' : '');
            playersList.appendChild(li);
        });
    }

    showGameOverScreen(finalScores, isWinner) {
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        
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
                <button class="btn btn-primary" onclick="window.game.showStartScreen()">Play Again</button>
            </div>
        `;
        document.body.appendChild(gameOverModal);
    }

    showFeedback(isValid, points = 0) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'word-feedback ' + (isValid ? 'valid' : '');
        feedbackDiv.textContent = isValid ? `+${points}` : '✗';
        
        const rect = this.canvas.getBoundingClientRect();
        feedbackDiv.style.left = rect.left + this.canvas.width / 2 + 'px';
        feedbackDiv.style.top = rect.top + this.canvas.height / 2 + 'px';
        
        document.body.appendChild(feedbackDiv);
        setTimeout(() => {
            feedbackDiv.remove();
        }, 1000);
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
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        let timeLeft = this.gameTime;
        const timerElement = document.getElementById('timer');
        
        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = minutes + ':' + seconds.toString().padStart(2, '0');
            
            if (timeLeft === 0) {
                clearInterval(this.timerInterval);
                this.socket.emit('game_over', { room_id: this.roomId });
                this.isGameOver = true;
            }
            timeLeft--;
        };

        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    async handleWordSubmission() {
        if (this.isGameOver || !this.currentWord || this.currentWord.length < 3 || !this.roomId) {
            this.resetSelection();
            return;
        }

        try {
            const response = await fetch('/validate/' + this.currentWord);
            const data = await response.json();
            
            if (data.valid && !this.foundWords.has(this.currentWord)) {
                this.socket.emit('word_found', {
                    room_id: this.roomId,
                    word: this.currentWord
                });
                this.validWordSound.play();
            } else {
                this.invalidWordSound.play();
                this.showFeedback(false);
            }
        } catch (error) {
            console.error("Error validating word:", error);
        }
        
        this.resetSelection();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.game = new WordHuntGame();
    window.game.showStartScreen();
});
