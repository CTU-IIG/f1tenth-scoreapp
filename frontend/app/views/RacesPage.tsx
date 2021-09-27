"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { LoadingError, LoadingScreen } from '../components/layout';
import { RacesListItem } from '../components/content';
import { useQuery } from '../helpers/data';
import { R_RACE_NEW, R_TEAMS } from '../routes';
import { Breadcrumbs } from '../components/breadcrumbs';
import { findAllRaces } from '../helpers/queries';
import { Link } from '../router/compoments';


const RacesPage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.races`);

	const { op } = useQuery(findAllRaces);

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

	return (
		<>

			<Breadcrumbs
				name={R_TEAMS}
			/>

			<h1>{t`titles.races`}</h1>

			<p>
				<Link className="btn btn-primary" name={R_RACE_NEW}>{t`racesPage.createRace`}</Link>
			</p>

			<div className="races-list">
				{op.data.map(race =>
					<RacesListItem
						key={race.id}
						race={race}
					/>,
				)}
			</div>

		</>
	);

};

export default RacesPage;
