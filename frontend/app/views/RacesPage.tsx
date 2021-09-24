"use strict";

import React from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { LoadingError, LoadingScreen } from '../components/layout';
import { RaceCard } from '../components/content';
import { useQuery } from '../helpers/data';
import { R_RACES, R_TEAMS } from '../routes';
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
				name={R_RACES}
			/>

			<h1>{t`titles.races`}</h1>

			<p>
				<Link className="btn btn-primary" name={R_TEAMS}>{t`racesPage.createRaceViaTeamsPage`}</Link>
			</p>

			<div className="card-grid">
				{op.data.map(race =>
					<RaceCard
						key={race.id}
						race={race}
					/>,
				)}
			</div>

		</>
	);

};

export default RacesPage;
