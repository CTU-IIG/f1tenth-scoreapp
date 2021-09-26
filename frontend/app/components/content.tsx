"use strict";

import React from 'react';
import { Link } from '../router/compoments';
import { R_RACE } from '../routes';
import { useFormatMessageId } from '../helpers/hooks';
import { Race } from '../types';
import { copyOnClick } from '../helpers/copy';


export interface RaceCardProps {
	race: Race;
}

export const RaceCard = (
	{
		race,
	}: RaceCardProps,
) => {

	const t = useFormatMessageId();

	return (
		<section className="card package">

			<header className="card-heading">
				<h3 className="heading">#{race.id} {race.teamA.name}</h3>
			</header>

			<div className="card-content">
				{t(`race.round`)}: {race.round}
				<br />{t(`race.type`)}: {t(`race.types.${race.type}`)}
				<br />{t(`race.state`)}: {t(`race.states.${race.state}`)}
			</div>

			<div className="card-actions">
				<Link name={R_RACE} payload={{ raceId: race.id }}>{t('race.actions.detail')}</Link>
			</div>

		</section>
	);

};

export const CopyableCode = ({ children }) =>
	<code className="copyable-code" onClick={copyOnClick}>{children}</code>;
