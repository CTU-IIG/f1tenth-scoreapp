"use strict";

import React from 'react';
import { Link } from '../router/compoments';
import { R_TRIAL } from '../routes';
import { useFormatMessageId } from '../helpers/hooks';
import { Trial } from '../types';


export interface TrialCardProps {
	trial: Trial;
}

export const TrialCard = (
	{
		trial: {
			id,
			name,
		},
	}: TrialCardProps,
) => {

	const t = useFormatMessageId();

	return (
		<section className="card package">

			<header className="card-heading">
				<h3 className="heading">{name}</h3>
			</header>

			<div className="card-actions">
				<Link name={R_TRIAL} payload={{ trialId: id }}>{t('trial.actions.detail')}</Link>
			</div>

		</section>
	);

};
