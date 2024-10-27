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
        this.grid = Array(4).fill().map(function() { return Array(4).fill(''); });
        
        // Initialize sounds
        this.validWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');
        this.invalidWordSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDQA0Yb8Pv4pVQGxNguu/tpmEjGlSs6/G0cSwgSZ7n8cF+NyY9jd/w0JJGLjJ23OnhpFwxKGDR6+2ycjUuRp3j7taJQDEsYsrrybKETCMVK3O3vpFxBwY0j9Tf0LWloIxuTyIWDhseNmurxt3s9/rZ0LWciGhKHRMPERIgL1eRttnz/vvYx6GTdVUqGg0LCRMhL06Hqsrw/v7i0LSfe2M2JBQMCg0YKE2EpsTt/f/r38i7loRvTDcZDQgMGCdDgp+/6v3/9OjRwqONdl9DMxgNChIiN0CAlrjn/P/78unYyrmklH5pUkIoHBUaJzpEaH+cxfL9/Pnx6eDav7Kgl4mAb19QQzkvLzQ6RVFcd5O4zvL29fHs5NzNvrGqpZyRhXlsYVdOQjkyNkBKVGVwgZ/D3Ojj393Z1MzBtKylopuTi4R5cWphWlJNRkBAQ0lPWWNziKjM3uPd2tfTzsW5sKynoZqUjYZ+d3BnYVxXUEpFQkJFTVZibICYxN3l39nV0s7Hura0raSelZCKhH15cmpkX1lTTklERUZLVF9xgpvF3OLc1tLPysS7t7Sup6GZk42HgXx2cGxnYltVTkhERUhQWmZ3iafN3N7Z1NDMx8G5tbGrpZ+YkYuGgHt1b2pmYFtVT0lFRUlSXmp8lLLW4d7Z087JxL+4tbCrpp+Xko2HgX16dG9rZmFcV1FLRkVIT1hldYmjxdvg3dbRzcfBvLi0r6unop2XkYyGgXt1cGxoY15ZU01IRUVKUlxufZS00d7e2dPPycO+urWxramnop6Zk46JgoB7dnFtaWVgW1VQSUZGS1BcbH2SsNDf39rU0MvGwLu3s6+sqKSgm5WQioR/enVwa2dlYFtWUEpGRUlPWmp7kK7P4N/b1dHMx8G8uLSwr6uppaGcl5KMhoF8d3JuamdkX1pUT0lFRUpRW2x+k7DQ397Z09DLxsC7t7Ovrauop6ObmJOOiYSAe3ZxbWllYFtVT0lGRktTXW5/lLHQ3t3Y0s/KxcC7t7SwsK6rqaegnpqWkY2IgoB6dXBsaGRfWlRPSkZGTFReb4CTr87d3dnTz8rFwLu4tLGvrqyrqaWjoZ2Zlo+LhYJ9eHNua2dhXFZRTEhGR05VYG+Bk67N3N3Z08/Lx8K9ubWysK+trKqopKGem5iRjYiFgHt2cW5rZ2JeWFJNSUdIUFZicYOVrc3b29jTz8vHw7+7t7SysK+trauopqShn5yXko6KhIB7dnFtaWVhXVhSTkpIT1VfcIGTq8vb3NnU0MzIxMC8ubazsbCvrq2rqaimop+bl5KOiYSAe3ZxbWllYV1YUk5KSE9VX3CBk6vL29vY09DMycXBvbm2tLKxsK+urauqp6WjoJyYk4+JhIB7dnFtaWViXVhSTkpIT1VfcIGTq8vb29jT0MzJxcG9ubWzsrGwr66trKqop6ShnpqVkIuGgXx3cm5qZmJeWVNPSkdNU19vgZOrzdvb2NPQzMnFwby4tbOysbCvrq2sq6mopaShnpqWkYyHgn14c29rZ2NgWlRPSkdNU19ugJKqzNzc2dTQzcrGwr25trSzsbCvrq6trKuqqKajop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtVUEtISE5WYHGElK3O3NzY087LyMTBvbq2tLOysbCvrq6trKuqqKekop+bl5KNiISAe3dvbGhlYFtV');

        // Initialize Socket.IO
        this.socket = io();
        this.roomId = null;
        this.userId = null;
        this.isHost = false;

        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    setupSocketListeners() {
        var self = this;  // Store reference to 'this' for use in callbacks
        
        this.socket.on('connected', function(data) {
            self.userId = data.user_id;
            console.log('Connected with user ID:', self.userId);
        });

        this.socket.on('room_created', function(data) {
            self.roomId = data.room_id;
            self.isHost = true;
            document.getElementById('menuOptions').style.display = 'none';
            document.getElementById('waitingRoom').style.display = 'block';
            document.getElementById('roomIdDisplay').textContent = self.roomId;
            document.getElementById('hostControls').style.display = 'block';
            self.updatePlayersList(data.players);
        });

        this.socket.on('player_joined', function(data) {
            self.updatePlayersList(data.players);
            if (data.players.length === 2 && self.isHost) {
                document.getElementById('startGameBtn').disabled = false;
            }
        });

        this.socket.on('join_error', function(data) {
            alert(data.message);
        });

        this.socket.on('game_ready', function() {
            if (self.isHost) {
                document.getElementById('startGameBtn').disabled = false;
            }
        });

        this.socket.on('game_started', function(data) {
            document.getElementById('startModal').style.display = 'none';
            self.grid = data.grid;
            self.score = 0;
            self.foundWords.clear();
            self.updateScore();
            self.updateFoundWords();
            self.drawGrid();
            self.startTimer();
            self.isPlaying = true;
        });

        this.socket.on('score_update', function(data) {
            var playerScores = data.scores;
            Object.keys(playerScores).forEach(function(userId, index) {
                var scoreElement = document.getElementById('player' + (index + 1) + 'Score');
                if (scoreElement) {
                    scoreElement.textContent = 'Player ' + (index + 1) + ': ' + playerScores[userId];
                }
            });

            if (data.user_id === self.userId && data.word) {
                self.foundWords.add(data.word);
                self.updateFoundWords();
                self.showFeedback(true, data.points);
            }
        });

        this.socket.on('game_ended', function(data) {
            self.isGameOver = true;
            self.isPlaying = false;
            clearInterval(self.timerInterval);
            var isWinner = data.winner === self.userId;
            self.showGameOverScreen(data.final_scores, isWinner);
        });
    }

    showStartScreen() {
        var self = this;
        var startModal = document.getElementById('startModal');
        if (startModal) {
            startModal.style.display = 'flex';
            
            var createRoomBtn = document.getElementById('createRoomBtn');
            var joinRoomBtn = document.getElementById('joinRoomBtn');
            
            createRoomBtn.onclick = function() {
                self.socket.emit('create_room');
            };

            joinRoomBtn.onclick = function() {
                var roomId = document.getElementById('roomIdInput').value.trim();
                if (roomId) {
                    self.socket.emit('join_room', { room_id: roomId });
                } else {
                    alert('Please enter a room ID');
                }
            };

            var startGameBtn = document.getElementById('startGameBtn');
            startGameBtn.onclick = function() {
                if (self.roomId) {
                    self.socket.emit('start_game', { room_id: self.roomId });
                }
            };
        }
    }

    updatePlayersList(players) {
        var playersList = document.getElementById('playersList');
        if (!playersList) return;
        
        playersList.innerHTML = '';
        var self = this;
        players.forEach(function(playerId, index) {
            var li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = 'Player ' + (index + 1) + (playerId === self.userId ? ' (You)' : '');
            playersList.appendChild(li);
        });
    }

    showGameOverScreen(finalScores, isWinner) {
        var gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        
        var scoresList = '';
        var self = this;
        
        Object.keys(finalScores).forEach(function(userId, index) {
            scoresList += '<p>Player ' + (index + 1) + ': ' + finalScores[userId] + 
                         (userId === self.userId ? ' (You)' : '') + '</p>';
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

    startTimer() {
        var self = this;
        if (this.timerInterval) clearInterval(this.timerInterval);
        
        var timeLeft = this.gameTime;
        var timerElement = document.getElementById('timer');
        
        function updateTimer() {
            var minutes = Math.floor(timeLeft / 60);
            var seconds = timeLeft % 60;
            timerElement.textContent = minutes + ':' + seconds.toString().padStart(2, '0');
            
            if (timeLeft === 0) {
                clearInterval(self.timerInterval);
                self.socket.emit('game_over', { room_id: self.roomId });
                self.isGameOver = true;
            }
            timeLeft--;
        }

        updateTimer();
        this.timerInterval = setInterval(updateTimer, 1000);
    }

    async handleWordSubmission() {
        if (this.isGameOver || !this.currentWord || this.currentWord.length < 3 || !this.roomId) {
            this.resetSelection();
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
        
        this.resetSelection();
    }

    // ... rest of the game methods remain the same ...
}

document.addEventListener('DOMContentLoaded', function() {
    window.game = new WordHuntGame();
    window.game.showStartScreen();
});
