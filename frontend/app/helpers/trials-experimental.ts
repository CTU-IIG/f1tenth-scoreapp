"use strict";

import { QueryOperation } from './data';
import { FullTrial } from '../types';
import { useWebSocketManager } from '../ws/hooks';
import { useStoreValueRestUrl } from './hooks';
import { useEffect, useState } from 'react';
import { findOneTrialById } from './queries';
import { isDefined } from './common';
import { computeStats, TrialStats } from './trials';


interface UseTrialDataInnerState {
	deps: any[];
	op: QueryOperation<FullTrialAndStats | undefined>;
}

export const staleDeps = (prevDeps: any[], currentDeps: any[]) => {

	const r = prevDeps.length !== currentDeps.length || !prevDeps.every((d, i) => d === currentDeps[i]);

	if (r) {
		console.log('stale deps', prevDeps, currentDeps);
	}

	return r;

};

export interface FullTrialAndStats {
	trial: FullTrial;
	stats: TrialStats;
}

export const useTrialDataExperimental = (trialId: number): QueryOperation<FullTrialAndStats | undefined> => {

	const manager = useWebSocketManager();

	const [restUrl] = useStoreValueRestUrl();

	const deps = [trialId, manager, restUrl];

	const [state, setState] = useState<UseTrialDataInnerState>(() => ({
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

			let op: QueryOperation<FullTrial | undefined>;

			try {
				const data = await findOneTrialById(trialId)(restUrl);
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
				if (!isDefined(prevState.op.data) || prevState.op.data.trial.updatedAt < op.data.updatedAt) {
					return {
						...prevState,
						op: {
							loading: false,
							hasError: false,
							data: {
								trial: op.data,
								stats: computeStats(op.data),
							},
						},
					};
				}

				return prevState;

			});

		};

		const unlisten = manager.listenForTrialData(trialId, trial => {

			if (didUnsubscribe) {
				return;
			}

			setState(prevState => {

				if (staleDeps(prevState.deps, deps)) {
					return prevState;
				}

				if (!isDefined(prevState.op.data) || prevState.op.data.trial.updatedAt < trial.updatedAt) {
					return {
						...prevState,
						op: {
							loading: false,
							hasError: false,
							data: {
								trial,
								stats: computeStats(trial),
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

	return valueToReturn;

};
