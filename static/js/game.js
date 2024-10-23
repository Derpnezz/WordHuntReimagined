// ... Previous code remains the same until isAdjacent function ...

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
    
    // Define wider diagonal zones (45° around each diagonal)
    // Centered at 45°, 135°, 225°, and 315°
    const isDiagonal = 
        (normalizedAngle >= 22.5 && normalizedAngle <= 67.5) ||   // NE diagonal (45° ± 22.5°)
        (normalizedAngle >= 112.5 && normalizedAngle <= 157.5) || // SE diagonal (135° ± 22.5°)
        (normalizedAngle >= 202.5 && normalizedAngle <= 247.5) || // SW diagonal (225° ± 22.5°)
        (normalizedAngle >= 292.5 && normalizedAngle <= 337.5);   // NW diagonal (315° ± 22.5°)
        
    // For diagonal movement, both row and col must change
    if (isDiagonal) {
        return rowDiff === 1 && colDiff === 1;
    }
    
    // For orthogonal movement, either row or col must be unchanged
    return rowDiff === 0 || colDiff === 0;
}

// ... Rest of the code remains the same ...
