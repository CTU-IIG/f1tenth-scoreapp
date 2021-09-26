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

export interface AbstractRace extends Entity {
	type: RaceType;
	state: RaceState;
	round: number;
	teamAId: number;
	teamA: Team;
}

export interface TimeTrialRace extends AbstractRace {
	type: typeof RACE_TYPE_TIME_TRIAL;
	timeDuration: number; // duration of the race in milliseconds
}

export interface HeadToHeadRace extends AbstractRace {
	type: typeof RACE_TYPE_HEAD_TO_HEAD;
	lapsDuration: number; // the first team to successfully complete this number of laps wins
	teamBId: number;
	teamB: Team;
}

export type Race = TimeTrialRace | HeadToHeadRace;

export type FullRace = Race & { crossings: Crossing[] };

export const CROSSING_TEAM_UNSET = 0;
export const CROSSING_TEAM_A = 1;
export const CROSSING_TEAM_B = 2;

export type CrossingTeam =
	| typeof CROSSING_TEAM_UNSET
	| typeof CROSSING_TEAM_A
	| typeof CROSSING_TEAM_B;

export interface Crossing extends Entity {
	time: number; // Unix timestamp in UTC milliseconds
	ignored: boolean;
	barrierId: number;
	team: CrossingTeam;
}

export interface ComputedLap {
	number: number;
	time: number;
}

export interface EnhancedCrossing extends Crossing {
	start?: boolean | undefined;
	lap?: ComputedLap | undefined;
}
