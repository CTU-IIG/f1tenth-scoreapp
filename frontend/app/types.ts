"use strict";


export interface AppState {
	locale: string;
	restUrl: string;
	webSocketUrl: string;
	soundEffects: boolean;
}

export interface Team {
	id: number;
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

export interface Trial {
	id: number;
	round: number;
	team: Team;
	state: TrialState;
}

export interface FullTrial extends Trial {
	crossings: Crossing[],
}

export interface Crossing {
	id: number;
	time: number;
	ignored: boolean;
}
