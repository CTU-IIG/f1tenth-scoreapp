"use strict";


export interface AppState {
	locale: string;
	restUrl: string;
	webSocketUrl: string;
	authToken: string | undefined;
	soundEffects: boolean;
}

export interface Entity {
	id: number;
	updatedAt: number; // Unix timestamp in UTC milliseconds
}

export interface Team extends Entity {
	name: string;
}

export const RACE_TYPE_TIME_TRIAL = 'time_trial';
export const RACE_TYPE_HEAD_TO_HEAD = 'head_to_head';

export type RaceType =
	| typeof RACE_TYPE_TIME_TRIAL
	| typeof RACE_TYPE_HEAD_TO_HEAD;

export const RACE_STATE_BEFORE_START = 'before_start';
export const RACE_STATE_RUNNING = 'running';
export const RACE_STATE_FINISHED = 'finished';
export const RACE_STATE_UNFINISHED = 'unfinished';

export type RaceState =
	| typeof RACE_STATE_BEFORE_START
	| typeof RACE_STATE_RUNNING
	| typeof RACE_STATE_FINISHED
	| typeof RACE_STATE_UNFINISHED;

export interface Race extends Entity {
	type: RaceType;
	round: number;
	teamAId: number;
	teamA: Team;
	state: RaceState;
}

export interface FullRace extends Race {
	crossings: Crossing[],
}

export interface Crossing extends Entity {
	time: number; // Unix timestamp in UTC milliseconds
	ignored: boolean;
	barrierId: number;
	// teamA: boolean; TODO: team marking for RACE_TYPE_HEAD_TO_HEAD
}

export interface ComputedLap {
	number: number;
	time: number;
}

export interface EnhancedCrossing extends Crossing {
	start?: boolean | undefined;
	lap?: ComputedLap | undefined;
}
