const gameTime = 85; // ONE MINUTE THIRTY SECONDS FOR THE GAME

// Dictionary loading
let WORD_DICT = new Set();

// Load the dictionary when the page loads
fetch('/words.txt')
    .then(response => response.text())
    .then(text => {
        const words = text.split('\n').filter(word => word.trim() !== '');
        WORD_DICT = new Set(words);
        console.log(`Dictionary loaded with ${WORD_DICT.size} words`);
    })
    .catch(error => {
        console.error('Error loading dictionary:', error);
    });

// Grid generation constants
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const WEIGHTS = [17, 3, 8, 9, 20, 6, 3, 12, 17, 1/3, 3, 12, 9, 15, 17, 2, 2, 13, 19, 19, 3, 2, 7, 1/3, 3, 1/3].map(w => w / 222);

// Function to generate a new grid
function generateGrid() {
    const grid = [];
    for (let i = 0; i < 4; i++) {
        const row = [];
        for (let j = 0; j < 4; j++) {
            // Use weighted random selection
            let rand = Math.random();
            let cumulativeWeight = 0;
            let selectedLetter = LETTERS[0]; // Default in case of error
            
            for (let k = 0; k < LETTERS.length; k++) {
                cumulativeWeight += WEIGHTS[k];
                if (rand <= cumulativeWeight) {
                    selectedLetter = LETTERS[k];
                    break;
                }
            }
            row.push(selectedLetter);
        }
        grid.push(row);
    }
    return grid;
}

// Function to validate a word
function isValidWord(word) {
    return WORD_DICT.has(word);
}

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
        this.timeLeft = gameTime;
        this.isMouseDown = false;
        
        // Set up event listeners
        this.setupEventListeners();
        this.setupGameControls();
    }

    setupEventListeners() {
        // Bind methods
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Add event listeners with passive option for better performance
        const eventOptions = { passive: true };
        this.canvas.addEventListener('mousedown', this.handleMouseDown, eventOptions);
        this.canvas.addEventListener('mousemove', this.handleMouseMove, eventOptions);
        this.canvas.addEventListener('mouseup', this.handleMouseUp, eventOptions);
        this.canvas.addEventListener('touchstart', this.handleTouchStart);  // Can't be passive due to preventDefault
        this.canvas.addEventListener('touchmove', this.handleTouchMove);    // Can't be passive due to preventDefault
        this.canvas.addEventListener('touchend', this.handleTouchEnd);      // Can't be passive due to preventDefault
    }

    setupGameControls() {
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                document.getElementById('instructionsModal').style.display = 'flex';
            });
        }

        const closeInstructions = document.getElementById('closeInstructions');
        if (closeInstructions) {
            closeInstructions.addEventListener('click', () => {
                document.getElementById('instructionsModal').style.display = 'none';
            });
        }

        const playSoloBtn = document.getElementById('playSoloBtn');
        if (playSoloBtn) {
            playSoloBtn.addEventListener('click', () => this.startGame());
        }

        const newGameBtn = document.getElementById('newGame');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => window.location.reload());
        }
    }

    startGame() {
        document.getElementById('startModal').style.display = 'none';
        document.getElementById('player1Score').textContent = 'Score: 0';
        
        // Generate a new grid client-side
        this.grid = generateGrid();
        this.score = 0;
        this.foundWords.clear();
        this.updateScore();
        this.updateFoundWords();
        this.drawGrid();
        this.startTimer();
        this.isPlaying = true;
        this.updateCurrentWordDisplay('');
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
            this.updateCurrentWordDisplay(this.currentWord);
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

    updateCurrentWordDisplay(word) {
        const display = document.getElementById('currentWordDisplay');
        if (display) {
            display.textContent = word;
        }
    }

    resetSelection() {
        this.selectedCells = [];
        this.currentWord = '';
        this.updateCurrentWordDisplay('');
        this.drawGrid();
    }

    handleWordSubmission() {
        if (!this.currentWord || this.currentWord.length < 3) {
            this.resetSelection();
            return;
        }

        if (this.foundWords.has(this.currentWord)) {
            this.showFeedback(false);
            this.resetSelection();
            return;
        }

        // Use client-side validation
        const valid = isValidWord(this.currentWord);
        
        if (valid) {
            const points = {
                3: 100, 
                4: 400, 
                5: 800, 
                6: 1400,
                7: 1800,
                8: 2200,
                9: 2600
            }[this.currentWord.length] || 0;
            this.score += points;
            this.foundWords.add(this.currentWord);
            this.updateScore();
            this.updateFoundWords();
            this.showFeedback(true, points);
        } else {
            this.showFeedback(false);
        }
        
        this.resetSelection();
    }

    showFeedback(valid, points) {
        const feedback = document.createElement('div');
        let feedbackClass = 'valid';
        let feedbackText = `+${points}`;
        
        if (!valid) {
            if (this.foundWords.has(this.currentWord)) {
                feedbackClass = 'duplicate';
                feedbackText = 'Invalid';
            } else {
                feedbackClass = 'invalid';
                feedbackText = 'Invalid';
            }
        }
        
        feedback.className = `word-feedback ${feedbackClass}`;
        feedback.textContent = feedbackText;
        
        const lastCell = this.selectedCells[this.selectedCells.length - 1];
        if (!lastCell) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = rect.left + (lastCell.col * this.cellSize) + (this.cellSize / 2);
        const y = rect.top + (lastCell.row * this.cellSize) + (this.cellSize / 2);
        
        feedback.style.left = `${x}px`;
        feedback.style.top = `${y}px`;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 500);
    }

    drawGrid() {
        // Pre-calculate common values and cache styles
        const width = this.canvas.width;
        const height = this.canvas.height;
        const halfCellSize = this.cellSize / 2;
        
        this.ctx.clearRect(0, 0, width, height);
        
        // Set text properties once
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Draw grid cells and letters
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
                if (this.grid[row]?.[col]) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillText(
                        this.grid[row][col],
                        x + halfCellSize,
                        y + halfCellSize
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

    showGameOverScreen() {
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        
        gameOverModal.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <div class="final-scores mb-3">
                    <h3>Final Score: ${this.score}</h3>
                </div>
                <button class="btn btn-primary" id="playAgainBtn">Play Again</button>
            </div>
        `;
        
        document.body.appendChild(gameOverModal);

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            window.location.reload();
        });
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
        
        this.timeLeft = gameTime;
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
}

// Initialize game when DOM is loaded with optimized event handling
document.addEventListener('DOMContentLoaded', () => {
    window.game = new WordHuntGame();
});