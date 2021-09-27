"use strict";

import React, { useCallback, useState } from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { R_RACE_NEW, R_RACES } from '../routes';
import { Breadcrumbs } from '../components/breadcrumbs';
import { Option } from '../components/inputs';
import { QueryOperation, useQuery } from '../helpers/data';
import { createRace, findAllTeams } from '../helpers/queries';
import { LoadingError, LoadingScreen } from '../components/layout';
import NewRaceForm from './NewRaceForm';
import { AppState, CreateRaceData, Race } from '../types';
import { useRouter } from '../router/hooks';
import { useStore } from '../store/hooks';
import { isDefined } from '../helpers/common';
import { Link } from '../router/compoments';


const NewRacePage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.newRace`);

	const store = useStore<AppState>();
	const router = useRouter();

	const [state, setState] = useState<QueryOperation<Race> | undefined>(undefined);

	const handleSubmit = useCallback((data: CreateRaceData) => {

		console.log(data);

		const restUrl = store.get('restUrl');
		const token = store.get('authToken');

		setState(prevState => ({
			loading: true,
			hasError: false,
			data: undefined,
		}));

		createRace(data)(restUrl, token)
			.then(result => {
				router.push(R_RACES);
			})
			.catch(error => {
				setState(prevState => ({
					loading: false,
					hasError: true,
					error,
					data: undefined,
				}));
			});

	}, [store, router, setState]);

	const { op } = useQuery(findAllTeams);

	if (op.loading) {
		return (
			<LoadingScreen />
		);
	}

	if (op.hasError) {
		console.log(op.error);
		return (
			<LoadingError error={op.error} />
		);
	}

	const teams: Option[] = op.data.map(({ id, name }) => ({ value: id.toString(), label: name }));

	return (
		<>

			<Breadcrumbs
				name={R_RACE_NEW}
			/>

			<h1>{t`titles.newRace`}</h1>

			{isDefined(state)
				? (state.loading
						? <LoadingScreen />
						: (state.hasError
								? <LoadingError error={state.error} />
								: <Link name={R_RACES}>{t`titles.races`}</Link>
						)
				)
				: <NewRaceForm teams={teams} onSubmit={handleSubmit} />
			}

		</>
	);

};

export default NewRacePage;
