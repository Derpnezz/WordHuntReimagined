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

    [... rest of the existing methods remain unchanged ...]
}

document.addEventListener('DOMContentLoaded', function() {
    window.game = new WordHuntGame();
});
