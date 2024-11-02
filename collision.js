/**
 * Returns unordered pairs of distinct elements in an array.
 * @template T
 * @param {T[]} arr
 * @returns {T[][]}
 */
const pairs = arr => arr.flatMap((b, n) => arr.slice(0, n).map(a => [a, b]));

/** Stores collision normal and penetration depth. */
class Collision {
    static none() {
        return new Collision(false, vec2(), 0);
    }

    /**
     * @param {Vec2} normal
     * @param {number} dist
     */
    static some(normal, dist) {
        return new Collision(true, normal, dist);
    }

    /**
     * @param {boolean} hit
     * @param {Vec2} normal
     * @param {number} dist
     */
    constructor(hit, normal, dist) {
        /** @type {boolean} */
        this.hit = hit;
        /** @type {Vec2} */
        this.normal = normal;
        /** @type {number} */
        this.dist = dist;
    }
}

/**
 * @param {Ball} ball1
 * @param {Ball} ball2
 */
function collideBalls(ball1, ball2) {
    const diff = ball2.pos.clone().Sub(ball1.pos);
    const diffLen = diff.len();
    const dist = diffLen - ball1.radius - ball2.radius;
    if (dist > 0) {
        return Collision.none();
    }
    return Collision.some(diff.clone().Div(diffLen), -dist);
}

/**
 * @param {Ball} ball
 * @param {Box} box
 */
function collideBallBox(ball, box) {
    const center = ball.pos.clone().Sub(box.pos).Apply(box.rot.clone().Conj());
    const absCenter = center.clone().Map(abs);

    const projCenterOut = absCenter.clone().Map2(min, box.max);
    const shiftedCenter = absCenter.clone().Sub(box.max);
    const projCenterIn =
        shiftedCenter.x < shiftedCenter.y
            ? vec2(absCenter.x, box.max.y)
            : vec2(box.max.x, absCenter.y);
    const inside = shiftedCenter.x < 0 && shiftedCenter.y < 0;

    const projCenter = (inside ? projCenterIn : projCenterOut)
        .Mul(center.clone().Map(sgn))
        .Apply(box.rot)
        .Add(box.pos);
    const diff = projCenter
        .clone()
        .Sub(ball.pos)
        .Mul(inside ? -1 : 1);
    const dist = ball.radius + diff.len() * (inside ? 1 : -1);

    if (dist < 0) {
        assert(!inside);
        return Collision.none();
    }

    return Collision.some(diff.Normalize(), dist);
}
