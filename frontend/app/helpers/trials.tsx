"use strict";

import React, { useMemo } from 'react';
import { useQuery } from './data';
import { findOneTrialById } from './queries';
import { useLiveTrialData } from '../ws/hooks';


export const useTrialData = (id: number) => {

	const latestData = useLiveTrialData(id);

	const query = useMemo(() => findOneTrialById(id), [id]);
	const op = useQuery(query);

	if (!op.loading && !op.hasError && op.data !== undefined) {
		// TODO: Which data are the latest?
		return {
			...op,
			data: latestData ?? op.data, // here we suppose that data from WS are latest
		};
	}

	return op;

};
