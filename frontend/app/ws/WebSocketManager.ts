"use strict";

import { isDefined } from '../helpers/common';
import { SmartMap } from '../helpers/maps';
import { FullTrial } from '../types';


export interface ConnectionState {
	url: string | undefined;
	state: number;
}

export type ConnectionStateChangeListener = (state: ConnectionState) => void;

export type TrialDataListener = (trial: FullTrial) => void;

const staleClient = (thisClient, client): boolean => {
	// not sure if this can happen...
	if (thisClient !== client) {
		console.warn(`this.client !== client`);
		return true;
	}
	return false;
};

class WebSocketManager {

	private readonly connectionStateChangeListeners: Set<ConnectionStateChangeListener>;
	private readonly trialDataListeners: SmartMap<number, Set<TrialDataListener>>;

	public readonly connectionStateGetter: () => ConnectionState;
	public readonly registerConnectionStateChangeListener: (onChange: ConnectionStateChangeListener) => () => void;

	private _url: string | undefined;
	private client: WebSocket | undefined;


	constructor(url: string, autoConnect = true) {

		this.connectionStateChangeListeners = new Set();
		this.trialDataListeners = new SmartMap(
			(key, value) => value.size === 0,
			() => new Set(),
		);

		this.connectionStateGetter = () => this.getConnectionState();
		this.registerConnectionStateChangeListener = onChange => this.listenForConnectionStateChange(onChange);

		this._url = url;
		this.client = undefined;

		if (isDefined(this._url) && autoConnect) {
			this.connect();
		}

	}

	get url(): string | undefined {
		return this._url;
	}

	set url(value: string | undefined) {
		console.log(`ws: changing url from '${this._url}' to '${value}'`);
		this._url = value;
		if (isDefined(this.client)) {
			this.disconnect();
			this.connect();
		}
	}

	public getConnectionState(): ConnectionState {
		return {
			url: this._url,
			state: this.client?.readyState ?? -1,
		};
	}

	public connect() {

		if (isDefined(this.client)) {
			this.disconnect();
		}

		if (!isDefined(this._url)) {
			console.error(`ws: could not connect - url not set`);
			return;
		}

		const client = new WebSocket(this._url);

		client.onopen = (event) => {
			if (staleClient(this.client, client)) {
				return;
			}
			console.log(`ws('${client.url}'): open`);
			this.notifyConnectionStateChangeListeners();
		};

		client.onclose = (event) => {
			if (staleClient(this.client, client)) {
				console.log(`ws('${client.url}'): close, code=${event.code}, reason='${event.reason}'`);
				return;
			}
			console.log(`ws('${client.url}'): close, code=${event.code}, reason='${event.reason}'`);
			this.notifyConnectionStateChangeListeners();
		};

		client.onmessage = (event) => {
			if (staleClient(this.client, client)) {
				return;
			}
			console.log(`ws('${client.url}'): message`);
			this.processMessage(event.data);
		};

		client.onerror = (event) => {
			if (staleClient(this.client, client)) {
				return;
			}
			console.error('ws: error', event);
		};

		this.client = client;

		this.notifyConnectionStateChangeListeners();

	}

	public disconnect() {

		if (!isDefined(this.client)) {
			return;
		}

		if (this.client.readyState !== WebSocket.CLOSED) {
			// 1000 means "The connection successfully completed the purpose for which it was created."
			this.client.close(1000);
		}

		this.client = undefined;

		this.notifyConnectionStateChangeListeners();

	}

	private processMessage(data: string) {

		let msg: any;

		try {
			msg = JSON.parse(data);
		} catch (err) {
			console.error('ws: could not parse message as JSON', err, data, typeof data);
			return;
		}

		if (isDefined(msg?.trial)) {
			this.notifyTrialDataListeners(msg.trial as FullTrial);
		}

	}

	public listenForConnectionStateChange(onChange: ConnectionStateChangeListener): () => void {

		this.connectionStateChangeListeners.add(onChange);

		return () => {
			this.connectionStateChangeListeners.delete(onChange);
		};

	}

	public listenForTrialData(trialId: number, onData: TrialDataListener): () => void {

		this.trialDataListeners.get(trialId).add(onData);

		return () => {
			this.trialDataListeners.get(trialId)?.delete(onData);
			this.trialDataListeners.safeDelete(trialId);
		};

	}

	private notifyConnectionStateChangeListeners() {
		this.connectionStateChangeListeners.forEach(fn => fn(this.getConnectionState()));
	}

	private notifyTrialDataListeners(trial: FullTrial) {

		if (!this.trialDataListeners.has(trial.id)) {
			return;
		}

		this.trialDataListeners.get(trial.id).forEach(fn => fn(trial));

	}

}

export default WebSocketManager;
