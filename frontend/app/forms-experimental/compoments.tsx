"use strict";

import React, { useEffect, useRef } from 'react';

import { OnSubmitHandler } from './common';
import FormContext, { FormContextShape } from './FormContext';
import FormController from './FormController';
import { IS_DEVELOPMENT } from '../helpers/common';


export interface FormProps<DataShape>
	extends Omit<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'onSubmit'> {
	name: string;
	initialValues?: DataShape;
	onSubmit: OnSubmitHandler<DataShape>;
	nativeErrorReporting?: boolean; // TODO: add support to FormController
}

export const Form = <DataShape extends any>(
	{
		name,
		initialValues,
		onSubmit,
		nativeErrorReporting = false,
		children,
		...otherProps
	}: FormProps<DataShape>,
) => {

	const contextRef = useRef<FormContextShape<DataShape> | null>(null);

	if (contextRef.current === null) {
		contextRef.current = {
			controller: new FormController<DataShape>({
				name,
				initialValues,
				onSubmit,
			}),
			sectionPrefix: '',
		};
	}

	// this is safe to be changed during render
	contextRef.current.controller.onSubmit = onSubmit;

	IS_DEVELOPMENT && console.log(`[Form] rendering`, name);

	useEffect(() => {

		IS_DEVELOPMENT && console.log(`[Form] applying changes to the controller (name, initialValues)`, name);

		if (contextRef.current !== null) {
			contextRef.current.controller.name = name;
			contextRef.current.controller.initialValues = initialValues;
		}

		return () => {
			IS_DEVELOPMENT && console.log(`[Form] useEffect:cleanup`, name);
		};

	}, [name, initialValues]);

	return (
		<FormContext.Provider value={contextRef.current}>
			<form
				name={name}
				noValidate={!nativeErrorReporting}
				onSubmit={contextRef.current.controller.formSubmitHandler}
				onReset={contextRef.current.controller.formResetHandler}
				{...otherProps}
			>
				{children}
			</form>
		</FormContext.Provider>
	);

};
