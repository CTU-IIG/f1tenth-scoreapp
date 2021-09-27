"use strict";

import { doRequest, METHOD_POST } from './api';
import { CreateRaceData, Crossing, CrossingTeam, FullRace, Race, Team } from '../types';


export const findAllTeams =
	(restUrl: string, token: string | undefined) =>
		doRequest<Team[]>(`${restUrl}/teams`);

export const createTeam = (name: string) =>
	(restUrl: string, token: string | undefined) =>
		doRequest<Team>(
			`${restUrl}/teams`,
			{
				method: METHOD_POST,
				token,
				body: { name },
			},
		);

export const updateTeam = (id: number, name: string) =>
	(restUrl: string, token: string | undefined) =>
		doRequest<Team>(
			`${restUrl}/teams/${id}`,
			{
				method: METHOD_POST,
				token,
				body: { name },
			},
		);

export const findAllRaces =
	(restUrl: string, token: string | undefined) =>
		doRequest<Race[]>(`${restUrl}/races`);

export const findOneRaceById = (id: number) =>
	(restUrl: string, token: string | undefined) =>
		doRequest<FullRace | undefined>(
			`${restUrl}/races/${id}`,
			{ returnUndefinedForNotFoundError: true },
		);

export const createRace = (data: CreateRaceData) =>
	(restUrl: string, token: string | undefined) =>
		doRequest<Race>(
			`${restUrl}/races`,
			{
				method: METHOD_POST,
				token,
				body: data,
			},
		);

export const startRace = (id: number) =>
	(restUrl: string, token: string | undefined) =>
		doRequest<FullRace>(
			`${restUrl}/races/${id}/start`,
			{ method: METHOD_POST, token },
		);

export const stopRace = (id: number) =>
	(restUrl: string, token: string | undefined) =>
		doRequest<FullRace>(
			`${restUrl}/races/${id}/stop`,
			{ method: METHOD_POST, token },
		);

export const cancelRace = (id: number) =>
	(restUrl: string, token: string | undefined) =>
		doRequest<FullRace>(
			`${restUrl}/races/${id}/cancel`,
			{ method: METHOD_POST, token },
		);

export const updateCrossing = (id: number, ignored: boolean, team: CrossingTeam) =>
	(restUrl: string, token: string | undefined) =>
		doRequest<Crossing>(
			`${restUrl}/crossings/${id}`,
			{
				method: METHOD_POST,
				token,
				body: { ignored, team },
			},
		);
