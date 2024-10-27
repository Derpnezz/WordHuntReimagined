class WordHuntGame {
    constructor() {
        // ... previous constructor code ...
        [Previous content from lines 1-142]

    showGameOverScreen(finalScores, isWinner) {
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        
        let gameOverContent = '';
        
        if (this.isSinglePlayer) {
            gameOverContent = `
                <div class="game-over-content">
                    <h2>Game Over!</h2>
                    <div class="final-scores mb-3">
                        <h3>Final Score: ${this.score}</h3>
                    </div>
                    <button class="btn btn-primary" onclick="window.location.reload()">Play Again</button>
                </div>
            `;
            
            // Save solo score
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
        } else {
            let scoresList = '';
            Object.keys(finalScores).forEach((userId, index) => {
                scoresList += '<p>Player ' + (index + 1) + ': ' + finalScores[userId] + 
                             (userId === this.userId ? ' (You)' : '') + '</p>';
            });

            gameOverContent = `
                <div class="game-over-content">
                    <h2>${isWinner ? 'You Won!' : 'Game Over!'}</h2>
                    <div class="final-scores mb-3">
                        <h3>Final Scores:</h3>
                        ${scoresList}
                    </div>
                    <button class="btn btn-primary" onclick="window.location.reload()">Play Again</button>
                </div>
            `;
        }
        
        gameOverModal.innerHTML = gameOverContent;
        document.body.appendChild(gameOverModal);
        
        // Update leaderboards
        this.updateLeaderboards();
    }

    updateLeaderboards() {
        fetch('/leaderboard')
            .then(response => response.json())
            .then(data => {
                const soloTbody = document.querySelector('#singleplayer-scores tbody');
                const multiTbody = document.querySelector('#multiplayer-scores tbody');
                
                soloTbody.innerHTML = '';
                multiTbody.innerHTML = '';
                
                data.solo_scores.forEach((score, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${score.score}</td>
                        <td>${new Date(score.game_date).toLocaleString()}</td>
                    `;
                    soloTbody.appendChild(row);
                });
                
                data.multi_scores.forEach((score, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${score.score}</td>
                        <td>${new Date(score.game_date).toLocaleString()}</td>
                    `;
                    multiTbody.appendChild(row);
                });
            });
    }

    // ... rest of the existing methods ...
}

document.addEventListener('DOMContentLoaded', function() {
    window.game = new WordHuntGame();
    window.game.showStartScreen();
});
