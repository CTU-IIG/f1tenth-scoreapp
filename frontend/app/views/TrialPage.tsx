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

const LapHistory = (props) => {
	return (
		<ul>
			{props.lapTimes.map((time, index) => {
				//return <li key={index}>{time}</li>;
				return <TimeDisplay key={index} name={'Lap ' + (index+1)+': '} time={time}/>
			})}
		</ul>
	);
}

const CrossingsHistory = (props) => {
	const sendRequest = () => {
		//TODO send REST API request
	};

	return (
		<ul>
			{props.crossings.map((cs, index) => {
				return (
					<>
						<TimeDisplay key={index} name={'Crossing ' + (index+1)+': '} time={cs?.time*1000 - props.start}/>
						<button key={index} onClick={sendRequest}>
							{cs?.ignored ? 'Y' : 'N'}
						</button>
					</>
				)
			})}
		</ul>
	);
}


const findOneTrialById = (id: number) => (restUrl: string, webSocketUrl: string): Promise<Trial | undefined> => {

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

function computeLapTimes(trial){
	let lapTimes = [];
	let shortestLapTime = 99999999999;
	let last = 0;
	let startTime = 0;

	if (trial?.crossings === undefined) return {lapTimes, bestLapTime: shortestLapTime, lapStartTime: last, raceStartTime: startTime};

	for(const cs of trial?.crossings){
		if (cs?.ignored === true) continue;
		if (last !== 0){
			const dif = cs?.time*1000 - last;
			lapTimes.push(dif);
			shortestLapTime = (dif < shortestLapTime) ? dif : shortestLapTime;
		}else{
			startTime=cs?.time*1000;
		}
		last = cs?.time*1000;
	}

	console.log('lt:', lapTimes);
	console.log('blt:', shortestLapTime);
	console.log('lst:', last);
	console.log('rst:', startTime);
	return {lapTimes, bestLapTime: shortestLapTime, lapStartTime: last, raceStartTime: startTime};
}

const TrialPage = () => {

	const t = useFormatMessageIdAsTagFn();

	const { route } = useRoute();
	const [canEdit, setCanEdit] = useState(false);

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

	//set ws listener to race with id = id
	const state = useWebSocket(id);	//id

	//state is an immutable json object containing received message


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



	const isActive = (trial?.state === 'running');
	const {lapTimes, bestLapTime, lapStartTime, raceStartTime} = computeLapTimes(trial);

	let history;
	if (canEdit){
		history = <LapHistory lapTimes={lapTimes}/>
	}else{
		history = <CrossingsHistory crossings={trial?.crossings} start={raceStartTime}/>
	}


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


			<Timers name="Best lap: " lapStartTime={lapStartTime} raceStartTime={raceStartTime} bestLapTime={bestLapTime} active={isActive}/>
			{history}
			<button onClick={() => setCanEdit(prev => !prev)}>
				{canEdit ? "Switch to display only mode" : "Switch to editing mode"}
			</button>

		</>
	);

};

export default TrialPage;
// <Timers name="Best lap: " lapStartTime={test_time} raceStartTime={test_time} bestLapTime={test_time} active={true}/>
//shortestLapTime
