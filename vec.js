/**
 * Two-component vector.
 * Can represent 2d rotations as unit complex numbers.
 * Methods with capitalized names are mutating.
 */
class Vec2 {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vec2(this.x, this.y);
    }

    /**
     * @param {number} x
     * @param {number} y
     */
    Set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    /** @param {Vec2} v */
    Copy(v) {
        return this.Set(v.x, v.y);
    }

    /** @param {Vec2} v */
    Add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    /** @param {Vec2} v */
    Sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    /** @param {Vec2 | number} v */
    Mul(v) {
        const u = vec2(v);
        this.x *= u.x;
        this.y *= u.y;
        return this;
    }

    /** @param {Vec2 | number} v */
    Div(v) {
        const u = vec2(v);
        this.x /= u.x;
        this.y /= u.y;
        return this;
    }

    /** @param {Vec2} v */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }

    /** @param {Vec2} v */
    cross(v) {
        return this.x * v.y - this.y * v.x;
    }

    len2() {
        return this.x * this.x + this.y * this.y;
    }

    len() {
        return hypot(this.x, this.y);
    }

    /** @param {Vec2} p */
    dist(p) {
        return this.clone().Sub(p).len();
    }

    Normalize() {
        const len = this.len();
        this.x /= len;
        this.y /= len;
        return this;
    }

    /** Inverse rotation of this `Vec2` as a rotation. */
    Conj() {
        this.y = -this.y;
        return this;
    }

    /**
     * Compose two `Vec2`s as rotations.
     * @param {Vec2} r
     * */
    Apply(r) {
        return this.Set(
            this.x * r.x - this.y * r.y,
            this.x * r.y + this.y * r.x
        );
    }

    /** @param {Vec2} n */
    Reflect(n) {
        return this.Sub(n.clone().Mul((2 * this.dot(n)) / n.len2()));
    }
    
    Map(f) {
        this.x = f(this.x);
        this.y = f(this.y);
        return this;
    }
    
    Map2(f, v) {
        this.x = f(this.x, v.x);
        this.y = f(this.y, v.y);
        return this;
    }

    isFinite() {
        return Number.isFinite(this.x) && Number.isFinite(this.y);
    }
}

/**
 * Convenience function to use instead of `Vec2` constructor.
 * @param {Vec2 | number} [x]
 * @param {number} [y]
 */
function vec2(x, y) {
    if (y === undefined) {
        if (x === undefined) {
            // vec2() returns zero vector
            return new Vec2(0, 0);
        }
        if (x instanceof Vec2) {
            // vec2(vec2(args)) = vec2(args)
            return x.clone();
        }
        // vec2(x) = vec2(x, x)
        if (typeof x !== 'number') {
            console.error('Cannot create vector', x);
            throw new Error('bug');
        }
        return new Vec2(x, x);
    }
    // 2 args, normal constructor
    if (typeof x !== 'number' || typeof y !== 'number') {
        console.error('Cannot create vector', x, y);
        throw new Error('bug');
    }
    return new Vec2(x, y);
};

/**
 * Convenience function for creating rotations.
 * @param {number} [a=0]
 */
function rot2(a = 0) {
    if (typeof a !== 'number') {
        console.error('Cannot create rotation', a);
        throw new Error('bug');
    }
    return new Vec2(cos(a), sin(a));
};
