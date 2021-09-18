"use strict";

import React from 'react';
import { Link } from '../router/compoments';
import { R_TRIAL } from '../routes';
import { useFormatMessageId } from '../helpers/hooks';
import { Trial } from '../types';
import { copyOnClick } from '../helpers/copy';


export interface TrialCardProps {
	trial: Trial;
}

export const TrialCard = (
	{
		trial,
	}: TrialCardProps,
) => {

	const t = useFormatMessageId();

	return (
		<section className="card package">

			<header className="card-heading">
				<h3 className="heading">#{trial.id} {trial.team.name}</h3>
			</header>

			<div className="card-content">
				Round: {trial.round}
				<br />{trial.state}
			</div>

			<div className="card-actions">
				<Link name={R_TRIAL} payload={{ trialId: trial.id }}>{t('trial.actions.detail')}</Link>
			</div>

		</section>
	);

};

export const CopyableCode = ({ children }) =>
	<code className="copyable-code" onClick={copyOnClick}>{children}</code>;
