[Previous content remains the same until line 376]
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
        
        this.updateLeaderboards();
[Rest of the file remains unchanged]
