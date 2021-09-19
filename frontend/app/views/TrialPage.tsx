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
import { Timers, Timer, TimeDisplay } from '../components/timers';
import { useWebSocket } from '../helpers/ws_hook';


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


const test_time = new Date();

const TrialPage = () => {

	const t = useFormatMessageIdAsTagFn();

	const { route } = useRoute();

	//red trialId is IDE error
	const idStr = route?.payload?.trialId as string;

	//id contains race id parsed from html
	const id = parseInt(idStr);

	console.log('id = ', id);

	const query = useMemo(() => findOneTrialById(id), [id]);
	console.log('query= ', query);

	const op = useQuery(query);
	console.log('op= ', op);

	const pageTitle = op.loading ?
		t`titles.loading`
		: !isDefined(op.data) ? t`titles.notFound` : op.data.id.toString();

	useDocumentTitle(pageTitle);

	//state is an immutable json object containing received message
	const state = useWebSocket();	//id

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

	const displayedTrial = op.data;
	//const ID: {trial.id}<br />
	// 			NAME: {trial.name}



	console.log('State:', state);

	//const trialReceived = state?.trial;
	const trial = state?.trial;

	//if (state?.trial?.id === id) trial = trialReceived;
		//trial = JSON.parse(JSON.stringify(trialReceived));


	let lapTimes = [];
	let shortestLapTime = 99999999999;
	let last = None;
	console.log('comp lap times');

	for(let cs in trial?.crossings){
		if (cs?.ignored) continue;
		if (last !== None){
			lapTimes.push(cs?.time - last);
			shortestLapTime = (cs?.time - last < shortestLapTime) ? cs?.time - last : shortestLapTime;
		}
		last = cs?.time;
	}

	console.log('comp lap times done: ', lapTimes);

	console.log('trial: ', trial);



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

			<h2>
				{(() => {
					if (trial?.state === "running"){
						return "Race in progress";
					} else if (trial?.state === "unfinished"){
						return "Race cancelled";
					} else if (trial?.state === "finished"){
						return "Race finished";
					}
				})()}
			</h2>

			<TimeDisplay name="Best lap: " time={shortestLapTime}/>

		</>
	);

};

export default TrialPage;
// <Timers name="Best lap: " lapStartTime={test_time} raceStartTime={test_time} bestLapTime={test_time} active={true}/>
