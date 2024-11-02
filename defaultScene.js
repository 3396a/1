/** Generate the default scene of the game. */

const defaultScene = () => {
    const {
        ballRadius: r,
        invisibleBallRadius: ir,
        paddle: { thickness: pt, offset: o, length: l, extraTravelDist: etd },
        size: { x: w, y: h },
        wallThickness: wt,
        cornerSize: cs,
    } = settings;
    const pw = pt + o;

    const minY = cs - etd;
    const maxY = h - minY;

    const corner = pos =>
        new Box(vec2(cs * sqrt(2)), pos).setRot(rot2(ETA / 2));
    const connector = pos => {
        const box = new Box(vec2(pw * 2, cs * 2), pos);
        box.isConnector = true;
        return box;
    };

    return {
        paddle: new Paddle(
            vec2(pt, l),
            vec2(o + pt / 2, h / 2),
            settings.paddle.speed,
            minY,
            maxY
        ),

        paddleR: new Paddle(
            vec2(pt, l),
            vec2(w - o - pt / 2, h / 2),
            settings.paddle.speed,
            minY,
            maxY
        ),

        balls: [],

        invisibleBalls: [new Ball(ir, vec2(w / 2, h / 2)).setVel(vec2(1, 0))],

        walls: [
            // top and bopwom
            new Box(vec2(w, 2 * wt), vec2(w / 2, 0)),
            new Box(vec2(w, 2 * wt), vec2(w / 2, h)),

            // connect the corners and the paddles
            connector(vec2(0, 0)),
            connector(vec2(w, 0)),
            connector(vec2(0, h)),
            connector(vec2(w, h)),

            // 4 corners
            corner(vec2(0, 0)),
            corner(vec2(w, 0)),
            corner(vec2(0, h)),
            corner(vec2(w, h)),
        ],

        invisibleWalls: [
            new Box(vec2(pw, h), vec2(pw / 2, h / 2)),
            new Box(vec2(pw, h), vec2(w - pw / 2, h / 2)),
        ],

        accelZones: [
            new Box(vec2(pw, h), vec2(pw / 2, h / 2)).setVel(vec2(-40, 0)),
            new Box(vec2(pw, h), vec2(w - pw / 2, h / 2)).setVel(vec2(40, 0)),
        ],

        pushEffectZones: {
            left: new Box(vec2(w / 2, h), vec2(w / 4, h / 2)).setVel(
                vec2(5, 0)
            ),
            right: new Box(vec2(w / 2, h), vec2(w * 0.75, h / 2)).setVel(
                vec2(-5, 0)
            ),
        },
    };
};
