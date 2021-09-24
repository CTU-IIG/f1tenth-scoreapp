"use strict";

import { useContext, useEffect, useState } from 'react';

import WebSocketManagerContext from './WebSocketManagerContext';
import WebSocketManager, { ManagerState } from './WebSocketManager';
import { useSubscription } from '../helpers/useSubscription';
import { FullRace } from '../types';


export const useWebSocketManager = () => useContext<WebSocketManager>(WebSocketManagerContext);

export const useWebSocketManagerState = (): { manager: WebSocketManager, state: ManagerState } => {

	const manager = useWebSocketManager();

	const state = useSubscription({
		getCurrentValue: manager.stateGetter,
		subscribe: manager.registerStateChangeListener,
	});

	return { manager, state };

};

interface UseRaceDataInnerState {
	manager: WebSocketManager;
	raceId: number;
	latestData: FullRace | undefined;
}

export const useLiveRaceData = (raceId: number): FullRace | undefined => {

	const manager = useWebSocketManager();

	const [state, setState] = useState<UseRaceDataInnerState>({
		manager,
		raceId,
		latestData: undefined,
	});

	let valueToReturn = state.latestData;

	if (state.manager !== manager || state.raceId !== raceId) {

		valueToReturn = undefined;

		setState({
			manager,
			raceId,
			latestData: valueToReturn,
		});

	}

	useEffect(() => {

		let didUnsubscribe = false;

		const unlisten = manager.listenForRaceData(raceId, race => {

			if (didUnsubscribe) {
				return;
			}

			setState(prevState => {

				if (
					prevState.manager !== manager ||
					prevState.raceId !== raceId
				) {
					return prevState;
				}

				if (prevState.latestData === race) {
					return prevState;
				}

				return { ...prevState, latestData: race };

			});

		});

		return () => {
			didUnsubscribe = true;
			unlisten();
		};

	}, [manager, raceId]);

	return valueToReturn;

};
