"use strict";

import { doRequest, METHOD_POST } from './api';
import { Crossing, FullTrial, Team, Trial } from '../types';

export const findAllTeams =
	(restUrl: string) =>
		doRequest<Team[]>(`${restUrl}/teams`);

export const createTeam = (name: string) =>
	(restUrl: string) =>
		doRequest<Team>(
			`${restUrl}/teams`,
			{
				method: METHOD_POST,
				body: { name },
			},
		);

export const updateTeam = (id: number, name: string) =>
	(restUrl: string) =>
		doRequest<Team>(
			`${restUrl}/teams/${id}`,
			{
				method: METHOD_POST,
				body: { name },
			},
		);

export const findAllTrials =
	(restUrl: string) =>
		doRequest<Trial[]>(`${restUrl}/trials`);

export const findOneTrialById = (id: number) =>
	(restUrl: string) =>
		doRequest<FullTrial | undefined>(
			`${restUrl}/trials/${id}`,
			{ returnUndefinedForNotFoundError: true },
		);

export const createTrial = (teamId: number) =>
	(restUrl: string) =>
		doRequest<Trial>(
			`${restUrl}/trials`,
			{
				method: METHOD_POST,
				body: { teamId },
			},
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
