// Update only the showFeedback method in the existing file
showFeedback(valid, points) {
    const feedback = document.createElement('div');
    let feedbackClass = 'valid';
    let feedbackText = `+${points}`;
    
    if (!valid) {
        if (this.foundWords.has(this.currentWord)) {
            feedbackClass = 'duplicate';
            feedbackText = 'Already Found';
        } else {
            feedbackClass = 'invalid';
            feedbackText = 'Invalid Word';
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
