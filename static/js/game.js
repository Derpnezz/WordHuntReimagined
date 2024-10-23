class WordHuntGame {
    constructor() {
        this.canvas = document.getElementById('gameGrid');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = this.canvas.width / 4;
        this.grid = [];
        this.selectedCells = [];
        this.currentWord = '';
        this.score = 0;
        this.foundWords = new Set();
        this.gameTime = 90; // 1 minute and 30 seconds
        this.isPlaying = false;
        this.isGameOver = false;
        
        // Create audio elements for feedback
        this.validWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');
        this.invalidWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Touch events
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        document.getElementById('newGame').addEventListener('click', () => this.startNewGame());
    }

    async startNewGame() {
        // Clean up any existing game over modal
        const modal = document.querySelector('.game-over-modal');
        if (modal) {
            modal.remove();
        }

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.isGameOver = false;
        
        try {
            const response = await fetch('/new-grid');
            const data = await response.json();
            console.log("Received grid data:", data);
            
            if (data && data.grid) {
                this.grid = data.grid;
                console.log("Grid array:", this.grid);
                this.score = 0;
                this.foundWords = new Set();
                this.updateScore();
                this.updateFoundWords();
                this.drawGrid();
                this.startTimer();
            } else {
                console.error("Invalid grid data received:", data);
            }
        } catch (error) {
            console.error("Error fetching grid:", error);
        }
    }

    isAdjacent(cell1, cell2) {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        
        // Allow any adjacent movement (including diagonals)
        if (rowDiff > 1 || colDiff > 1 || (rowDiff === 0 && colDiff === 0)) {
            return false;
        }

        // Calculate angle of movement
        const angle = Math.atan2(cell2.row - cell1.row, cell2.col - cell1.col) * (180 / Math.PI);
        const normalizedAngle = ((angle + 360) % 360); // Convert to 0-360 range
        
        // Define wider diagonal zones (45° around each diagonal)
        // Centered at 45°, 135°, 225°, and 315°
        const isDiagonal = 
            (normalizedAngle >= 22.5 && normalizedAngle <= 67.5) ||   // NE diagonal (45° ± 22.5°)
            (normalizedAngle >= 112.5 && normalizedAngle <= 157.5) || // SE diagonal (135° ± 22.5°)
            (normalizedAngle >= 202.5 && normalizedAngle <= 247.5) || // SW diagonal (225° ± 22.5°)
            (normalizedAngle >= 292.5 && normalizedAngle <= 337.5);   // NW diagonal (315° ± 22.5°)
            
        // For diagonal movement, both row and col must change
        if (isDiagonal) {
            return rowDiff === 1 && colDiff === 1;
        }
        
        // For orthogonal movement, either row or col must be unchanged
        return rowDiff === 0 || colDiff === 0;
    }

    drawGrid() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.drawCell(i, j);
            }
        }

        // Draw connecting lines for selected cells
        if (this.selectedCells.length > 1) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#0dcaf0'; // Bootstrap info color
            this.ctx.lineWidth = 3;
            
            const startCell = this.selectedCells[0];
            this.ctx.moveTo(
                startCell.col * this.cellSize + this.cellSize/2,
                startCell.row * this.cellSize + this.cellSize/2
            );
            
            for (let i = 1; i < this.selectedCells.length; i++) {
                const cell = this.selectedCells[i];
                this.ctx.lineTo(
                    cell.col * this.cellSize + this.cellSize/2,
                    cell.row * this.cellSize + this.cellSize/2
                );
            }
            this.ctx.stroke();
        }
    }

    drawCell(row, col) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        const padding = 2;
        
        // Check if cell is selected
        const isSelected = this.selectedCells.some(cell => cell.row === row && cell.col === col);
        
        // Draw cell background
        this.ctx.fillStyle = isSelected ? '#0d6efd' : '#212529'; // Bootstrap primary and dark colors
        this.ctx.fillRect(x + padding, y + padding, this.cellSize - 2*padding, this.cellSize - 2*padding);
        
        // Draw cell border
        this.ctx.strokeStyle = '#6c757d'; // Bootstrap secondary color
        this.ctx.strokeRect(x + padding, y + padding, this.cellSize - 2*padding, this.cellSize - 2*padding);
        
        // Draw letter with better contrast
        if (this.grid[row] && this.grid[row][col]) {
            this.ctx.fillStyle = isSelected ? '#ffffff' : '#f8f9fa'; // White or light color
            this.ctx.font = `bold ${Math.floor(this.cellSize * 0.6)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                this.grid[row][col],
                x + this.cellSize/2,
                y + this.cellSize/2
            );
        }
    }

    getCellFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null);
        
        if (clientX === null || clientY === null) return null;
        
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            return { row, col };
        }
        return null;
    }

    handleMouseDown(e) {
        if (this.isGameOver) return;
        
        const cell = this.getCellFromEvent(e);
        if (cell) {
            this.selectedCells = [cell];
            this.currentWord = this.grid[cell.row][cell.col];
            this.drawGrid();
        }
    }

    handleMouseMove(e) {
        if (this.isGameOver || this.selectedCells.length === 0) return;
        
        const cell = this.getCellFromEvent(e);
        if (cell && !this.isCellSelected(cell.row, cell.col)) {
            const lastCell = this.selectedCells[this.selectedCells.length - 1];
            if (this.isAdjacent(lastCell, cell)) {
                this.selectedCells.push(cell);
                this.currentWord += this.grid[cell.row][cell.col];
                this.drawGrid();
            }
        }
    }

    handleMouseUp() {
        this.handleWordSubmission();
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (this.isGameOver) return;
        
        const cell = this.getCellFromEvent(e);
        if (cell) {
            this.selectedCells = [cell];
            this.currentWord = this.grid[cell.row][cell.col];
            this.drawGrid();
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (this.isGameOver || this.selectedCells.length === 0) return;
        
        const cell = this.getCellFromEvent(e);
        if (cell && !this.isCellSelected(cell.row, cell.col)) {
            const lastCell = this.selectedCells[this.selectedCells.length - 1];
            if (this.isAdjacent(lastCell, cell)) {
                this.selectedCells.push(cell);
                this.currentWord += this.grid[cell.row][cell.col];
                this.drawGrid();
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.handleWordSubmission();
    }

    async handleWordSubmission() {
        if (this.isGameOver || !this.currentWord || this.currentWord.length < 3) {
            this.resetSelection();
            return;
        }

        try {
            const response = await fetch(`/validate/${this.currentWord}`);
            const data = await response.json();
            
            if (data.valid && !this.foundWords.has(this.currentWord)) {
                this.validWordSound.play();
                this.foundWords.add(this.currentWord);
                this.score += this.currentWord.length;
                this.updateScore();
                this.updateFoundWords();
                this.showFeedback(true);
            } else {
                this.invalidWordSound.play();
                this.showFeedback(false);
            }
        } catch (error) {
            console.error("Error validating word:", error);
        }

        this.resetSelection();
    }

    resetSelection() {
        this.selectedCells = [];
        this.currentWord = '';
        this.drawGrid();
    }

    isCellSelected(row, col) {
        return this.selectedCells.some(cell => cell.row === row && cell.col === col);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateFoundWords() {
        const wordsList = document.getElementById('foundWords');
        wordsList.innerHTML = '';
        const words = Array.from(this.foundWords);
        words.sort();
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${word} (+${word.length})`;
            wordsList.appendChild(li);
        }
    }

    showFeedback(isValid) {
        const cell = this.selectedCells[this.selectedCells.length - 1];
        const x = cell.col * this.cellSize + this.cellSize/2;
        const y = cell.row * this.cellSize + this.cellSize/2;
        
        // Create feedback element
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `word-feedback ${isValid ? 'valid' : 'invalid'}`;
        
        if (isValid) {
            feedbackDiv.textContent = `+${this.currentWord.length}`;
            feedbackDiv.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
                opacity: 0;
                transition: all 0.3s ease-out;
            `;
        } else {
            // For invalid words, add shake animation to the selected path
            this.canvas.classList.add('shake');
            setTimeout(() => this.canvas.classList.remove('shake'), 500);
        }
        
        document.querySelector('.game-container').appendChild(feedbackDiv);
        
        // Trigger animation
        if (isValid) {
            requestAnimationFrame(() => {
                feedbackDiv.style.transform = 'translate(-50%, -150%)';
                feedbackDiv.style.opacity = '1';
            });
        }
        
        setTimeout(() => {
            feedbackDiv.remove();
        }, 1000);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        let timeLeft = this.gameTime;
        const timerElement = document.getElementById('timer');
        
        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft === 0) {
                clearInterval(this.timerInterval);
                this.isGameOver = true;
                this.showGameOverScreen();
            }
            timeLeft--;
        };

        updateTimer(); // Initial update
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    showGameOverScreen() {
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        gameOverModal.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <p>Final Score: ${this.score}</p>
                <p>Words Found: ${this.foundWords.size}</p>
                <button class="btn btn-primary" onclick="window.game.startNewGame()">Play Again</button>
            </div>
        `;
        document.body.appendChild(gameOverModal);
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WordHuntGame();
    game.startNewGame();
});
