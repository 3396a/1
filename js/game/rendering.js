// initialize canvas
const canvas = unwrap(document.querySelector('canvas'));
const ctx = unwrap(canvas.getContext('2d'));

canvas.width = settings.size.x * settings.scale;
canvas.height = settings.size.y * settings.scale;
ctx.scale(settings.scale, settings.scale);

// let colors = {
// primary: 'white';
// background:
// }

// rendering functions

function drawCenterLine() {
    const { x: w, y: h } = settings.size;
    ctx.strokeStyle = theme.secondary;
    ctx.lineWidth = 0.2;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.setLineDash([1, 0.75]);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);
}

/** @param {Ball} ball */
function drawInvisibleBall(ball) {
    const path = ball.getPath2D();
    ctx.strokeStyle = theme.translucent;
    ctx.lineWidth = ball.radius;
    ctx.save();
    ctx.clip(path);
    ctx.stroke(path);
    // ctx.lineWidth = ball.radius / 3;
    // ctx.stroke(path);
    ctx.restore();
}

/** @param {Ball} ball */
function drawBall(ball) {
    ctx.fillStyle = theme.primary;
    if (ball.hasGrow) {
        ctx.fillStyle = theme.special1;
        ctx.strokeStyle = theme.special1;
    }
    if (ball.hasPush) {
        ctx.fillStyle = theme.special2;
        ctx.strokeStyle = theme.special2;
    }
    ctx.fill(ball.getPath2D());
    if (ball.hasGrow || ball.hasPush) {
        ctx.lineWidth = ball.radius / 5;
        ctx.beginPath();
        ctx.globalAlpha = 0.2;
        ctx.arc(ball.pos.x, ball.pos.y, ball.radius * 1.5, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
}

/** @param {Box} box */
function drawBox(box) {
    ctx.fillStyle = theme.primary;
    ctx.fill(box.getPath2D());
}

/**
 * @param {number} growDelay
 * @param {Box} box
 */
function drawPaddle(growDelay, box) {
    ctx.fillStyle = growDelay === 0 ? theme.primary : theme.special1;
    ctx.fill(box.getPath2D());
}

/** @param {Box} box */
function drawInvisibleBox(box) {
    const step = 0.6;
    const slope = 0.5;

    const min = box.pos.clone().Sub(box.max);
    const max = box.pos.clone().Add(box.max);
    const size = box.max.clone().Mul(2);

    // ctx.fillStyle = 'rgb(255 50 50 / 0.1)';
    // ctx.strokeStyle = 'rgb(120 0 0 / 0.6)';
    ctx.fillStyle = theme.translucent;
    ctx.strokeStyle = theme.highlight;
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.05;

    ctx.save();
    ctx.beginPath();
    ctx.rect(min.x, min.y, size.x, size.y);
    ctx.clip();
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;

    const n = ceil(size.y / step);
    ctx.beginPath();
    for (let i = -ceil(slope * n); i <= n; i++) {
        const t = i / n;
        const y = min.y * (1 - t) + max.y * t;
        const a = vec2(min.x, y + size.x * slope);
        const b = vec2(max.x, y);
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    ctx.restore();
}
