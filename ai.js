/**
 * @param {Paddle} paddle
 * @param {Ball[]} balls
 */
function getTargetY(paddle, balls) {
    // score balls based on the time they take to arrive
    const incomingBalls = balls.filter(
        ball => ball.pos.x < paddle.pos.x && !ball.isSpecial()
    );

    const scoredBalls = incomingBalls.map(ball => {
        const hitX = paddle.pos.x - paddle.max.x - ball.radius;
        const time = (hitX - ball.pos.x) / ball.vel.x;
        const hitY = ball.pos.y + time * ball.vel.y;

        const targetBall = new Ball(ball.radius, vec2(hitX, hitY));

        const minY = settings.cornerSize + ball.radius;
        const maxY = settings.size.y - minY;
        if (time < 0 || hitY < minY || maxY < hitY) {
            return { ball: targetBall, score: 0 };
        }
        const score = 1 / (0.2 + time) + 1 / (5 + abs(hitX - paddle.pos.x));
        return { ball: targetBall, score };
    });

    // find ball with greatest score
    return scoredBalls.reduce((x, y) => (x.score > y.score ? x : y), {
        ball: new Ball(1, vec2(0, settings.size.y / 2)),
        score: -Infinity,
    }).ball.pos.y;
}

/**
 * @param {Paddle} paddle
 * @param {Ball[]} balls
 */
function getTargetYEasy(paddle, balls) {
    // score balls based on their horizontal and vertical distance from the paddle
    const scoredBalls = balls
        .filter(ball => ball.pos.x + ball.radius < paddle.pos.x)
        .map(ball => {
            const xDist = abs(paddle.pos.x - ball.pos.x);
            const yDist = abs(paddle.pos.y - ball.pos.y);
            const score = 1 / (1 + xDist) + 1 / (5 + yDist);
            return { ball, score };
        });

    // find ball with greatest score
    return scoredBalls.reduce((x, y) => (x.score > y.score ? x : y), {
        ball: new Ball(1, vec2(0, settings.size.y / 2)),
        score: -Infinity,
    }).ball.pos.y;
}
