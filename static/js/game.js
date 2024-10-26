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
        this.grid = [];
        for (var i = 0; i < 4; i++) {
            var row = [];
            for (var j = 0; j < 4; j++) {
                row.push('');
            }
            this.grid.push(row);
        }
        
        // Initialize sounds
        this.validWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');
        this.invalidWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');

        // Initialize Socket.IO
        this.socket = io();
        this.roomId = null;
        this.userId = null;
        this.isHost = false;

        // Bind event handlers
        var self = this;
        this.handleMouseDown = function(event) { self._handleMouseDown(event); };
        this.handleMouseMove = function(event) { self._handleMouseMove(event); };
        this.handleMouseUp = function() { self._handleMouseUp(); };
        this.handleTouchStart = function(event) { self._handleTouchStart(event); };
        this.handleTouchMove = function(event) { self._handleTouchMove(event); };
        this.handleTouchEnd = function(event) { self._handleTouchEnd(event); };
        
        this.setupEventListeners();
        this.setupSocketListeners();
        console.log('WordHuntGame initialized');
    }

    setupSocketListeners() {
        var self = this;
        
        this.socket.on('connected', function(data) {
            self.userId = data.user_id;
            console.log('Connected with user ID:', self.userId);
        });

        this.socket.on('room_created', function(data) {
            self.roomId = data.room_id;
            self.isHost = true;
            document.getElementById('roomIdDisplay').textContent = data.room_id;
            document.getElementById('hostControls').style.display = 'block';
            document.getElementById('menuOptions').style.display = 'none';
            document.getElementById('waitingRoom').style.display = 'block';
            self.updatePlayersList(data.players);
        });

        this.socket.on('player_joined', function(data) {
            self.updatePlayersList(data.players);
            if (self.isHost && data.players.length === 2) {
                document.getElementById('startGameBtn').disabled = false;
            }
        });

        this.socket.on('game_ready', function() {
            console.log('Game is ready to start');
        });

        this.socket.on('game_started', function(data) {
            document.getElementById('startModal').style.display = 'none';
            self.grid = data.grid;
            self.startGame();
        });

        this.socket.on('score_update', function(data) {
            if (data.word && !self.foundWords.has(data.word)) {
                self.foundWords.add(data.word);
                var wordList = document.getElementById('foundWords');
                var li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = data.word + ' (+' + data.points + ')';
                wordList.appendChild(li);
            }
            self.updateScores(data.scores);
        });

        this.socket.on('game_ended', function(data) {
            self.isGameOver = true;
            self.showGameOver(data.winner === self.userId, data.final_scores);
        });

        // Add click handlers for multiplayer buttons
        document.getElementById('createRoomBtn').addEventListener('click', function() {
            document.getElementById('menuOptions').style.display = 'none';
            document.getElementById('waitingRoom').style.display = 'block';
            self.socket.emit('create_room');
        });

        document.getElementById('joinRoomBtn').addEventListener('click', function() {
            var roomId = document.getElementById('roomIdInput').value.trim();
            if (roomId) {
                self.socket.emit('join_room', { room_id: roomId });
            }
        });

        document.getElementById('startGameBtn').addEventListener('click', function() {
            if (self.roomId) {
                self.socket.emit('start_game', { room_id: self.roomId });
            }
        });
    }

    updatePlayersList(players) {
        var playersList = document.getElementById('playersList');
        if (!playersList) return;
        
        playersList.innerHTML = '';
        for (var i = 0; i < players.length; i++) {
            var playerId = players[i];
            var li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = playerId === this.userId ? 'You' : 'Opponent';
            playersList.appendChild(li);
        }
    }

    updateScores(scores) {
        var self = this;
        Object.keys(scores).forEach(function(playerId) {
            var score = scores[playerId];
            var scoreElement = document.getElementById(playerId === self.userId ? 'player1Score' : 'player2Score');
            if (scoreElement) {
                scoreElement.textContent = (playerId === self.userId ? 'You' : 'Opponent') + ': ' + score;
            }
        });
    }

    showGameOver(isWinner, finalScores) {
        var self = this;
        var modal = document.createElement('div');
        modal.className = 'game-over-modal';
        var finalScoresHtml = '';
        Object.keys(finalScores).forEach(function(playerId) {
            finalScoresHtml += '<p>' + (playerId === self.userId ? 'You' : 'Opponent') + ': ' + finalScores[playerId] + '</p>';
        });
        
        modal.innerHTML = '\
            <div class="game-over-content">\
                <h2>' + (isWinner ? 'You Won!' : 'Game Over') + '</h2>\
                <p>Final Scores:</p>\
                <div class="final-scores">\
                    ' + finalScoresHtml + '\
                </div>\
                <button class="btn btn-primary mt-3" onclick="location.reload()">Play Again</button>\
            </div>\
        ';
        document.body.appendChild(modal);
    }

    startGame() {
        this.score = 0;
        this.foundWords = new Set();
        this.selectedCells = [];
        this.currentWord = '';
        this.isPlaying = true;
        this.isGameOver = false;
        this.drawGrid();
        this.startTimer();
        
        // Reset UI elements
        document.getElementById('foundWords').innerHTML = '';
        document.getElementById('player1Score').textContent = 'You: 0';
        document.getElementById('player2Score').textContent = 'Opponent: 0';
    }

    startTimer() {
        var self = this;
        var timeLeft = this.gameTime;
        var timerElement = document.getElementById('timer');
        
        function updateTimer() {
            var minutes = Math.floor(timeLeft / 60);
            var seconds = timeLeft % 60;
            timerElement.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            
            if (timeLeft === 0) {
                clearInterval(self.timerInterval);
                if (self.roomId) {
                    self.socket.emit('game_over', { room_id: self.roomId });
                }
            }
            timeLeft--;
        }
        
        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    drawGrid() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 4; col++) {
                var x = col * this.cellSize;
                var y = row * this.cellSize;
                
                // Draw cell background
                this.ctx.fillStyle = this.isSelectedCell(row, col) ? '#4a5568' : '#1a202c';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                // Draw cell border
                this.ctx.strokeStyle = '#2d3748';
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
                
                // Draw letter
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 48px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    this.grid[row][col],
                    x + this.cellSize/2,
                    y + this.cellSize/2
                );
            }
        }
        
        // Draw line through selected cells
        if (this.selectedCells.length > 1) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#4299e1';
            this.ctx.lineWidth = 8;
            
            for (var i = 0; i < this.selectedCells.length; i++) {
                var cell = this.selectedCells[i];
                var cellX = cell.col * this.cellSize + this.cellSize/2;
                var cellY = cell.row * this.cellSize + this.cellSize/2;
                
                if (i === 0) {
                    this.ctx.moveTo(cellX, cellY);
                } else {
                    this.ctx.lineTo(cellX, cellY);
                }
            }
            
            this.ctx.stroke();
        }
    }

    isSelectedCell(row, col) {
        for (var i = 0; i < this.selectedCells.length; i++) {
            if (this.selectedCells[i].row === row && this.selectedCells[i].col === col) {
                return true;
            }
        }
        return false;
    }

    showFeedback(isValid) {
        var feedbackElement = document.createElement('div');
        feedbackElement.className = 'word-feedback ' + (isValid ? 'valid' : '');
        feedbackElement.textContent = isValid ? '+' + this.calculatePoints(this.currentWord) : 'X';
        
        var rect = this.canvas.getBoundingClientRect();
        feedbackElement.style.left = (rect.left + rect.width/2) + 'px';
        feedbackElement.style.top = (rect.top + rect.height/2) + 'px';
        
        document.body.appendChild(feedbackElement);
        
        setTimeout(function() {
            document.body.removeChild(feedbackElement);
        }, 1000);
    }

    calculatePoints(word) {
        var pointsMap = {
            3: 100,
            4: 400,
            5: 800,
            6: 1400
        };
        return pointsMap[word.length] || 0;
    }

    _handleMouseDown(event) {
        console.log('Mouse down event');
        if (!this.isPlaying) return;
        var cell = this.getCellFromEvent(event);
        if (cell) {
            this.selectedCells = [cell];
            this.currentWord = this.grid[cell.row][cell.col];
            this.drawGrid();
        }
    }

    _handleMouseMove(event) {
        if (!this.isPlaying || this.selectedCells.length === 0) return;
        var cell = this.getCellFromEvent(event);
        if (cell && this.isValidNextCell(cell)) {
            this.selectedCells.push(cell);
            this.currentWord += this.grid[cell.row][cell.col];
            this.drawGrid();
        }
    }

    _handleMouseUp() {
        if (!this.isPlaying) return;
        this.handleWordSubmission();
        this.selectedCells = [];
        this.currentWord = '';
        this.drawGrid();
    }

    _handleTouchStart(event) {
        event.preventDefault();
        this._handleMouseDown(event.touches[0]);
    }

    _handleTouchMove(event) {
        event.preventDefault();
        this._handleMouseMove(event.touches[0]);
    }

    _handleTouchEnd(event) {
        event.preventDefault();
        this._handleMouseUp();
    }

    getCellFromEvent(event) {
        var rect = this.canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var row = Math.floor(y / this.cellSize);
        var col = Math.floor(x / this.cellSize);
        if (row >= 0 && row < 4 && col >= 0 && col < 4) {
            return { row: row, col: col };
        }
        return null;
    }

    isValidNextCell(cell) {
        if (this.selectedCells.length === 0) return true;
        
        var lastCell = this.selectedCells[this.selectedCells.length - 1];
        var rowDiff = Math.abs(cell.row - lastCell.row);
        var colDiff = Math.abs(cell.col - lastCell.col);
        
        // Check if the cell is already selected
        for (var i = 0; i < this.selectedCells.length; i++) {
            if (this.selectedCells[i].row === cell.row && this.selectedCells[i].col === cell.col) {
                return false;
            }
        }
        
        // Check if the cell is adjacent (including diagonals)
        return rowDiff <= 1 && colDiff <= 1;
    }

    setupEventListeners() {
        if (!this.canvas) return;
        
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        
        this.canvas.addEventListener('touchstart', this.handleTouchStart);
        this.canvas.addEventListener('touchmove', this.handleTouchMove);
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        
        var self = this;
        document.getElementById('newGame').addEventListener('click', function() {
            if (self.roomId) {
                location.reload();
            } else {
                self.showStartScreen();
            }
        });
    }

    async handleWordSubmission() {
        if (this.isGameOver || !this.currentWord || this.currentWord.length < 3 || !this.roomId) {
            this.selectedCells = [];
            this.currentWord = '';
            this.drawGrid();
            return;
        }

        try {
            var response = await fetch('/validate/' + this.currentWord);
            var data = await response.json();
            
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
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.game = new WordHuntGame();
});
