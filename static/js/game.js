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
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.getElementById('newGame').addEventListener('click', () => this.startNewGame());
    }

    async startNewGame() {
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
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.drawCell(i, j);
            }
        }
    }

    drawCell(row, col, isSelected = false) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
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
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            this.selectedCells = [{row, col}];
            this.currentWord = this.grid[row][col];
            this.drawGrid();
            this.drawCell(row, col, true);
        }
    }

    handleMouseMove(e) {
        if (this.selectedCells.length === 0) return;
        
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
                this.selectedCells.forEach(cell => {
                    this.drawCell(cell.row, cell.col, true);
                });
            }
        }
    }

    async handleMouseUp() {
        if (this.currentWord.length >= 3) {
            const isValid = await this.validateWord(this.currentWord);
            if (isValid && !this.foundWords.has(this.currentWord)) {
                this.foundWords.add(this.currentWord);
                this.score += this.currentWord.length;
                this.updateScore();
                this.updateFoundWords();
            }
        }
        
        this.selectedCells = [];
        this.currentWord = '';
        this.drawGrid();
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
            li.textContent = word;
            wordsList.appendChild(li);
        });
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
                alert(`Game Over! Final Score: ${this.score}`);
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
