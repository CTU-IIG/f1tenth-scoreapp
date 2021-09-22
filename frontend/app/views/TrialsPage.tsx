"use strict";

import React, { useMemo } from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { LoadingError, LoadingScreen } from '../components/layout';
import { TrialCard } from '../components/content';
import { useQuery } from '../helpers/data';
import { R_TRIALS } from '../routes';
import { Breadcrumbs } from '../components/breadcrumbs';
import { createTrial, findAllTrials } from '../helpers/queries';
import { QueryButton } from '../components/data';


const TrialsPage = () => {

	const t = useFormatMessageIdAsTagFn();

	useDocumentTitle(t`titles.trials`);

	const createTrialWithTeamIdOne = useMemo(() => createTrial(1), []);

	const { op } = useQuery(findAllTrials);

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
				name={R_TRIALS}
			/>

			<h1>{t`titles.trials`}</h1>

			<div className="btn-group">
				<QueryButton
					query={createTrialWithTeamIdOne}
					label="trialsPage.createTrial"
					style="success"
				/>
			</div>

			<div className="card-grid">
				{op.data.map(trial =>
					<TrialCard
						key={trial.id}
						trial={trial}
					/>,
				)}
			</div>

		</>
	);

};

export default TrialsPage;
