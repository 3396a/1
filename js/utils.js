//
// Math related utilities
//

// prettier-ignore
const { E, LN10, LN2, LOG10E, LOG2E, PI, SQRT1_2, SQRT2, abs, acos, acosh, asin, asinh, atan, atan2, atanh, cbrt, ceil, clz32, cos, cosh, exp, expm1, floor, fround, hypot, imul, log, log10, log1p, log2, max, min, pow, random, round, sign, sin, sinh, sqrt, tan, tanh, trunc } = Math;

/** Half of pi. */
const ETA = PI / 2;

/** Equal to two pi. */
const TAU = PI * 2;

/**
 * Equivalent to `max(lower, min(upper, value))`.
 * @param {number} value
 * @param {number} [lower=0]
 * @param {number} [upper=0]
 */
const clamp = (value, lower = 0, upper = 1) => max(lower, min(upper, value));

/**
 * `Math.sign`, except for `sgn(0) = 1`.
 * @param {number} x
 */
const sgn = x => (x < 0 ? -1 : 1);

//
// Other
//

/**
 * Asserts that a value is neither `null` nor `undefined` and returns it.
 * @template T
 * @param {T} x
 * @returns {NonNullable<T>}
 */
const unwrap = x => (assert(x != null, 'Cannot unwrap null or undefined'), x);

/**
 * @param {boolean} condition
 * @param {string} [msg]
 * @returns {asserts condition}
 */
function assert(condition, msg = 'Assertion failed') {
    if (!condition) {
        throw new Error(msg);
    }
}

/**
 * This method may be used as a shorthand to `document.querySelector` if a return type of `Element` is acceptable.
 * @param {string} s
 */
const selector = s => unwrap(document.querySelector(s));

/**
 * This method may be used as a shorthand to `document.querySelectorAll` if a return type of `Element[]` is acceptable.
 * @param {string} s
 */
const selectorAll = s => Array.from(document.querySelectorAll(s));
