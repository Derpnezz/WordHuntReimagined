class WordHuntGame {
    constructor() {
        this.canvas = document.getElementById('gameGrid');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 100;
        this.grid = [];
        this.selectedCells = [];
        this.currentWord = '';
        this.score = 0;
        this.foundWords = new Set();
        this.gameTime = 180; // 3 minutes
        this.isPlaying = false;
        this.isGameOver = false;
        
        // Create audio elements for feedback
        this.validWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelpCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaagnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');
        this.invalidWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.getElementById('newGame').addEventListener('click', () => this.startNewGame());
    }

    async startNewGame() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.isGameOver = false;
        const response = await fetch('/new-grid');
        const data = await response.json();
        this.grid = data.grid;
        this.score = 0;
        this.foundWords.clear();
        this.updateScore();
        this.updateFoundWords();
        this.drawGrid();
        this.startTimer();
    }

    drawGrid() {
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
            this.ctx.strokeStyle = 'var(--bs-info)';
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

    drawCell(row, col, isSelected = false) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
        // Check if cell is selected
        isSelected = this.selectedCells.some(cell => cell.row === row && cell.col === col);
        
        this.ctx.fillStyle = isSelected ? 'var(--bs-primary)' : 'var(--bs-dark)';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        this.ctx.strokeStyle = 'var(--bs-secondary)';
        this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        
        this.ctx.fillStyle = isSelected ? 'white' : 'var(--bs-light)';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            this.grid[row][col],
            x + this.cellSize/2,
            y + this.cellSize/2
        );
    }

    async validateWord(word) {
        const response = await fetch(`/validate/${word}`);
        const data = await response.json();
        return data.valid;
    }

    handleMouseDown(e) {
        if (this.isGameOver) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            this.selectedCells = [{row, col}];
            this.currentWord = this.grid[row][col];
            this.drawGrid();
        }
    }

    handleMouseMove(e) {
        if (this.isGameOver || this.selectedCells.length === 0) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            const lastCell = this.selectedCells[this.selectedCells.length - 1];
            
            if (this.isAdjacent(lastCell, {row, col}) && 
                !this.isCellSelected(row, col)) {
                this.selectedCells.push({row, col});
                this.currentWord += this.grid[row][col];
                this.drawGrid();
            }
        }
    }

    async handleMouseUp() {
        if (this.isGameOver) return;
        
        if (this.currentWord.length >= 3) {
            const isValid = await this.validateWord(this.currentWord);
            if (isValid && !this.foundWords.has(this.currentWord)) {
                this.validWordSound.play();
                this.foundWords.add(this.currentWord);
                this.score += this.currentWord.length;
                this.updateScore();
                this.updateFoundWords();
                
                // Visual feedback for valid word
                this.showFeedback(true);
            } else if (this.currentWord.length >= 3) {
                this.invalidWordSound.play();
                // Visual feedback for invalid word
                this.showFeedback(false);
            }
        }
        
        this.selectedCells = [];
        this.currentWord = '';
        this.drawGrid();
    }

    showFeedback(isValid) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback ${isValid ? 'valid' : 'invalid'}`;
        feedbackDiv.textContent = isValid ? '+' + this.currentWord.length : 'Invalid';
        document.querySelector('.game-container').appendChild(feedbackDiv);
        
        setTimeout(() => {
            feedbackDiv.remove();
        }, 1000);
    }

    isAdjacent(cell1, cell2) {
        const rowDiff = Math.abs(cell1.row - cell2.row);
        const colDiff = Math.abs(cell1.col - cell2.col);
        return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
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
        [...this.foundWords].sort().forEach(word => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${word} (+${word.length})`;
            wordsList.appendChild(li);
        });
    }

    showGameOverScreen() {
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        gameOverModal.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <p>Final Score: ${this.score}</p>
                <p>Words Found: ${this.foundWords.size}</p>
                <button class="btn btn-primary" onclick="game.startNewGame()">Play Again</button>
            </div>
        `;
        document.body.appendChild(gameOverModal);
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        let timeLeft = this.gameTime;
        const timerElement = document.getElementById('timer');
        
        this.timerInterval = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft === 0) {
                clearInterval(this.timerInterval);
                this.isGameOver = true;
                this.showGameOverScreen();
            }
            
            timeLeft--;
        }, 1000);
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new WordHuntGame();
    game.startNewGame();
});
