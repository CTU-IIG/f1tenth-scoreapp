"use strict";


export interface AppState {
	locale: string;
	restUrl: string;
	webSocketUrl: string;
	soundEffects: boolean;
}

export interface Entity {
	id: number;
	updatedAt: number; // Unix timestamp in UTC milliseconds
}

export interface Team extends Entity {
	name: string;
}

export const TRIAL_STATE_BEFORE_START = 'before_start';
export const TRIAL_STATE_RUNNING = 'running';
export const TRIAL_STATE_FINISHED = 'finished';
export const TRIAL_STATE_UNFINISHED = 'unfinished';

export type TrialState =
	typeof TRIAL_STATE_BEFORE_START
	| typeof TRIAL_STATE_RUNNING
	| typeof TRIAL_STATE_FINISHED
	| typeof TRIAL_STATE_UNFINISHED;

export interface Trial extends Entity {
	round: number;
	teamId: number;
	team: Team;
	state: TrialState;
}

export interface FullTrial extends Trial {
	crossings: Crossing[],
}

export interface Crossing extends Entity {
	time: number; // Unix timestamp in UTC milliseconds
	ignored: boolean;
}

export interface ComputedLap {
	number: number;
	time: number;
}

export interface EnhancedCrossing extends Crossing {
	start?: boolean | undefined;
	lap?: ComputedLap | undefined;
}
