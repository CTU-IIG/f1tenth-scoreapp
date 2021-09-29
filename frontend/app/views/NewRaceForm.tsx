"use strict";

import React, { ChangeEventHandler, FormEventHandler, useCallback, useState } from 'react';
import { Input, Option, SelectInput } from '../components/inputs';
import { CreateRaceData, RACE_TYPE_HEAD_TO_HEAD, RACE_TYPE_TIME_TRIAL, RaceType } from '../types';
import { Button } from '../components/common';
import { isDefined } from '../helpers/common';
import { useFormatMessageId } from '../helpers/hooks';


interface Field<T> {
	value: T | undefined;
	touched: boolean;
}

interface NewRaceFormState {
	type: Field<RaceType>;
	round: Field<number>;
	teamAId: Field<number>;
	teamBId: Field<number>;
	timeDuration: Field<number>;
	lapsDuration: Field<number>;
}

const RACE_TYPES: Option[] = [
	{ value: RACE_TYPE_TIME_TRIAL, label: `race.types.${RACE_TYPE_TIME_TRIAL}` },
	{ value: RACE_TYPE_HEAD_TO_HEAD, label: `race.types.${RACE_TYPE_HEAD_TO_HEAD}` },
];

const validateNewRaceForm = (state: NewRaceFormState): Map<string, string> => {

	const errors = new Map<string, string>();

	const { type, round, teamAId, teamBId, timeDuration, lapsDuration } = state;

	if (!isDefined(type.value)) {
		errors.set('type', 'forms.errors.fieldRequired');
	}

	if (!isDefined(teamAId.value)) {
		errors.set('teamAId', 'forms.errors.fieldRequired');
	}

	if (type.value === RACE_TYPE_TIME_TRIAL) {

		if (!isDefined(round.value)) {
			errors.set('round', 'forms.errors.fieldRequired');
		}

		if (isDefined(round.value) && (!Number.isInteger(round.value) || round.value <= 0)) {
			errors.set('round', 'forms.errors.invalidValue');
		}

		if (!isDefined(timeDuration.value)) {
			errors.set('timeDuration', 'forms.errors.fieldRequired');
		}

		if (isDefined(timeDuration.value) && (!Number.isInteger(timeDuration.value) || timeDuration.value < 0)) {
			errors.set('timeDuration', 'forms.errors.invalidValue');
		}

	}

	if (type.value === RACE_TYPE_HEAD_TO_HEAD) {

		if (!isDefined(teamBId.value)) {
			errors.set('teamBId', 'forms.errors.fieldRequired');
		}

		if (!isDefined(lapsDuration.value)) {
			errors.set('lapsDuration', 'forms.errors.fieldRequired');
		}

		if (isDefined(lapsDuration.value) && (!Number.isInteger(lapsDuration.value) || lapsDuration.value < 0)) {
			errors.set('lapsDuration', 'forms.errors.invalidValue');
		}

	}

	return errors;

};

export interface NewRaceFormProps {
	teams: Option[];
	onSubmit: (data: CreateRaceData) => void;
}

const NewRaceForm = ({ teams, onSubmit }: NewRaceFormProps) => {

	const t = useFormatMessageId();

	const [formState, setFormState] = useState<NewRaceFormState>(() => ({
		type: {
			value: RACE_TYPE_TIME_TRIAL,
			touched: false,
		},
		round: {
			value: 1,
			touched: false,
		},
		teamAId: {
			value: undefined,
			touched: false,
		},
		teamBId: {
			value: undefined,
			touched: false,
		},
		timeDuration: {
			value: 300000,
			touched: false,
		},
		lapsDuration: {
			value: 10,
			touched: false,
		},
	}));

	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>((event) => {
		event.preventDefault();

		const errors = validateNewRaceForm(formState);

		if (errors.size > 0) {
			if (isDefined(Object.values(formState).find(({ touched }) => !touched))) {
				setFormState(prevState => {

					const newState = { ...prevState };

					Object.keys(newState).forEach(key => {
						newState[key].touched = true;
					});

					return newState;

				});
			}
			return;
		}

		if (formState.type.value === RACE_TYPE_TIME_TRIAL) {
			onSubmit({
				type: RACE_TYPE_TIME_TRIAL,
				round: formState.round.value!,
				teamAId: formState.teamAId.value!,
				timeDuration: formState.timeDuration.value!,
			});
			return;
		}

		if (formState.type.value === RACE_TYPE_HEAD_TO_HEAD) {
			onSubmit({
				type: RACE_TYPE_HEAD_TO_HEAD,
				round: formState.round.value ?? 1, // TODO: round is deprecated for RACE_TYPE_HEAD_TO_HEAD
				teamAId: formState.teamAId.value!,
				teamBId: formState.teamBId.value!,
				lapsDuration: formState.lapsDuration.value!,
			});
			return;
		}

	}, [formState, onSubmit]);

	const handleInputChange = useCallback<ChangeEventHandler<HTMLInputElement | HTMLSelectElement>>((event) => {

		const name = event.currentTarget.name;
		let value: string | number | undefined = event.currentTarget.value === ''
			? undefined
			: event.currentTarget.value;

		if (value !== undefined && (
			name === 'round'
			|| name === 'teamAId'
			|| name === 'teamBId'
			|| name === 'timeDuration'
			|| name === 'lapsDuration'
		)
		) {
			value = parseInt(value);
			if (!Number.isInteger(value)) {
				return;
			}
		}

		setFormState(prevState => {

			const field = prevState[name];

			if (field.value == value && field.touched) {
				return prevState;
			}

			const newState = { ...prevState };

			newState[name].value = value;
			newState[name].touched = true;

			return newState;

		});

	}, [setFormState]);

	const errors = validateNewRaceForm(formState);

	return (
		<form
			name="newRace"
			onSubmit={handleSubmit}
		>

			<SelectInput
				id="newRace--type"
				label="newRaceForm.labels.type"
				name="type"
				prompt="forms.prompt"
				options={RACE_TYPES}
				value={formState.type.value ?? ''}
				onChange={handleInputChange}
				valid={!formState.type.touched || !isDefined(errors.get('type'))}
				error={formState.type.touched ? errors.get('type') : undefined}
			/>

			{formState.type.value === RACE_TYPE_TIME_TRIAL && (
				<Input
					type="number"
					id="newRace--round"
					label="newRaceForm.labels.round"
					name="round"
					value={formState.round.value ?? ''}
					onChange={handleInputChange}
					valid={!formState.round.touched || !isDefined(errors.get('round'))}
					error={formState.round.touched ? errors.get('round') : undefined}
				/>
			)}

			{formState.type.value === RACE_TYPE_TIME_TRIAL && (
				<Input
					type="number"
					id="newRace--timeDuration"
					label="newRaceForm.labels.timeDuration"
					name="timeDuration"
					value={formState.timeDuration.value ?? ''}
					onChange={handleInputChange}
					valid={!formState.timeDuration.touched || !isDefined(errors.get('timeDuration'))}
					error={formState.timeDuration.touched ? errors.get('timeDuration') : undefined}
					helpBlock={<p className="help-block">{t('newRaceForm.timeDurationNote')}</p>}
				/>
			)}

			{formState.type.value === RACE_TYPE_HEAD_TO_HEAD && (
				<Input
					type="number"
					id="newRace--lapsDuration"
					label="newRaceForm.labels.lapsDuration"
					name="lapsDuration"
					value={formState.lapsDuration.value ?? ''}
					onChange={handleInputChange}
					valid={!formState.lapsDuration.touched || !isDefined(errors.get('lapsDuration'))}
					error={formState.lapsDuration.touched ? errors.get('lapsDuration') : undefined}
				/>
			)}

			<SelectInput
				id="newRace--teamAId"
				label={
					formState.type.value === RACE_TYPE_TIME_TRIAL
						? "newRaceForm.labels.team" : "newRaceForm.labels.teamA"
				}
				name="teamAId"
				prompt="forms.prompt"
				translateOptionsLabels={false}
				options={teams}
				value={formState.teamAId.value ?? ''}
				onChange={handleInputChange}
				valid={!formState.teamAId.touched || !isDefined(errors.get('teamAId'))}
				error={formState.teamAId.touched ? errors.get('teamAId') : undefined}
			/>

			{formState.type.value === RACE_TYPE_HEAD_TO_HEAD && (
				<SelectInput
					id="newRace--teamBId"
					label="newRaceForm.labels.teamB"
					name="teamBId"
					prompt="forms.prompt"
					translateOptionsLabels={false}
					options={teams}
					value={formState.teamBId.value ?? ''}
					onChange={handleInputChange}
					valid={!formState.teamBId.touched || !isDefined(errors.get('teamBId'))}
					error={formState.teamBId.touched ? errors.get('teamBId') : undefined}
				/>
			)}

			<div className="btn-group">
				<Button
					label="forms.send"
					style="primary"
					type="submit"
				/>
			</div>

		</form>
	);

};

export default NewRaceForm;
