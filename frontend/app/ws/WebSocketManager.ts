"use strict";

import { isDefined } from '../helpers/common';
import { createSmartMapOfSets, SmartMap } from '../helpers/maps';
import { linearRetryPolicy, RetryPolicy } from '../helpers/retry-policy';
import { FullRace } from '../types';


export interface ManagerOptions {
	reconnectPolicy: RetryPolicy;
}

export const MANAGER_STATE_NO_URL = 0; // gray
export const MANAGER_STATE_NOT_CONNECTED = 1; // gray
export const MANAGER_STATE_CONNECTING = 2; // yellow
export const MANAGER_STATE_CONNECTED = 3; // green
export const MANAGER_STATE_DISCONNECTED_MAX_RETRIES_REACHED = 4; // red

const staleWs = (thisWs, ws): boolean => {
	if (thisWs !== ws) {
		console.warn(`this.ws !== ws`);
		return true;
	}
	return false;
};

export interface ManagerStateUrlNotSet {
	name: typeof MANAGER_STATE_NO_URL;
}

export interface ManagerStateUrlSet {
	name:
		| typeof MANAGER_STATE_NOT_CONNECTED
		| typeof MANAGER_STATE_CONNECTING
		| typeof MANAGER_STATE_CONNECTED
		| typeof MANAGER_STATE_DISCONNECTED_MAX_RETRIES_REACHED;
	url: string;
	attempt: number;
}

export type ManagerState = ManagerStateUrlNotSet | ManagerStateUrlSet;

export type ManagerStateChangeListener = (state: ManagerState) => void;

export type BarriersChangeListener = (barriers: number[]) => void;

export type CurrentRaceChangeListener = (currentRaceId: number | null) => void;

export type RaceDataListener = (race: FullRace) => void;

class WebSocketManager {

	public static NORMAL_CLOSURE_CODE = 4444;
	public static NORMAL_CLOSURE_REASON = 'destroy';

	// START: app specific business logic

	// TODO: Extract the app specific business logic into separate manager.

	public readonly stateGetter: () => ManagerState;
	public readonly registerStateChangeListener: (onChange: ManagerStateChangeListener) => () => void;

	public readonly barriersGetter: () => number[];
	public readonly registerBarriersChangeListener: (onChange: BarriersChangeListener) => () => void;

	public readonly currentRaceGetter: () => number | null;
	public readonly registerCurrentRaceChangeListener: (onChange: CurrentRaceChangeListener) => () => void;

	private barriers: number[];
	private currentRace: number | null;

	private readonly stateChangeListeners: Set<ManagerStateChangeListener>;
	private readonly barriersChangeListeners: Set<BarriersChangeListener>;
	private readonly currentRaceChangeListeners: Set<CurrentRaceChangeListener>;
	private readonly raceDataListeners: SmartMap<number, Set<RaceDataListener>>;

	// END: app specific business logic

	private readonly options: ManagerOptions;

	private state: ManagerState;

	private ws: WebSocket | null = null;
	private nextReconnectAttemptTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor(options?: Partial<ManagerOptions>, url?: string | undefined) {

		this.barriers = [];
		this.currentRace = null;

		this.stateChangeListeners = new Set();
		this.barriersChangeListeners = new Set();
		this.currentRaceChangeListeners = new Set();
		this.raceDataListeners = createSmartMapOfSets();

		this.stateGetter = () => this.getState();
		this.registerStateChangeListener = onChange => this.listenForStateChange(onChange);

		this.barriersGetter = () => this.barriers;
		this.registerBarriersChangeListener = onChange => this.listenForBarriersChange(onChange);

		this.currentRaceGetter = () => this.currentRace;
		this.registerCurrentRaceChangeListener = onChange => this.listenForCurrentRaceChange(onChange);

		this.options = {
			reconnectPolicy: linearRetryPolicy(10, 1000),
			...options,
		};

		this.state = {
			name: MANAGER_STATE_NO_URL,
		};

		this.connect(url);

	}

	get url(): string | undefined {
		return this.state.name === MANAGER_STATE_NO_URL ? undefined : this.state.url;
	}

	set url(url: string | undefined) {
		if (this.url !== url) {
			console.log(`[Manager] changing url from '${this.url}' to '${url}'`);
			this.connect(url);
		}
	}

	public connect(newUrl: string | undefined) {

		if (this.state.name === MANAGER_STATE_CONNECTING || this.state.name === MANAGER_STATE_CONNECTED) {
			this.disconnect(WebSocketManager.NORMAL_CLOSURE_CODE, WebSocketManager.NORMAL_CLOSURE_REASON);
		}

		// no url to connect to
		if (!isDefined(newUrl)) {
			this.state = { name: MANAGER_STATE_NO_URL };
			this.notifyStateChangeListeners();
			return;
		}

		this.state = {
			name: MANAGER_STATE_CONNECTING,
			url: newUrl,
			attempt: 0,
		};
		this.notifyStateChangeListeners();

		this.tryConnect();

	}

	public disconnect(
		code: number = WebSocketManager.NORMAL_CLOSURE_CODE,
		reason: string = WebSocketManager.NORMAL_CLOSURE_REASON,
	) {

		console.log(`[Manager] disconnect code=${code}, reason='${reason}'`);

		if (this.state.name !== MANAGER_STATE_CONNECTING && this.state.name !== MANAGER_STATE_CONNECTED) {
			console.error(`[Manager] attempted to invoke disconnect when not in CONNECTING or CONNECTED state`);
			return;
		}

		this.clearNextReconnectAttemptTimeout();

		if (isDefined(this.ws)) {
			this.ws.close(code, reason);
			this.ws = null;
		}

		this.state.name = MANAGER_STATE_NOT_CONNECTED;
		this.notifyStateChangeListeners();

	}

	public getState(): ManagerState {
		return { ...this.state }; // return copy to prevent accidental mutations
	}

	public listenForStateChange(onChange: ManagerStateChangeListener): () => void {
		this.stateChangeListeners.add(onChange);
		return () => {
			this.stateChangeListeners.delete(onChange);
		};
	}

	public listenForBarriersChange(onChange: BarriersChangeListener): () => void {
		this.barriersChangeListeners.add(onChange);
		return () => {
			this.barriersChangeListeners.delete(onChange);
		};
	}

	public listenForCurrentRaceChange(onChange: CurrentRaceChangeListener): () => void {
		this.currentRaceChangeListeners.add(onChange);
		return () => {
			this.currentRaceChangeListeners.delete(onChange);
		};
	}

	public listenForRaceData(raceId: number, onData: RaceDataListener): () => void {

		this.raceDataListeners.get(raceId).add(onData);

		return () => {
			this.raceDataListeners.get(raceId)?.delete(onData);
			this.raceDataListeners.safeDelete(raceId);
		};

	}

	private clearNextReconnectAttemptTimeout() {
		if (isDefined(this.nextReconnectAttemptTimeout)) {
			clearTimeout(this.nextReconnectAttemptTimeout);
			this.nextReconnectAttemptTimeout = null;
		}
	}

	private scheduleReconnect() {

		if (this.state.name !== MANAGER_STATE_CONNECTING) {
			console.error(`[Manager] attempted to invoke scheduleReconnect when not in CONNECTING state`);
			return;
		}

		console.log(`[Manager] scheduleReconnect for attempt=${this.state.attempt}`);

		const delay = this.options.reconnectPolicy(this.state.attempt);

		if (!isDefined(delay)) {
			console.error(`[Manager] max retries reached (determined by the policy), will NOT automatically reconnect`);
			this.clearNextReconnectAttemptTimeout(); // just to be sure
			this.state.name = MANAGER_STATE_DISCONNECTED_MAX_RETRIES_REACHED;
			this.notifyStateChangeListeners();
			return;
		}

		console.log(`[Manager] setting nextReconnectAttemptTimeout to ${delay} ms (attempt=${this.state.attempt})`);

		this.nextReconnectAttemptTimeout = setTimeout(() => {
			console.log(`[Manager] nextReconnectAttemptTimeout expired`);
			this.nextReconnectAttemptTimeout = null;
			this.tryConnect();
		}, delay);

	}

	private tryConnect() {

		if (this.state.name !== MANAGER_STATE_CONNECTING) {
			console.error(`[Manager] attempted to invoke connect when not in CONNECTING`);
			return;
		}

		if (isDefined(this.ws)) {
			this.ws.close(WebSocketManager.NORMAL_CLOSURE_CODE, WebSocketManager.NORMAL_CLOSURE_REASON);
			this.ws = null;
		}

		// increment attempt
		this.state.attempt++;
		this.notifyStateChangeListeners();

		console.log(`[Manager] connecting to '${this.state.url}', attempt=${this.state.attempt}`);

		const ws = new WebSocket(this.state.url);

		this.ws = ws;

		ws.onerror = (err) => {
			if (staleWs(this.ws, ws)) {
				return;
			}
			console.log(`[Manager][ws] onerror`);
		};

		ws.onclose = (event) => {

			if (staleWs(this.ws, ws)) {
				return;
			}

			console.log(`[Manager][ws] onclose, code=${event.code}, reason='${event.reason}'`);

			this.ws = null;

			if (event.code === WebSocketManager.NORMAL_CLOSURE_CODE) {
				this.state.name = MANAGER_STATE_NOT_CONNECTED;
				this.notifyStateChangeListeners();
			} else {
				// maybe the ws was closed before it was even opened
				// so this ensures we do not invoke notify unnecessarily
				if (this.state.name !== MANAGER_STATE_CONNECTING) {
					this.state.name = MANAGER_STATE_CONNECTING;
					this.notifyStateChangeListeners();
				}
				this.scheduleReconnect();
			}

		};

		ws.onopen = (event) => {

			if (staleWs(this.ws, ws)) {
				return;
			}

			console.log(`[Manager][ws] onopen`);

			if (this.state.name !== MANAGER_STATE_NO_URL) {
				this.state.name = MANAGER_STATE_CONNECTED;
				this.state.attempt = 1;
				this.notifyStateChangeListeners();
			}

		};

		ws.onmessage = (event) => {

			if (staleWs(this.ws, ws)) {
				return;
			}

			// console.log(`[Manager][ws] onmessage`, event.data);
			this.processMessage(event.data);

		};

	}

	private processMessage(data: string) {

		let msg: any;

		try {
			msg = JSON.parse(data);
		} catch (err) {
			console.error('[Manager] could not parse message as JSON', err, data, typeof data);
			return;
		}

		if (!isDefined(msg)) {
			console.error('[Manager] msg not defined', msg);
			return;
		}

		if (isDefined(msg.race)) {
			this.notifyRaceDataListeners(msg.race);
		}

		if (isDefined(msg.barriers)) {
			this.barriers = msg.barriers;
			this.notifyBarriersChangeListeners();
		}

		// The server server sends two types of current race change messages:
		// 1. { "currentRace": null }
		// 2. { "currentRace": { "id": x } } where is x is number
		if (msg.currentRace === null) {
			console.log('setting to null');
			this.currentRace = null;
			this.notifyCurrentRaceChangeListeners();
		} else if (Number.isInteger(msg.currentRace?.id)) {
			console.log('setting to number', msg.currentRace.id);
			this.currentRace = msg.currentRace.id;
			this.notifyCurrentRaceChangeListeners();
		}

	}

	private notifyBarriersChangeListeners() {
		this.barriersChangeListeners.forEach(fn => fn(this.barriers));
	}

	private notifyCurrentRaceChangeListeners() {
		this.currentRaceChangeListeners.forEach(fn => fn(this.currentRace));
	}

	private notifyStateChangeListeners() {
		this.stateChangeListeners.forEach(fn => fn(this.getState()));
	}

	private notifyRaceDataListeners(race: FullRace) {

		if (!this.raceDataListeners.has(race.id)) {
			return;
		}

		this.raceDataListeners.get(race.id).forEach(fn => fn(race));

	}

}

export default WebSocketManager;
