"use strict";

import { useMemo } from 'react';
import { useQuery } from './data';
import { findOneTrialById } from './queries';
import { useLiveTrialData } from '../ws/hooks';
import { EnhancedCrossing, FullTrial, TRIAL_STATE_FINISHED, TRIAL_STATE_UNFINISHED } from '../types';


export const useTrialData = (id: number) => {

	const latestData = useLiveTrialData(id);

	const query = useMemo(() => findOneTrialById(id), [id]);
	const op = useQuery(query);

	if (!op.loading && !op.hasError && op.data !== undefined) {
		// TODO: Which data are the latest?
		return {
			...op,
			data: latestData ?? op.data, // here we suppose that data from WS are latest
		};
	}

	return op;

};

export interface TrialStats {
	startTime: number;
	stopTime: number;
	numLaps: number;
	bestLapTime: number;
	bestLapCrossingId: number;
	currentLapStartTime: number;
	enhancedCrossings: EnhancedCrossing[];
}

export const computeStats = (trial: FullTrial): TrialStats => {

	let startTime = -1;
	let stopTime = -1;
	let numLaps = 0;
	let bestLapTime = Number.MAX_SAFE_INTEGER;
	let currentLapStartTime = -1;
	let last = -1;
	let bestLapCrossingId = -1;

	// for performance reasons, we do not copy crossings, and instead we directly mutate it
	const enhancedCrossings: EnhancedCrossing[] = trial.crossings;

	enhancedCrossings.forEach(c => {

		if (c.ignored) {
			return c;
		}

		if (startTime === -1) {
			c.start = true;
			startTime = c.time;
		}

		if (last !== -1) {

			const diff = c.time - last;

			if (diff < 0) {
				console.error('lap calc', c, last);
			}

			numLaps++;

			c.lap = {
				number: numLaps,
				time: diff,
			};

			currentLapStartTime = c.time;

			if (diff < bestLapTime) {
				bestLapTime = diff;
				bestLapCrossingId = c.id;
			}

		}

		last = c.time;

	});

	if (last !== -1 && (trial.state === TRIAL_STATE_FINISHED || trial.state === TRIAL_STATE_UNFINISHED)) {
		// TODO: maybe different stopTime logic?
		stopTime = last;
	}

	if (bestLapTime === Number.MAX_SAFE_INTEGER) {
		bestLapTime = -1;
	}

	return {
		startTime,
		stopTime,
		numLaps,
		bestLapTime,
		bestLapCrossingId,
		currentLapStartTime,
		enhancedCrossings,
	};

};
