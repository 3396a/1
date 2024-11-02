class Paddle extends Box {
    constructor(dimensions, position, speed, minY, maxY) {
        super(dimensions, position);
        this.speed = speed;
        this.minY = minY;
        this.maxY = maxY;
    }

    moveTowards(dt, targetY) {
        const minY = this.minY + this.max.y;
        const maxY = this.maxY - this.max.y;
        this.vel.y = this.speed * clamp(targetY - this.pos.y, -1, 1);
        this.pos.y += dt * this.vel.y;
        if (this.pos.y < minY || maxY < this.pos.y) {
            this.pos.y = clamp(this.pos.y, minY, maxY);
            this.vel.y = 0;
        }
    }
}
