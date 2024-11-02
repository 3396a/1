/**
 * @param {string} filename
 * @param {number} volume
 */
function getAudio(filename, volume) {
    const audio = new Audio('assets/sounds/' + filename);
    audio.volume = volume;
    if (filename === 'music.wav') {
        audio.loop = true;
    }
    return audio;
}

// input management

const volumeInput = selector('input#volume');
assert(volumeInput instanceof HTMLInputElement);
volumeInput.addEventListener('input', () => {
    sounds.volume = parseFloat(volumeInput.value);
});

const musicVolumeInput = selector('input#music-volume');
assert(musicVolumeInput instanceof HTMLInputElement);
musicVolumeInput.addEventListener('input', () => {
    sounds.music.volume = parseFloat(musicVolumeInput.value);
});

const sounds = {
    volume: 1,
    music: getAudio('music.wav', 0.2),
    stones: [1, 2, 3, 4, 5, 6, 7, 8].map(n => getAudio(`c${n}.mp3`, 1)),
    map: new Map([
        ['click', getAudio('click.mp3', 0.5)],
        ['draw', getAudio('draw.mp3', 1)],
        ['fail', getAudio('fail.wav', 1)],
        ['hover', getAudio('hover.ogg', 1)],
        ['lose', getAudio('lose.mp3', 0.5)],
        ['succeed', getAudio('succeed.wav', 1)],
        ['win', getAudio('win.mp3', 1)],
    ]),

    /** @param {string} name */
    play(name) {
        const original = unwrap(this.map.get(name));
        const clone = original.cloneNode();
        assert(clone instanceof HTMLAudioElement);
        clone.volume = original.volume * this.volume;
        clone.play();
    },

    playCollide() {
        const original = unwrap(
            this.stones[floor(random() * this.stones.length)]
        );
        const clone = original.cloneNode();
        assert(clone instanceof HTMLAudioElement);
        clone.volume = original.volume * this.volume;
        clone.play();
    },
};

for (const button of selectorAll('button')) {
    button.addEventListener('mouseover', () => sounds.play('hover'));
    button.addEventListener('mousedown', () => sounds.play('click'));
}
