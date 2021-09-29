"use strict";

import { useContext, useEffect, useState } from 'react';

import WebSocketManagerContext from './WebSocketManagerContext';
import WebSocketManager, { ManagerState } from './WebSocketManager';
import { useSubscription } from '../helpers/useSubscription';
import { FullRace } from '../types';
import { IS_DEVELOPMENT } from '../helpers/common';


export const useWebSocketManager = () => useContext<WebSocketManager>(WebSocketManagerContext);

export const useWebSocketManagerState = (): { manager: WebSocketManager, state: ManagerState } => {

	const manager = useWebSocketManager();

	const state = useSubscription({
		getCurrentValue: manager.stateGetter,
		subscribe: manager.registerStateChangeListener,
	});

	return { manager, state };

};

export const useOnlineBarriers = (): { manager: WebSocketManager, onlineBarriers: number[] } => {

	const manager = useWebSocketManager();

	const barriers = useSubscription({
		getCurrentValue: manager.barriersGetter,
		subscribe: manager.registerBarriersChangeListener,
	});

	return { manager, onlineBarriers: barriers };

};

export const useCurrentRace = (): { manager: WebSocketManager, race: { prevRace: number | null, currentRace: number | null } } => {

	const manager = useWebSocketManager();

	const race = useSubscription({
		getCurrentValue: manager.currentRaceGetter,
		subscribe: manager.registerCurrentRaceChangeListener,
	});

	return { manager, race };

};

export const ONE_MINUTE = 60 * 1000; // in ms

export const useEffectiveRace = (timeout: number = ONE_MINUTE): number | null => {

	const { race } = useCurrentRace();

	const [effectiveRaceId, setEffectiveRaceId] = useState<number | null>(
		// initial value of effectiveRaceId is currentRace with fallback to prevRace
		// iff currentRace === null
		race.currentRace ?? race.prevRace,
	);

	useEffect(() => {

		IS_DEVELOPMENT && console.log('[useEffectiveRace] timeout setup');

		let didCleanup = false;

		let tid: number | null;

		tid = window.setTimeout(() => {

			IS_DEVELOPMENT && console.log('[useEffectiveRace] timeout expired');

			tid = null;

			if (didCleanup) {
				return;
			}

			setEffectiveRaceId((prev) => {
				return race.currentRace;
			});

		}, timeout);

		setEffectiveRaceId((prev) => {
			return race.currentRace ?? race.prevRace;
		});

		return () => {

			IS_DEVELOPMENT && console.log('[useEffectiveRace] effect cleanup');

			didCleanup = true;

			if (tid !== null) {
				window.clearTimeout(tid);
				tid = null;
			}

		};

	}, [timeout, race, setEffectiveRaceId]);

	IS_DEVELOPMENT && console.log(
		`[useEffectiveRace] returning effectiveRaceId = ${effectiveRaceId},`
		+ ` when currentRace = ${race.currentRace}, prevRace = ${race.prevRace}`,
	);

	return effectiveRaceId;

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
