"use strict";

import React from 'react';
import { Link } from '../router/compoments';
import { R_RACE } from '../routes';
import { useFormatMessageId } from '../helpers/hooks';
import { Race, RACE_TYPE_HEAD_TO_HEAD, RACE_TYPE_TIME_TRIAL } from '../types';
import { copyOnClick } from '../helpers/copy';
import classNames from 'classnames';
import { isDefined } from '../helpers/common';


export interface RacesListItemProps {
	race: Race;
}

export const RacesListItem = (
	{
		race,
	}: RacesListItemProps,
) => {

	const t = useFormatMessageId();

	console.log(race);

	return (
		<div
			data-id={race.id}
			className={classNames([
				'races-list-item',
				`race--${race.type.replace('_', '-')}`,
				`race--${race.state.replace('_', '-')}`,
			])}
		>

			<div className="race-id">#{race.id}</div>

			{isDefined(race.number) && <div className="race-number">{race.number}</div>}

			<div className="race-type">
				{t(`race.types.${race.type}`)}
			</div>

			<div className="race-team">
				<span className="team-a">{race.teamA.name}</span>
				{race.type === RACE_TYPE_HEAD_TO_HEAD && (
					<>
						<span className="divider">vs.</span>
						<span className="team-b">{race.teamB.name}</span>
					</>
				)}
			</div>

			<div className="race-round">
				{t(`race.${race.type === RACE_TYPE_TIME_TRIAL ? 'heat' : 'round'}`)} {race.round}
			</div>

			<div className="race-state">
				{t(`race.states.${race.state}`)}
			</div>

			<Link
				className="btn btn-detail btn-sm btn-default"
				name={R_RACE}
				payload={{ raceId: race.id }}
			>
				{t('race.actions.detail')}
			</Link>

		</div>
	);

};

export const CopyableCode = ({ children }) =>
	<code className="copyable-code" onClick={copyOnClick}>{children}</code>;
