"use strict";

import { useMemo } from 'react';
import { useQuery } from './data';
import { findOneRaceById } from './queries';
import { useLiveRaceData } from '../ws/hooks';
import {
	CROSSING_TEAM_A,
	CROSSING_TEAM_B,
	CROSSING_TEAM_UNSET,
	CrossingTeam,
	FullRace,
	RACE_STATE_FINISHED,
	RACE_STATE_UNFINISHED,
	RACE_TYPE_HEAD_TO_HEAD,
	RACE_TYPE_TIME_TRIAL,
} from '../types';
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

export interface TeamStats {
	startTime: number;
	stopTime: number;
	numLaps: number;
	bestLapTime: number;
	bestLapCrossingId: number;
	currentLapStartTime: number;
}

export interface TimeTrialRaceStats extends TeamStats {
	type: typeof RACE_TYPE_TIME_TRIAL;
}

export interface HeadToHeadRaceStats {
	type: typeof RACE_TYPE_HEAD_TO_HEAD;
	teamA: TeamStats;
	teamB: TeamStats;
}

export type RaceStats = TimeTrialRaceStats | HeadToHeadRaceStats;

export const computeRaceStatsAndMutateCrossings = (race: FullRace): RaceStats => {

	const type = race.type;

	if (type === RACE_TYPE_TIME_TRIAL) {
		return {
			type,
			...computeTeamStatsAndMutateCrossings(race, CROSSING_TEAM_UNSET, race.teamABarrierId),
		};
	}

	// HEAD_TO_HEAD
	return {
		type,
		teamA: computeTeamStatsAndMutateCrossings(race, CROSSING_TEAM_A, race.teamABarrierId),
		teamB: computeTeamStatsAndMutateCrossings(race, CROSSING_TEAM_B, race.teamBBarrierId),
	};

};

/**
 * Computes race stats for the given team
 * NOTE! The `race.crossings` array is mutated (new fields are added so on! (for performance reasons)
 * @param race
 * @param team
 * @param lapBarrierId lap (home) barrier of the `team`
 */
export const computeTeamStatsAndMutateCrossings = (
	race: FullRace,
	team: CrossingTeam,
	lapBarrierId: number,
): TeamStats => {

	let startTime = -1;
	let stopTime = -1;
	let numLaps = 0;
	let checkpointNumber = 0;
	let bestLapTime = Number.MAX_SAFE_INTEGER;
	let currentLapStartTime = -1;
	let last = -1;
	let bestLapCrossingId = -1;

	// NOTE! For performance reasons, we do NOT copy individual crossings (neither the whole array),
	// and instead we directly mutate individual crossing objects.
	race.crossings.forEach(c => {

		// exclude crossings from team stats computation
		// - ignored crossings
		// - crossings of the other team
		if (c.ignored || c.team !== team) {
			return c;
		}

		// set the startTime as the first crossing through the lap barrier
		if (c.barrierId === lapBarrierId && startTime === -1) {
			// mark crossings as the start one
			// NOTE: This mutation should never collide with mutations from other call
			//       of computeTeamStatsAndMutateCrossings on the same race, resp. crossings array
			//       iff each for each team value, unique lapBarrierId value is provided.
			c.start = true;
			startTime = c.time;
			currentLapStartTime = startTime;
			// if we know the race duration, we can calculate the stopTime
			if (race.type === RACE_TYPE_TIME_TRIAL && race.timeDuration > 0) {
				stopTime = startTime + race.timeDuration;
			}
		}

		// ignore crossings that happened after the race stopTime
		// if this is a fixed-time race (e.g. RACE_TYPE_TIME_TRIAL with non-zero timeDuration)
		if (stopTime !== -1 && c.time > stopTime) {
			c.excluded = true;
			return;
		}

		// two (non-skipped) consecutive lap-barrier crossings forms a lap
		// the elapsed time between them (diff) is the lap (duration) time
		if (c.barrierId === lapBarrierId && last !== -1) {

			const diff = c.time - last;

			// under normal circumstances, this should NOT happen
			if (diff < 0) {
				console.error('lap calc', c, last);
			}

			numLaps++;
			checkpointNumber = 0;

			// assign the lap stats to the crossing
			// NOTE: This mutation should never collide with mutations from other call
			//       of computeTeamStatsAndMutateCrossings on the same race, resp. crossings array
			//       iff each for each team value, unique lapBarrierId value is provided.
			c.lap = {
				number: numLaps,
				time: diff,
			};

			currentLapStartTime = c.time;

			if (diff < bestLapTime) {
				bestLapTime = diff;
				bestLapCrossingId = c.id;
			}

		} else if (last !== -1) {
			// non lap-barrier crossings after a lap-barrier crossing forms a lap checkpoint
			// the elapsed time between the lap-barrier crossing (i.e. the lap start time)
			// and this crossing is a partial lap time on this checkpoint (identified by number)

			const diff = c.time - last;

			// under normal circumstances, this should NOT happen
			if (diff < 0) {
				console.error('lap calc', c, last);
			}

			checkpointNumber++;

			// assign the lap checkpoint stats to the crossing
			// NOTE: This mutation should never collide with mutations from other call
			//       of computeTeamStatsAndMutateCrossings on the same race, resp. crossings array
			//       iff each for each team value, unique lapBarrierId value is provided.
			c.checkpoint = {
				lapNumber: numLaps + 1,
				number: checkpointNumber,
				time: diff,
			};

		}

		// if this is a crossing through the lap barrier
		// remember this crossing for the next iteration
		// so we can detect laps (i.e., the time between
		// two (non-skipped) consecutive lap-barrier crossings)
		if (c.barrierId === lapBarrierId) {
			last = c.time;
		}

	});

	// If the race stopTime is not known and the race has already been stopped (finished or cancelled),
	// we use the time of the last non-ignored lap-barrier crossing (if there is any), as the stopTime.
	if (stopTime === -1 && last !== -1 && (race.state === RACE_STATE_FINISHED || race.state === RACE_STATE_UNFINISHED)) {
		stopTime = last;
	}

	// reset best lap time if there is no lap
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
	};

};
