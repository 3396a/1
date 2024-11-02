// Rigid body classes

class Body {
    /**
     * @param {Vec2} position
     * @param {Vec2} rotation
     */
    constructor(position, rotation) {
        /** @type {Vec2} */
        this.pos = position.clone();
        /** @type {Vec2} */
        this.vel = vec2();
        /** @type {Vec2} */
        this.rot = rotation.clone();
    }

    /** @param {Vec2} pos */
    setPos(pos) {
        this.pos.Copy(pos);
        return this;
    }

    /** @param {Vec2} vel */
    setVel(vel) {
        this.vel.Copy(vel);
        return this;
    }

    /** @param {Vec2} rot */
    setRot(rot) {
        this.rot.Copy(rot);
        return this;
    }

    /** @param {Vec2} p */
    containsPoint(p) {
        return this.containsPointUntransformed(
            p.clone().Sub(this.pos).Apply(this.rot.clone().Conj())
        );
    }

    /**
     * @param {Vec2} p
     * @returns {boolean}
     */
    containsPointUntransformed(p) {
        throw new Error('bug');
    }

    getPath2D() {
        const { x: rx, y: ry } = this.rot;
        const { x: tx, y: ty } = this.pos;
        const transform = new DOMMatrix([rx, ry, -ry, rx, tx, ty]);
        const path = this.getPath2DUntransformed();
        const transformedPath = new Path2D();
        transformedPath.addPath(path, transform);
        // this.drawImpl(ctx, transformedPath);
        return transformedPath;
    }

    /** @returns {Path2D} */
    getPath2DUntransformed() {
        throw new Error('bug');
    }
}

class Ball extends Body {
    /**
     * @param {number} radius
     * @param {Vec2} position
     */
    constructor(radius, position) {
        super(position, rot2());

        /** @type {number} */
        this.radius = radius;
        /** @type {number} */
        this.mass = this.area();

        this.hasGrow = false;
        this.hasPush = false;
    }

    isSpecial() {
        return this.hasGrow || this.hasPush;
    }

    area() {
        return PI * this.radius * this.radius;
    }

    containsPointUntransformed(p) {
        return p.len2() <= this.radius * this.radius;
    }

    getPath2DUntransformed() {
        const path = new Path2D();
        path.arc(0, 0, this.radius, 0, TAU);
        return path;
    }
}

class Box extends Body {
    /**
     * @param {Vec2} dimensions
     * @param {Vec2} position
     * @param {Vec2} [rotation]
     */
    constructor(dimensions, position, rotation = rot2()) {
        super(position, rotation);
        this.max = dimensions.clone().Div(2);
        this.mass = this.area();

        // this is a hack to avoid double collisions between the invisible ball and overlapping walls
        this.isConnector = false;
    }

    area() {
        return this.max.x * this.max.y * 4;
    }

    /** @param {Vec2} p */
    containsPointUntransformed(p) {
        return abs(p.x) < this.max.x && abs(p.y) < this.max.y;
    }

    getPath2DUntransformed() {
        const path = new Path2D();
        const { x, y } = this.max;
        path.moveTo(-x, -y);
        path.lineTo(+x, -y);
        path.lineTo(+x, +y);
        path.lineTo(-x, +y);
        path.closePath();
        return path;
    }
}
