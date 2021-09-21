"use strict";

import React, { useMemo } from 'react';
import { useQuery } from './data';
import { findOneTrialById } from './queries';
import { useLiveTrialData } from '../ws/hooks';
import { ComputedLap, EnhancedCrossing, FullTrial, TRIAL_STATE_FINISHED, TRIAL_STATE_UNFINISHED } from '../types';


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
	let stopTime = -1; // TODO
	let numLaps = 0;
	let bestLapTime = Number.MAX_SAFE_INTEGER;
	let currentLapStartTime = -1;
	let last = -1;
	let bestLapCrossingId = -1;

	const enhancedCrossings: EnhancedCrossing[] = trial.crossings.map(c => {

		// remove once we get timestamps as integers
		const ts = c.time * 1000;

		if (c.ignored) {
			return {
				id: c.id,
				time: ts,
				ignored: c.ignored,
				start: false,
				lap: undefined,
			};
		}

		let start = false;
		let lap: ComputedLap | undefined = undefined;

		if (startTime === -1) {
			start = true;
			startTime = ts;
		}

		if (last !== -1) {

			const diff = ts - last;

			numLaps++;

			lap = {
				number: numLaps,
				time: diff,
			};

			currentLapStartTime = ts;

			if (diff < bestLapTime) {
				bestLapTime = diff;
				bestLapCrossingId = c.id;
			}

		}

		last = ts;

		return {
			id: c.id,
			time: ts,
			ignored: c.ignored,
			start,
			lap,
		};

	});

	if (last !== -1 && (trial.state === TRIAL_STATE_FINISHED || trial.state === TRIAL_STATE_UNFINISHED)) {
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
