// Hook up the game interface to event listeners

window.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    if (game.ingame) {
        if (game.paused) {
            pauseMenu.classList.remove('active');
            game.start();
        } else {
            game.pause();
            pauseMenu.classList.add('active');
        }
    }

    if (endMenu.classList.contains('active')) {
        endMenu.classList.remove('active');
        screens.setActive('main');
    }

    // not in game; escape -> back one screen
    const button = document.querySelector('.active button.escape');
    if (button instanceof HTMLElement) {
        sounds.play('click');
        button.click();
    }
});

selector('#initial.screen button').addEventListener('click', () => {
    sounds.music.play();
});

// game-related buttons

selector('button#endless').addEventListener('click', () => {
    game.init('endless');
    game.start();
    screens.setActive('game');
});

selector('button#timed').addEventListener('click', () => {
    game.init('timed');
    game.start();
    screens.setActive('game');
});

// end menu is responsible for returning to main
selector('button#quit').addEventListener('click', () => {
    game.stop();
    game.showGameOverMessage(`
        <p>Game interrupted...</p>
    `);
});
