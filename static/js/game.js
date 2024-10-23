// ... Previous code remains the same until getCellFromEvent function ...

getCellFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null);
    
    if (clientX === null || clientY === null) return null;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Calculate cell position with padding
    const padding = this.cellSize * 0.2; // 20% padding
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    // Check if within padded area of cell
    const relX = x - (col * this.cellSize);
    const relY = y - (row * this.cellSize);
    
    if (row >= 0 && row < 4 && col >= 0 && col < 4 &&
        relX >= padding && relX <= (this.cellSize - padding) &&
        relY >= padding && relY <= (this.cellSize - padding)) {
        return { row, col };
    }
    return null;
}

isAdjacent(cell1, cell2) {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    
    // Allow any adjacent movement (including diagonals)
    if (rowDiff > 1 || colDiff > 1 || (rowDiff === 0 && colDiff === 0)) {
        return false;
    }

    // Calculate angle of movement
    const angle = Math.atan2(cell2.row - cell1.row, cell2.col - cell1.col) * (180 / Math.PI);
    const normalizedAngle = ((angle + 360) % 360); // Convert to 0-360 range
    
    // Define narrower diagonal zones (30° around each diagonal)
    // Centered at 45°, 135°, 225°, and 315°
    const isDiagonal = 
        (normalizedAngle >= 30 && normalizedAngle <= 60) ||   // NE diagonal
        (normalizedAngle >= 120 && normalizedAngle <= 150) || // SE diagonal
        (normalizedAngle >= 210 && normalizedAngle <= 240) || // SW diagonal
        (normalizedAngle >= 300 && normalizedAngle <= 330);   // NW diagonal
        
    // For diagonal movement, both row and col must change
    if (isDiagonal) {
        return rowDiff === 1 && colDiff === 1;
    }
    
    // For orthogonal movement, either row or col must be unchanged
    return rowDiff === 0 || colDiff === 0;
}

// ... Rest of the code remains the same ...
