"use strict";


export const R_ROOT = 'R_ROOT';
export const R_SETTINGS = 'R_SETTINGS';

export const R_TRIALS = 'R_TRIALS';
export const R_TRIAL_NEW = 'R_TRIAL_NEW';
export const R_TRIAL = 'R_TRIAL';

export const R_PRESENTATION = 'R_PRESENTATION';

// note: ORDER MATTERS, the routes are matched from top to bottom
export const routesMap = new Map([
	[R_TRIAL_NEW, '/trial/new'],
	[R_TRIAL, '/trials/:trialId'],
	[R_TRIALS, '/trials'],
	[R_PRESENTATION, '/presentation'],
	[R_SETTINGS, '/settings'],
	[R_ROOT, '/'],
	// [R_SOMETHING, '/some/route/:param/deep'],
]);
