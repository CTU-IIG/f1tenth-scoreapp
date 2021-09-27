"use strict";

import { useMemo } from 'react';
import { useQuery } from './data';
import { findOneRaceById } from './queries';
import { useLiveRaceData } from '../ws/hooks';
import { EnhancedCrossing, FullRace, RACE_STATE_FINISHED, RACE_STATE_UNFINISHED, RACE_TYPE_TIME_TRIAL } from '../types';
import { isDefined } from './common';


export const useRaceData = (id: number) => {

	const latestData = useLiveRaceData(id);

	const query = useMemo(() => findOneRaceById(id), [id]);
	const { op } = useQuery(query);

	if (!op.loading && !op.hasError && op.data !== undefined) {
		if (isDefined(latestData) && latestData.updatedAt > (op.data.updatedAt ?? -1)) {
			return {
				...op,
				data: latestData,
			};
		}
		return op;
	}

	return op;

};

export interface RaceStats {
	startTime: number;
	stopTime: number;
	numLaps: number;
	bestLapTime: number;
	bestLapCrossingId: number;
	currentLapStartTime: number;
	enhancedCrossings: EnhancedCrossing[];
}

export const computeStats = (race: FullRace): RaceStats => {

	// TODO: RACE_TYPE_HEAD_TO_HEAD

	let startTime = -1;
	let stopTime = -1;
	let numLaps = 0;
	let bestLapTime = Number.MAX_SAFE_INTEGER;
	let currentLapStartTime = -1;
	let last = -1;
	let bestLapCrossingId = -1;

	// for performance reasons, we do not copy crossings, and instead we directly mutate it
	const enhancedCrossings: EnhancedCrossing[] = race.type === RACE_TYPE_TIME_TRIAL
		? race.crossings.filter(c => c.barrierId === 1) // time trial use only the barrier with id 1
		: race.crossings; // RACE_TYPE_HEAD_TO_HEAD uses both barriers

	enhancedCrossings.forEach(c => {

		if (c.ignored) {
			return c;
		}

		if (startTime === -1) {
			c.start = true;
			startTime = c.time;
			currentLapStartTime = startTime;
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

	if (last !== -1 && (race.state === RACE_STATE_FINISHED || race.state === RACE_STATE_UNFINISHED)) {
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
