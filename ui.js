// switch between different screens

const screens = {
    idMap: new Map(
        selectorAll('.screen').map(screen => {
            if (screen.id === '') {
                console.error('Screen without id:', screen);
            }
            return [screen.id, screen];
        })
    ),

    active: selector('.active.screen'),

    /** @param {string} id */
    isValidId(id) {
        return this.idMap.has(id);
    },

    /** @param {string} id */
    setActive(id) {
        this.active.classList.remove('active');
        this.active = unwrap(this.idMap.get(id));
        this.active.classList.add('active');
    },
};

// make buttons automatically switch screens

for (const button of selectorAll('[data-target]')) {
    assert(button instanceof HTMLElement);
    const targetId = unwrap(button.dataset.target);
    assert(screens.isValidId(targetId));
    button.addEventListener('click', () => screens.setActive(targetId));
}

// newgame screen - hover text
{
    const nbsp = '\xa0';
    const info = selector('#gamemode-info');
    assert(info instanceof HTMLElement);

    selector('#endless').addEventListener('mouseenter', () => {
        info.textContent = 'Survive as long as you can.';
    });

    selector('#endless').addEventListener('mouseleave', () => {
        info.textContent = nbsp;
    });

    selector('#timed').addEventListener('mouseenter', () => {
        info.textContent = 'Play against a bot for 3 minutes.';
    });

    selector('#timed').addEventListener('mouseleave', () => {
        info.textContent = nbsp;
    });
}

// options screen - sync difficulty
{
    const button = selector('#difficulty');
    function sync() {
        if (hardMode) {
            button.textContent = '- Difficulty: difficult';
        } else {
            button.textContent = '- Difficulty: pleasant';
        }
    }
    sync();

    button.addEventListener('click', () => {
        hardMode = !hardMode;
        sync();
    });
}
