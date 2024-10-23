class WordHuntGame {
    constructor() {
        // ... rest of the constructor remains the same ...
    }

    // ... other methods remain the same ...

    showFeedback(isValid) {
        if (!isValid) return;  // Simply return for invalid words

        const cell = this.selectedCells[this.selectedCells.length - 1];
        const x = cell.col * this.cellSize + this.cellSize/2;
        const y = cell.row * this.cellSize + this.cellSize/2;
        
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'word-feedback valid';
        feedbackDiv.textContent = `+${this.currentWord.length}`;
        feedbackDiv.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: all 0.3s ease-out;
        `;
        
        document.querySelector('.game-container').appendChild(feedbackDiv);
        
        requestAnimationFrame(() => {
            feedbackDiv.style.transform = 'translate(-50%, -150%)';
            feedbackDiv.style.opacity = '1';
        });
        
        setTimeout(() => {
            feedbackDiv.remove();
        }, 1000);
    }

    // ... rest of the class remains the same ...
}

// ... rest of the file remains the same ...
