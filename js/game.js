const pauseMenu = selector('#pause-menu');

const endMenu = selector('#end-menu');

const cursor = vec2();

canvas.addEventListener('mousemove', event => {
    cursor.Set(event.offsetX, event.offsetY).Div(settings.scale);
});

let hardMode = false;

const game = {
    /** @type {Ball[]} */
    balls: [],
    /** @type {Box[]} */
    walls: [],
    /** @type {Ball[]} */
    invisibleBalls: [],
    /** @type {Box[]} */
    invisibleWalls: [],

    timeElapsed: 0.0,
    eventCountdown: 0.2,

    points: {
        left: 0,
        right: 0,
    },

    growDelay: 0,
    pushDelay: 0,
    enemyGrowDelay: 0,
    enemyPushDelay: 0,

    ingame: false,
    paused: false,
    enableAI: false,
    hardMode: false,

    /**
     * Initialize the game state.
     * @param {'endless' | 'timed'} gamemode
     */
    init(gamemode) {
        this.gamemode = gamemode;
        this.hardMode = hardMode;

        this.points.left = 0;
        this.points.right = 0;
        this.timeElapsed = 0;
        this.growDelay = 0;
        this.pushDelay = 0;
        this.enemyGrowDelay = 0;
        this.enemyPushDelay = 0;

        const scene = defaultScene();

        this.paddle = scene.paddle;
        this.paddleR = scene.paddleR;
        this.paddleR.speed *= hardMode ? 0.8 : 0.5;

        this.balls = scene.balls;
        this.invisibleBalls = scene.invisibleBalls;

        this.walls = scene.walls;
        this.invisibleWalls = scene.invisibleWalls;

        this.accelZones = scene.accelZones;
        this.pushEffectZones = scene.pushEffectZones;
    },

    /** Unpause or start the game. */
    start() {
        this.paused = false;
        this.ingame = true;
        this.lastTimestamp = 0;
        requestAnimationFrame(dt => this.loop(dt));
    },

    pause() {
        assert(!this.paused, 'Game is already paused');
        this.paused = true;
    },

    stop() {
        assert(this.ingame, 'Game is already stopped');
        this.ingame = false;
        pauseMenu.classList.remove('active');
        endMenu.classList.add('active');
    },

    /**
     * The game's main event loop.
     * @param {number} timestamp
     */
    loop(timestamp) {
        if (!this.ingame || this.paused) return;

        // end the game when applicable
        if (this.gamemode === 'timed') {
            if (this.getRemainingTime() <= 0) {
                this.stop();

                let message;
                if (this.points.left < this.points.right) {
                    sounds.play('lose');
                    message = 'You lose!';
                } else if (this.points.left == this.points.right) {
                    sounds.play('draw');
                    message = 'Draw.';
                } else {
                    assert(this.points.left > this.points.right);
                    sounds.play('win');
                    message = 'You won!';
                }

                this.showGameOverMessage(`
                    <p>${message}</p>
                `);
            }
        } else {
            assert(this.gamemode === 'endless');
            if (this.getRemainingLife() <= 0) {
                this.stop();
                sounds.play('lose');

                const minutes = floor(this.timeElapsed / 60);
                const seconds = floor(this.timeElapsed % 60)
                    .toString()
                    .padStart(2, '0');

                this.showGameOverMessage(`
                    <p>Game over!</p>
                    <p>${minutes} m ${seconds} s</p>
                `);
            }
        }

        let dt = min(timestamp - this.lastTimestamp, 30) / 1000;
        this.lastTimestamp = timestamp;

        this.timeElapsed += dt;

        this.updateEffects(dt);

        // spawn balls
        this.eventCountdown -= dt;
        if (this.eventCountdown < 0) {
            this.eventCountdown = 0.5;
            this.spawnEvent();
        }

        this.render();

        const substeps = 8;
        for (let i = 0; i < substeps; i++) {
            this.stepPhysics(dt / substeps);
        }

        // continue the loop
        requestAnimationFrame(dt => this.loop(dt));
    },

    showGameOverMessage(top) {
        const pluralLeft = this.points.left === 1 ? '' : 's';
        const pluralRight = this.points.right === 1 ? '' : 's';
        endMenu.innerHTML = `
            ${top}
            <p>You scored ${this.points.left} point${pluralLeft}</p>
            <p>Bot scored ${this.points.right} point${pluralRight}</p>
            <p>${this.hardMode ? 'Difficult' : 'Pleasant'} difficulty</p>
            <p>Esc to menu</p>
        `;
    },

    /** Possibly adds a new ball. */
    spawnEvent() {
        const shift =
            this.gamemode === 'endless' ? log(1 + this.timeElapsed) : 0;
        console.log(shift);
        const probability = pow(1 / max(1, this.balls.length - shift), 1);
        if (random() < probability) {
            const ball = new Ball(
                settings.ballRadius,
                settings.size.clone().Div(2)
            ).setVel(rot2(random() * TAU).Mul(2 + 5 * random()));
            if (random() < 0.3) {
                if (random() < 0.5) {
                    ball.hasGrow = true;
                } else {
                    ball.hasPush = true;
                }
            }
            this.balls.push(ball);
        }
    },

    /** @param {number} dt */
    updateEffects(dt) {
        this.growDelay = max(0, this.growDelay - dt);
        this.pushDelay = max(0, this.pushDelay - dt);
        this.enemyGrowDelay = max(0, this.enemyGrowDelay - dt);
        this.enemyPushDelay = max(0, this.enemyPushDelay - dt);

        function updatePaddleLength(delay, paddle) {
            let targetY =
                delay !== 0
                    ? settings.growLength / 2
                    : settings.paddle.length / 2;
            const t = 0.2;
            paddle.max.y = paddle.max.y * (1 - t) + targetY * t;
        }

        updatePaddleLength(this.growDelay, this.paddle);
        updatePaddleLength(this.enemyGrowDelay, this.paddleR);
    },

    getRemainingTime() {
        return settings.timedDuration - this.timeElapsed;
    },

    getRemainingLife() {
        const coef = this.hardMode ? 3 : 2;
        return (
            settings.endlessHealth - coef * this.points.right + this.points.left
        );
    },

    /** Render the game state to the canvas. */
    render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw push effect
        {
            ctx.fillStyle = theme.special2;
            ctx.globalAlpha = 0.05;
            if (this.pushDelay !== 0) {
                ctx.fill(this.pushEffectZones.left.getPath2D());
            }
            if (this.enemyPushDelay !== 0) {
                ctx.fill(this.pushEffectZones.right.getPath2D());
            }
            ctx.globalAlpha = 1;
        }

        drawCenterLine();
        // text displays
        {
            ctx.fillStyle = theme.secondary;
            ctx.font = `${0.02 * settings.scale}px Dogica Pixel`;
            ctx.textBaseline = 'top';

            ctx.textAlign = 'left';
            ctx.fillText(`${this.points.left}`, 2.5, 1);

            ctx.textAlign = 'left';
            ctx.fillText(`${this.points.left}`, 2.5, 1);

            ctx.textAlign = 'right';
            ctx.fillText(`${this.points.right}`, 17.5, 1);
            if (this.gamemode === 'timed') {
                let time = max(0, this.getRemainingTime());

                const minutes = floor(time / 60);
                const seconds = floor(time % 60)
                    .toString()
                    .padStart(2, '0');

                ctx.fillText(`${minutes}:${seconds}`, 17.5, 2.5);
            } else {
                assert(this.gamemode === 'endless');
                const life = max(0, this.getRemainingLife());
                ctx.fillText(`${life}`, 17.5, 2.5);
            }
        }
        this.invisibleWalls.forEach(drawInvisibleBox);
        this.walls.forEach(drawBox);
        drawPaddle(this.growDelay, this.paddle);
        drawPaddle(this.enemyGrowDelay, this.paddleR);
        this.invisibleBalls.forEach(drawInvisibleBall);
        this.balls.forEach(drawBall);
    },

    /**
     * Update the game state.
     * @param {number} dt
     */
    stepPhysics(dt) {
        // move paddles
        {
            this.paddle.moveTowards(dt, cursor.y);

            const targetY = this.hardMode
                ? getTargetY(this.paddleR, this.balls)
                : getTargetYEasy(this.paddleR, this.balls);
            this.paddleR.moveTowards(dt, targetY);
        }

        // cull out of bounds balls and apply effects
        {
            const { x: w, y: h } = settings.size;
            for (const ball of this.balls) {
                const {
                    pos: { x, y },
                    radius: r,
                } = ball;
                if (x < -r) {
                    if (ball.hasGrow) {
                        sounds.play('succeed');
                        this.growDelay = settings.growDuration;
                    } else if (ball.hasPush) {
                        sounds.play('succeed');
                        this.pushDelay = settings.pushDuration;
                    } else {
                        sounds.play('fail');
                        this.points.right += 1;
                    }
                }
                if (x > w + r) {
                    if (ball.hasGrow) {
                        sounds.play('fail');
                        if (this.hardMode)
                            this.enemyGrowDelay = settings.growDuration;
                    } else if (ball.hasPush) {
                        sounds.play('fail');
                        if (this.hardMode)
                            this.enemyPushDelay = settings.pushDuration;
                    } else {
                        sounds.play('succeed');

                        this.points.left += 1;
                    }
                }
            }
            this.balls = this.balls.filter(
                ({ radius: r, pos: { x, y } }) =>
                    0 < x + r && x - r < w && 0 < y + r && y - r < h
            );
        }

        // push invisible ball towards the center
        for (const ball of this.invisibleBalls) {
            const center = settings.size.clone().Div(2);
            const f = center.Sub(ball.pos);
            ball.vel.Add(f.Mul(dt * 0.1));
        }

        // move balls
        const combinedBalls = this.balls.concat(this.invisibleBalls);
        let accelZones = [...this.accelZones];
        if (this.pushDelay !== 0) accelZones.push(this.pushEffectZones.left);
        if (this.enemyPushDelay !== 0)
            accelZones.push(this.pushEffectZones.right);
        for (const ball of combinedBalls) {
            const speed = ball.vel.len();

            if (!ball.isSpecial()) {
                for (const box of accelZones) {
                    if (box.containsPoint(ball.pos)) {
                        ball.vel.Add(box.vel.clone().Mul(dt));
                    }
                }
            }

            // keep the balls from going too slow or too fast
            const maxSpeed = this.hardMode ? 20 : 13;
            ball.vel.Normalize().Mul(clamp(speed, 2, maxSpeed));
            ball.pos.Add(ball.vel.clone().Mul(dt));
        }

        // collide balls
        for (const [ball1, ball2] of pairs(combinedBalls)) {
            const coll = collideBalls(ball1, ball2);
            if (!coll.hit) continue;

            sounds.playCollide();
            const m1 = ball1.mass;
            const m2 = ball1.mass;

            // separate the balls
            const mtotal = m1 + m2;
            ball1.pos.Sub(coll.normal.clone().Mul((coll.dist * m2) / mtotal));
            ball2.pos.Add(coll.normal.clone().Mul((coll.dist * m1) / mtotal));

            // change their velocities
            const vrel = ball1.vel.clone().Sub(ball2.vel);
            const vtotal = -2 * vrel.dot(coll.normal);
            const impulse = vtotal / (1 / m1 + 1 / m2);
            ball1.vel.Add(coll.normal.clone().Mul(impulse / m1));
            ball2.vel.Sub(coll.normal.clone().Mul(impulse / m2));
        }

        /**
         * @param {Ball} ball
         * @param {Box} box
         * @param {Collision} coll
         */
        function resolveBallBox(ball, box, coll) {
            sounds.playCollide();
            ball.pos.Sub(coll.normal.clone().Mul(coll.dist));
            ball.vel.Reflect(coll.normal);

            // make the ball inherit the paddle velocity
            ball.vel.Add(box.vel.clone());
        }

        // regular balls collide with normal walls and paddles
        for (const ball of this.balls) {
            for (const box of this.walls) {
                const coll = collideBallBox(ball, box);
                if (!coll.hit) continue;
                resolveBallBox(ball, box, coll);
            }

            for (const box of [this.paddle, this.paddleR]) {
                const coll = collideBallBox(ball, box);
                if (!coll.hit) continue;
                resolveBallBox(ball, box, coll);
            }
        }

        // invisible ball collides with all walls (except connectors), excluding paddles
        for (const ball of this.invisibleBalls) {
            for (const box of this.walls
                .concat(this.invisibleWalls)
                .filter(box => !box.isConnector)) {
                const coll = collideBallBox(ball, box);
                if (!coll.hit) continue;
                console.log(coll);
                resolveBallBox(ball, box, coll);
            }
        }
    },
};
