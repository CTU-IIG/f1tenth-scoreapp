"use strict";


export type KeyValueCreator<K, V> = ((key: K) => V) | V;

export const isFunctionalCreator = <K, V>(creator: KeyValueCreator<K, V>): creator is ((key: K) => V) =>
	typeof creator === 'function';

export class SmartMap<K, V> {

	private readonly store: Map<K, V>;
	readonly canKeyBeSafelyDeleted: (key: K, value: V) => boolean;
	readonly createValueForKey: KeyValueCreator<K, V>;

	constructor(canBeKeySafelyDeleted: (key: K, value: V) => boolean, fallback: KeyValueCreator<K, V>) {
		this.store = new Map();
		this.canKeyBeSafelyDeleted = canBeKeySafelyDeleted;
		this.createValueForKey = fallback;
	}

	static resolveValue<K, V>(createValueForKey: KeyValueCreator<K, V>, key: K): V {
		return isFunctionalCreator(createValueForKey) ? createValueForKey(key) : createValueForKey;
	}

	has(key: K): boolean {
		return this.store.has(key);
	}

	get(key: K, createValueForKey?: KeyValueCreator<K, V>): V {

		// we have to use has check in order to be able to support `undefined` values
		if (this.store.has(key)) {
			return this.store.get(key) as V;
		}

		// create new entry
		const value = SmartMap.resolveValue(createValueForKey ?? this.createValueForKey, key);
		this.store.set(key, value);
		return value;

	}

	safeDelete(key: K): boolean {

		if (!this.store.has(key)) {
			return false;
		}

		const value = this.store.get(key) as V;

		if (this.canKeyBeSafelyDeleted(key, value)) {
			this.store.delete(key);
			return true;
		}

		return false;

	}

}
