"use strict";

import { useContext, useEffect, useState } from 'react';

import WebSocketManagerContext from './WebSocketManagerContext';
import WebSocketManager, { ConnectionState } from './WebSocketManager';
import { useSubscription } from '../helpers/useSubscription';
import { FullTrial } from '../types';


export const useWebSocketManager = () => useContext<WebSocketManager>(WebSocketManagerContext);

export const useWebSocketConnectionState = (): { manager: WebSocketManager, state: ConnectionState } => {

	const manager = useWebSocketManager();

	const state = useSubscription({
		getCurrentValue: manager.connectionStateGetter,
		subscribe: manager.registerConnectionStateChangeListener,
	});

	return { manager, state };

};

interface UseTrialDataInnerState {
	manager: WebSocketManager;
	trialId: number;
	latestData: FullTrial | undefined;
}

export const useLiveTrialData = (trialId: number): FullTrial | undefined => {

	const manager = useWebSocketManager();

	const [state, setState] = useState<UseTrialDataInnerState>({
		manager,
		trialId,
		latestData: undefined,
	});

	let valueToReturn = state.latestData;

	if (state.manager !== manager || state.trialId !== trialId) {

		valueToReturn = undefined;

		setState({
			manager,
			trialId,
			latestData: valueToReturn,
		});

	}

	useEffect(() => {

		let didUnsubscribe = false;

		const unlisten = manager.listenForTrialData(trialId, trial => {

			if (didUnsubscribe) {
				return;
			}

			setState(prevState => {

				if (
					prevState.manager !== manager ||
					prevState.trialId !== trialId
				) {
					return prevState;
				}

				if (prevState.latestData === trial) {
					return prevState;
				}

				return { ...prevState, latestData: trial };

			});

		});

		return () => {
			didUnsubscribe = true;
			unlisten();
		};

	}, [manager, trialId]);

	return valueToReturn;

};
