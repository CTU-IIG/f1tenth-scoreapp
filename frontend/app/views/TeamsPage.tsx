"use strict";

import React, { useCallback, useMemo } from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { LoadingError, LoadingScreen } from '../components/layout';
import { useQuery } from '../helpers/data';
import { R_RACES, R_TEAMS } from '../routes';
import { Breadcrumbs } from '../components/breadcrumbs';
import { findAllTeams } from '../helpers/queries';
import { Table, TableColumn } from '../components/table';
import { Team } from '../types';
import { useRouter } from '../router/hooks';


const getRowKey = (team: Team) => team.id;

const TeamsPage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.teams`);

	const router = useRouter();

	const handleRaceCreated = useCallback(() => {
		router.push(R_RACES);
		return false;
	}, [router]);

	const columns = useMemo<TableColumn<Team>[]>(() => ([
		{
			name: 'teamsPage.columns.id',
			type: 'number',
			formatter: team => team.id,
		},
		{
			name: 'teamsPage.columns.name',
			type: 'string',
			formatter: team => team.name,
		},
	]), []);

	const { op } = useQuery(findAllTeams);

	if (op.loading) {
		return (
			<LoadingScreen />
		);
	}

	if (op.hasError) {
		return (
			<LoadingError error={op.error} />
		);
	}

	return (
		<>

			<Breadcrumbs
				name={R_TEAMS}
			/>

			<h1>{t`titles.teams`}</h1>

			<Table<Team>
				columns={columns}
				data={op.data}
				getRowKey={getRowKey}
			/>

		</>
	);

};

export default TeamsPage;
