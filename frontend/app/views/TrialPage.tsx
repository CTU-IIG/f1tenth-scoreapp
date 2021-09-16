"use strict";

import React, { useMemo } from 'react';

import { useDocumentTitle, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingScreen } from '../components/layout';
import NotFoundPage from './NotFoundPage';
import { Breadcrumbs } from '../components/breadcrumbs';
import { R_TRIAL } from '../routes';
import { useQuery } from '../helpers/data';
import { Trial } from '../types';


const findOneTrialById = (id: number) => (restUrl: string, webSocketUrl: string): Promise<Trial | undefined> => Promise.resolve({
	id: 1,
	name: 'x',
});

const TrialPage = () => {

	const t = useFormatMessageIdAsTagFn();

	const { route } = useRoute();

	const idStr = route?.payload?.packageId as string;

	const id = parseInt(idStr);

	const query = useMemo(() => findOneTrialById(id), [id]);

	const op = useQuery(query);

	const pageTitle = op.loading ? t`titles.loading` : !isDefined(op.data) ? t`titles.notFound` : op.data.name;

	useDocumentTitle(pageTitle);

	if (op.loading) {
		return (
			<LoadingScreen />
		);
	}

	if (!isDefined(op.data)) {
		return (
			<NotFoundPage />
		);
	}

	const trial = op.data;

	return (
		<>

			<Breadcrumbs
				name={R_TRIAL}
				trialId={trial.id}
				trialName={trial.name}
			/>

			ID: {trial.id}<br/>
			NAME: {trial.name}

		</>
	);

};

export default TrialPage;
