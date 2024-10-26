// ... previous code remains the same until line 287 ...
                this.validWordSound.play();
                this.foundWords.add(this.currentWord);
                let points;
                switch(this.currentWord.length) {
                    case 3: points = 100; break;
                    case 4: points = 400; break;
                    case 5: points = 800; break;
                    case 6: points = 1400; break;
                    default: points = 0;
                }
                this.score += points;
                this.updateScore();
                this.updateFoundWords();
                this.showFeedback(true, points);
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
        const wordsArray = Array.from(this.foundWords);
        wordsArray.sort();
        for (let i = 0; i < wordsArray.length; i++) {
            const word = wordsArray[i];
            const points = (() => {
                switch(word.length) {
                    case 3: return 100;
                    case 4: return 400;
                    case 5: return 800;
                    case 6: return 1400;
                    default: return 0;
                }
            })();
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${word} (+${points})`;
            wordsList.appendChild(li);
        }
    }

    showFeedback(isValid, points) {
        const cell = this.selectedCells[this.selectedCells.length - 1];
        const x = cell.col * this.cellSize + this.cellSize/2;
        const y = cell.row * this.cellSize + this.cellSize/2;
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `word-feedback ${isValid ? 'valid' : 'invalid'}`;
        
        if (isValid) {
            feedbackDiv.textContent = `+${points}`;
            feedbackDiv.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
                opacity: 0;
                transition: all 0.3s ease-out;
            `;
        } else {
            this.canvas.classList.add('shake');
            setTimeout(() => this.canvas.classList.remove('shake'), 500);
        }
        
        document.querySelector('.game-container').appendChild(feedbackDiv);
        
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

    // ... rest of the code remains the same ...
