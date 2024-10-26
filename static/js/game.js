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
            this.foundWords = new Set();
            this.updateScore();
            this.updateFoundWords();
            this.drawGrid();
            this.startTimer();
            this.isPlaying = true;
        });

        this.socket.on('score_update', (data) => {
            const playerScores = data.scores;
            Object.keys(playerScores).forEach((userId, index) => {
                const scoreElement = document.getElementById(`player${index + 1}Score`);
                if (scoreElement) {
                    scoreElement.textContent = `Player ${index + 1}: ${playerScores[userId]}`;
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
        });
    }

    [Rest of the code remains the same...]
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new WordHuntGame();
    window.game.showStartScreen();
});
