"use strict";

import React, { useMemo } from 'react';

import { useDocumentTitle, useFormatMessageId, useFormatMessageIdAsTagFn } from '../helpers/hooks';
import { useRoute } from '../router/hooks';
import { isDefined } from '../helpers/common';
import { LoadingError, LoadingScreen } from '../components/layout';
import { Breadcrumbs } from '../components/breadcrumbs';
import { R_TRIAL, R_TRIALS } from '../routes';
import { useQuery } from '../helpers/data';
import { findOneTrialById } from '../queries';
import { Link } from '../router/compoments';
import { useIntl } from 'react-intl';


const TrialNotFound = ({ id }) => {

	const intl = useIntl();

	const t = useFormatMessageId();

	return (
		<>
			<h1>{t(`trialPage.notFoundHeading`)}</h1>
			<p>
				{t(`trialPage.notFoundMessage`, { id })}
			</p>
			<Link name={R_TRIALS}>{t(`trialPage.backToTrials`)}</Link>
		</>
	);
};

const TrialPage = () => {

	const t = useFormatMessageIdAsTagFn();

	const { route } = useRoute();

	const idStr = route?.payload?.trialId as string;

	const id = parseInt(idStr);

	const query = useMemo(() => findOneTrialById(id), [id]);

	const op = useQuery(query);

	const pageTitle = op.loading ?
		t`titles.loading`
		: !isDefined(op.data) ? t`titles.notFound` : op.data.id.toString();

	useDocumentTitle(pageTitle);

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

	if (!isDefined(op.data)) {
		return (
			<TrialNotFound id={id} />
		);
	}

	const trial = op.data;

	return (
		<>

			<Breadcrumbs
				name={R_TRIAL}
				trialId={trial.id}
			/>

			<p>
				ID: {trial.id}
				<br />Round: {trial.round}
				<br />Team: {trial.team.name}
				<br />State: {trial.state}
			</p>

		</>
	);

};

export default TrialPage;
