"use strict";


export const R_ROOT = 'R_ROOT';
export const R_SETTINGS = 'R_SETTINGS';

export const R_TEAMS = 'R_TEAMS';
export const R_TEAM_NEW = 'R_TEAM_NEW';
export const R_TEAM = 'R_TEAM';

export const R_RACES = 'R_RACES';
export const R_RACE_NEW = 'R_RACE_NEW';
export const R_RACE = 'R_RACE';

export const R_PRESENTATION = 'R_PRESENTATION';

// note: ORDER MATTERS, the routes are matched from top to bottom
export const routesMap = new Map([
	// [R_TEAM_NEW, '/team/new'],
	// [R_TEAM, '/teams/:teamId'],
	[R_TEAMS, '/teams'],
	[R_RACE_NEW, '/races/new'],
	[R_RACE, '/races/:raceId'],
	[R_RACES, '/races'],
	[R_PRESENTATION, '/presentation'],
	[R_SETTINGS, '/settings'],
	[R_ROOT, '/'],
	// [R_SOMETHING, '/some/route/:param/deep'],
]);
