"use strict";

import { QueryOperation } from './data';
import { AppState, CrossingTeam, FullRace } from '../types';
import { useWebSocketManager } from '../ws/hooks';
import { useEffect, useMemo, useState } from 'react';
import { findOneRaceById, updateCrossing } from './queries';
import { isDefined, staleDeps } from './common';
import { computeStats, RaceStats } from './races';
import { useStore } from '../store/hooks';


interface UseRaceDataInnerState {
	deps: any[];
	op: QueryOperation<FullRaceAndStats | undefined>;
}

export interface FullRaceAndStats {
	race: FullRace;
	stats: RaceStats;
}

export type CrossingUpdater = (id: number, ignored: boolean, team: CrossingTeam) => void;

export const useRaceDataExperimental = (raceId: number): [QueryOperation<FullRaceAndStats | undefined>, CrossingUpdater] => {

	const manager = useWebSocketManager();

	const store = useStore<AppState>();

	const deps = [raceId, manager, store];

	const [state, setState] = useState<UseRaceDataInnerState>(() => ({
		deps,
		op: {
			loading: true,
			hasError: false,
			data: undefined,
		},
	}));

	let valueToReturn = state.op;

	if (staleDeps(state.deps, deps)) {

		valueToReturn = {
			loading: true,
			hasError: false,
			data: undefined,
		};

		setState({
			deps,
			op: valueToReturn,
		});

	}

	useEffect(() => {

		let didUnsubscribe = false;

		const executeQuery = async () => {

			if (didUnsubscribe) {
				return;
			}

			let op: QueryOperation<FullRace | undefined>;

			const restUrl = store.get('restUrl');
			const token = store.get('authToken');

			try {
				const data = await findOneRaceById(raceId)(restUrl, token);
				op = {
					loading: false,
					hasError: false,
					data,
				};
			} catch (err) {
				op = {
					loading: false,
					hasError: true,
					error: err,
					data: undefined,
				};
			}

			if (didUnsubscribe) {
				console.warn('finished but unsubscribed');
				return;
			}

			setState((prevState) => {

				if (staleDeps(prevState.deps, deps)) {
					return prevState;
				}

				// rewrite prevState.op when REST query fails (error or not found)
				if (op.hasError || !isDefined(op.data)) {
					return {
						...prevState,
						op: op as QueryOperation<undefined>,
					};
				}

				// rewrite prevState.op when REST query result arrives before
				// any WS update or the REST result is more up-to-date than WS
				if (!isDefined(prevState.op.data) || prevState.op.data.race.updatedAt < op.data.updatedAt) {
					return {
						...prevState,
						op: {
							loading: false,
							hasError: false,
							data: {
								race: op.data,
								stats: computeStats(op.data),
							},
						},
					};
				}

				return prevState;

			});

		};

		const unlisten = manager.listenForRaceData(raceId, race => {

			if (didUnsubscribe) {
				return;
			}

			setState(prevState => {

				if (staleDeps(prevState.deps, deps)) {
					return prevState;
				}

				if (!isDefined(prevState.op.data) || prevState.op.data.race.updatedAt < race.updatedAt) {
					return {
						...prevState,
						op: {
							loading: false,
							hasError: false,
							data: {
								race,
								stats: computeStats(race),
							},
						},
					};
				}

				return prevState;

			});

		});

		// noinspection JSIgnoredPromiseFromCall
		executeQuery();

		return () => {
			didUnsubscribe = true;
			unlisten();
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	const handleUpdateCrossing = useMemo<CrossingUpdater>(() => (id, ignored, team) => {

		const restUrl = store.get('restUrl');
		const token = store.get('authToken');

		// TODO: set actions loading

		updateCrossing(id, ignored, team)(restUrl, token)
			.then(result => {
				// TODO: maybe set state
			})
			.catch(err => {
				console.error(`[updateCrossing] error`, err);
			});

	}, [store]);

	return [valueToReturn, handleUpdateCrossing];

};
