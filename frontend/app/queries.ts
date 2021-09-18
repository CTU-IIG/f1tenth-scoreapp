"use strict";

import { doRequest, METHOD_POST } from './helpers/api';
import { Crossing, FullTrial, Trial } from './types';


export const findAllTrials =
	(restUrl: string) =>
		doRequest<Trial[]>(`${restUrl}/trials`);

export const findOneTrialById = (id: number) =>
	(restUrl: string) =>
		doRequest<FullTrial | undefined>(
			`${restUrl}/trials/${id}`,
			{ returnUndefinedForNotFoundError: true },
		);

export const startTrial = (id: number) =>
	(restUrl: string) =>
		doRequest<FullTrial>(
			`${restUrl}/trials/${id}/start`,
			{ method: METHOD_POST },
		);

export const stopTrial = (id: number) =>
	(restUrl: string) =>
		doRequest<FullTrial>(
			`${restUrl}/trials/${id}/stop`,
			{ method: METHOD_POST },
		);

export const cancelTrial = (id: number) =>
	(restUrl: string) =>
		doRequest<FullTrial>(
			`${restUrl}/trials/${id}/cancel`,
			{ method: METHOD_POST },
		);

export const ignoreCrossing = (id: number) =>
	(restUrl: string) =>
		doRequest<Crossing>(
			`${restUrl}/crossings/${id}/ignore`,
			{ method: METHOD_POST },
		);

export const unignoreCrossing = (id: number) =>
	(restUrl: string) =>
		doRequest<Crossing>(
			`${restUrl}/crossings/${id}/unignore`,
			{ method: METHOD_POST },
		);
