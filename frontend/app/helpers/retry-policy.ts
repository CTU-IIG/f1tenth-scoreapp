"use strict";

/**
 * RetryPolicy is a function that controls retry behavior
 * arguments:
 *   - attempt - 1 for 1st retry, 2 for 2nd retry, etc.
 * return value:
 *   - timeout in milliseconds before doing the `attempt`-th retry (must be >= 0)
 *   - `undefined` causes the retry to be aborted
 */
export type RetryPolicy = (attempt: number) => undefined | number;

export const noRetryPolicy: RetryPolicy = () => undefined;

/**
 * A parametrized constant retry policy
 * @param maxRetries -1 = unlimited, 0 = no retry (equals to noRetryPolicy), 1 = 1 retry, 2 = retries, ...
 * @param delay number of milliseconds, range [0, inf]
 */
export const constantRetryPolicy = (maxRetries: number, delay: number): RetryPolicy =>
	attempt => maxRetries === -1 || attempt <= maxRetries
		? delay // the 1st retry (attempt=1) will have `delay` delay
		: undefined; // max attempts reached, abort retry

/**
 * A parametrized linear retry policy
 * @param maxRetries -1 = unlimited, 0 = no retry (equals to noRetryPolicy), 1 = 1 retry, 2 = retries, ...
 * @param delay number of milliseconds, range [0, inf]
 */
export const linearRetryPolicy = (maxRetries: number, delay: number): RetryPolicy =>
	attempt => maxRetries === -1 || attempt <= maxRetries
		? attempt * delay // the 1st retry (attempt=1) will have `delay` delay
		: undefined; // max attempts reached, abort retry
