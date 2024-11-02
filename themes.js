const coldTheme = {
    primary: 'rgb(230 230 255)',
    secondary: 'rgb(170 170 200)',
    highlight: 'rgb(50 80 150)',
    translucent: 'rgb(200 200 255 / 0.3)',
    background: 'rgb(0, 4, 27)',
    special1: 'rgb(100 200 255)',
    special2: 'rgb(255 150 180)',
};

const brightTheme = {
    primary: 'black',
    secondary: '#2f4858',
    highlight: '#2f4858aa',
    translucent: '#34675f80',
    background: '#deded6',
    special1: '#A87F2D',
    special2: '#697602',
};

const coldbrightTheme = {
    primary: '#444B76',
    secondary: '#7665a2',
    hightlight: '#6DA677',
    translucent: '#468AB5aa',
    background: '#e1f1ff',
    special1: '#9B7252',
    special2: '#a92e62',
};

let theme = null;
function changeTheme(newTheme) {
    theme = newTheme;
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--highlight', theme.highlight);
    root.style.setProperty('--translucent', theme.translucent);
    root.style.setProperty('--background', theme.background);
}
changeTheme(coldTheme);

// options screen - sync theme
{
    const button = selector('#theme');
    function rotate() {
        if (theme === coldTheme) {
            changeTheme(brightTheme);
            button.textContent = '- Theme: bright';
        } else if (theme === brightTheme) {
            changeTheme(coldbrightTheme);
            button.textContent = '- Theme: coldbright';
        } else {
            assert(theme === coldbrightTheme);
            changeTheme(coldTheme);
            button.textContent = '- Theme: cold';
        }
    }

    changeTheme(coldbrightTheme);
    rotate();

    button.addEventListener('click', () => rotate());
}
