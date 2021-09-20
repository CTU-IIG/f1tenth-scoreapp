"use strict";

import { isDefined, TypedMap } from '../helpers/common';
import { createSmartMapOfSets, SmartMap } from '../helpers/maps';


export interface OnChangeHandler<DataModel, Key extends keyof DataModel> {
	(value: DataModel[Key], path: Key): void;
}

export type OnInitData<DataModel extends object> = () => TypedMap<DataModel>

export interface StoreOptions<DataModel extends object> {
	storageKey?: string;
	version?: string;
	onInitData?: OnInitData<DataModel>;
}

class Store<DataModel extends object> {

	readonly storageKey: string;
	readonly version: string;
	private readonly onInitData: OnInitData<DataModel>;
	private readonly listeners: SmartMap<keyof DataModel, Set<OnChangeHandler<DataModel, keyof DataModel>>>;
	private readonly data: TypedMap<DataModel>;

	constructor({ storageKey = 'state', version = '0.0.0', onInitData }: StoreOptions<DataModel>) {

		this.storageKey = storageKey;
		this.version = version;
		this.onInitData = onInitData ?? (() => new Map());
		this.listeners = createSmartMapOfSets();

		const data = this.loadData();

		if (!isDefined(data)) {
			console.log(`[Store] initializing app data`);
			this.data = this.onInitData();
			this.saveData();
		} else {
			this.data = data as TypedMap<DataModel>;
			console.log(`[Store] app data loaded from localStorage`);
		}

	}

	loadData(): TypedMap<DataModel> | undefined {

		const dataString = localStorage.getItem(this.storageKey);

		if (!isDefined(dataString)) {
			return undefined;
		}

		let rawData: any = undefined;

		try {
			rawData = JSON.parse(dataString);
		} catch (err) {
			console.error(`[Store] an error occurred while parsing app state`, err);
			return undefined;
		}

		if (!isDefined(rawData?.d)) {
			return undefined;
		}

		if (rawData?.v !== this.version) {
			console.warn(`[Store] rawData?.v (${rawData?.v}) !== this.version (${this.version})`);
			return undefined;
		}

		return new Map(Object.entries(rawData.d)) as TypedMap<DataModel>;

	}

	saveData(): boolean {
		try {

			const obj: Partial<DataModel> = {};
			this.data.forEach((value, key) => {
				obj[key] = value;
			});

			localStorage.setItem(this.storageKey, JSON.stringify({ v: this.version, d: obj }));

			return true;

		} catch (err) {
			console.error(`[Store] an error occurred while saving app state`, err);
			return false;
		}
	}

	getState(): TypedMap<DataModel> {
		return this.data;
	}

	get<Key extends keyof DataModel>(path: Key): DataModel[Key] {
		return this.data.get(path);
	}

	notify(path: keyof DataModel, value): void {

		// console.log(`[Store] notify ${path}`);

		if (!this.listeners.has(path)) {
			return;
		}

		const pathListeners = this.listeners.get(path);

		pathListeners.forEach(fn => fn(value, path));

	}

	listen<Key extends keyof DataModel>(path: Key, onChange: OnChangeHandler<DataModel, Key>): () => void {

		// console.log(`[Store] listen ${path}`);

		this.listeners.get(path).add(onChange);

		return () => {
			// console.log(`[Store] unlisten ${path}`);
			this.listeners.get(path).delete(onChange);
			this.listeners.safeDelete(path);
		};

	}

	update(path: keyof DataModel, nextValue: any): void {

		// console.log(`[Store] update ${path}`);

		if (nextValue === undefined && this.data.has(path)) {
			this.data.delete(path);
			this.saveData();
			this.notify(path, undefined);
			return;
		}

		if (this.data.get(path) !== nextValue) {
			this.data.set(path, nextValue);
			this.saveData();
			this.notify(path, nextValue);
		}

	}

}

export default Store;
