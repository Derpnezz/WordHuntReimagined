class WordHuntGame {
    constructor() {
        this.canvas = document.getElementById('gameGrid');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 100;
        this.grid = [];
        this.score = 0;
        this.foundWords = new Set();
        this.selectedCells = [];
        this.currentWord = '';
        this.isPlaying = false;
        this.timer = null;
        this.timeLeft = 80; // 80 seconds game duration
        this.isMouseDown = false;
        this.cursorFeedback = null;
        
        // Initialize cursor feedback element
        this.initializeCursorFeedback();
        // Set up event listeners
        this.initializeEventListeners();
    }

    initializeCursorFeedback() {
        this.cursorFeedback = document.createElement('div');
        this.cursorFeedback.className = 'cursor-feedback';
        document.body.appendChild(this.cursorFeedback);
    }

    initializeEventListeners() {
        // Bind methods
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Add event listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('touchstart', this.handleTouchStart);
        this.canvas.addEventListener('touchmove', this.handleTouchMove);
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        
        document.getElementById('newGame').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('playSoloBtn').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            document.getElementById('instructionsModal').style.display = 'flex';
        });

        document.getElementById('closeInstructions').addEventListener('click', () => {
            document.getElementById('instructionsModal').style.display = 'none';
        });
    }

    updateCursorFeedback(event, isTouch = false) {
        if (!this.isPlaying) return;
        
        const x = isTouch ? event.touches[0].clientX : event.clientX;
        const y = isTouch ? event.touches[0].clientY : event.clientY;
        
        if (this.currentWord) {
            this.cursorFeedback.style.display = 'block';
            this.cursorFeedback.style.left = `${x}px`;
            this.cursorFeedback.style.top = `${y}px`;
            this.cursorFeedback.textContent = this.currentWord;
        } else {
            this.cursorFeedback.style.display = 'none';
        }
    }

    startGame() {
        document.getElementById('startModal').style.display = 'none';
        document.getElementById('player1Score').textContent = 'Score: 0';
        
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
            this.updateCursorFeedback(event);
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
            this.updateCursorFeedback(event);
        }
    }

    handleMouseUp(event) {
        if (!this.isPlaying) return;
        this.isMouseDown = false;
        this.cursorFeedback.style.display = 'none';
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
            this.updateCursorFeedback(event, true);
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
            this.updateCursorFeedback(event, true);
        }
    }

    handleTouchEnd(event) {
        if (!this.isPlaying) return;
        event.preventDefault();
        this.cursorFeedback.style.display = 'none';
        this.handleWordSubmission();
    }

    getCellFromCoordinates(x, y) {
        const padding = this.cellSize * 0.3;
        const adjustedX = x - padding / 2;
        const adjustedY = y - padding / 2;
        
        const row = Math.floor(adjustedY / this.cellSize);
        const col = Math.floor(adjustedX / this.cellSize);
        
        const cellX = adjustedX - (col * this.cellSize);
        const cellY = adjustedY - (row * this.cellSize);
        
        if (row >= 0 && row < 4 && col >= 0 && col < 4 &&
            cellX >= padding/2 && cellX <= this.cellSize - padding/2 &&
            cellY >= padding/2 && cellY <= this.cellSize - padding/2) {
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

    async handleWordSubmission() {
        if (!this.currentWord || this.currentWord.length < 3) {
            this.resetSelection();
            return;
        }

        try {
            const response = await fetch('/validate/' + this.currentWord);
            const data = await response.json();
            
            if (data.valid && !this.foundWords.has(this.currentWord)) {
                const points = {3: 100, 4: 400, 5: 800, 6: 1400}[this.currentWord.length] || 0;
                this.score += points;
                this.foundWords.add(this.currentWord);
                this.updateScore();
                this.updateFoundWords();
                this.showFeedback(true, points);
            } else {
                this.showFeedback(false);
            }
        } catch (error) {
            console.error("Error validating word:", error);
        }
        
        this.resetSelection();
    }

    showFeedback(valid, points) {
        const feedback = document.createElement('div');
        feedback.className = `word-feedback ${valid ? 'valid' : ''}`;
        feedback.textContent = valid ? `+${points}` : 'Invalid';
        
        const rect = this.canvas.getBoundingClientRect();
        feedback.style.left = `${rect.left + rect.width / 2}px`;
        feedback.style.top = `${rect.top + rect.height / 2}px`;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }

    showGameOverScreen() {
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        
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
        
        document.body.appendChild(gameOverModal);
        this.updateLeaderboards();
    }

    updateScore() {
        document.getElementById('player1Score').textContent = `Score: ${this.score}`;
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
                this.showGameOverScreen();
                this.isPlaying = false;
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
                soloTbody.innerHTML = '';
                
                data.solo_scores.forEach((score, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${score.score}</td>
                        <td>${new Date(score.game_date).toLocaleString()}</td>
                    `;
                    soloTbody.appendChild(row);
                });
            });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.game = new WordHuntGame();
});
