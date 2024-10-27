[Previous content of game.js unchanged until line 388]

document.addEventListener('DOMContentLoaded', function() {
    // Initialize help buttons
    const helpBtns = document.querySelectorAll('#helpBtn, #helpBtn2');
    helpBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                document.getElementById('instructionsModal').style.display = 'flex';
            });
        }
    });

    // Add close instructions button listener
    const closeInstructions = document.getElementById('closeInstructions');
    if (closeInstructions) {
        closeInstructions.addEventListener('click', function() {
            document.getElementById('instructionsModal').style.display = 'none';
        });
    }

    // Add play solo button listener
    const playSoloBtn = document.getElementById('playSoloBtn');
    if (playSoloBtn) {
        playSoloBtn.addEventListener('click', function() {
            if (window.game) {
                window.game.startGame();
            }
        });
    }

    // Add new game button listener
    const newGameBtn = document.getElementById('newGame');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', function() {
            window.location.reload();
        });
    }

    // Initialize game last
    window.game = new WordHuntGame();
});
