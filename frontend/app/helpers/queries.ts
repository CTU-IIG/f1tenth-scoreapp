"use strict";

import { doRequest, METHOD_POST } from './api';
import { Crossing, FullRace, Race, RACE_TYPE_TIME_TRIAL, Team } from '../types';


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

export const findAllRaces =
	(restUrl: string) =>
		doRequest<Race[]>(`${restUrl}/races`);

export const findOneRaceById = (id: number) =>
	(restUrl: string) =>
		doRequest<FullRace | undefined>(
			`${restUrl}/races/${id}`,
			{ returnUndefinedForNotFoundError: true },
		);

export const createRace = (teamAId: number) =>
	(restUrl: string) =>
		doRequest<Race>(
			`${restUrl}/races`,
			{
				method: METHOD_POST,
				body: { type: RACE_TYPE_TIME_TRIAL, teamAId },
			},
		);

export const startRace = (id: number) =>
	(restUrl: string) =>
		doRequest<FullRace>(
			`${restUrl}/races/${id}/start`,
			{ method: METHOD_POST },
		);

export const stopRace = (id: number) =>
	(restUrl: string) =>
		doRequest<FullRace>(
			`${restUrl}/races/${id}/stop`,
			{ method: METHOD_POST },
		);

export const cancelRace = (id: number) =>
	(restUrl: string) =>
		doRequest<FullRace>(
			`${restUrl}/races/${id}/cancel`,
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
