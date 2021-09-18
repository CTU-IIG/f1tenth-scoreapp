"use strict";

import { isDefined } from './common';

export const METHOD_GET = 'GET';
export const METHOD_POST = 'POST';
export const CONTENT_TYPE_JSON = 'application/json';

export type DoRequestOptions = Omit<RequestInit, 'body'> & {
	token?: string;
	body?: any;
	returnUndefinedForNotFoundError?: boolean;
}

export type DoRequestError = {
	code: string;
	message: string;
	status?: number;
}

export type ApiError = {
	code?: string;
	message?: string;
};

/**
 * A simple wrapper around `fetch` that simplifies working with a JSON-based REST APIs
 * with a standardized error handling.
 */
export const doRequest = async <ResponseType>(
	url: RequestInfo,
	options: DoRequestOptions = {},
): Promise<ResponseType> => {

	const { headers, token, body, returnUndefinedForNotFoundError = false, ...otherOptions } = options;

	let response: Response;

	try {
		response = await fetch(
			url,
			{
				...otherOptions,
				headers: {
					...headers,
					'Accept': CONTENT_TYPE_JSON,
					...isDefined(token) && { 'Authorization': `Bearer ${token}` },
					...isDefined(body) && { 'Content-Type': CONTENT_TYPE_JSON },
				},
				...isDefined(body) && { body: JSON.stringify(body) },
			},
		);
	} catch (err) {

		console.error('doRequest: fetch_failed', url, err);

		throw {
			code: 'fetch_failed',
			message: `The request failed. Possibly due to a network error.`,
		};

	}

	if (response.body === null) {
		console.log('doRequest: empty response body', url);
		if (!response.ok) {
			throw {
				code: 'unknown_error',
				message: `Response status is ${response.status}`,
				status: response.status,
			};
		}
		// we suppose that in such cases
		// undefined is part of the ResponseType
		return undefined as any;
	}

	let data: ResponseType | ApiError;

	try {
		data = await response.json();
	} catch (err) {
		console.error('doRequest: parse_error', url, err);
		throw {
			code: 'parse_error',
			message: `An error occurred while parsing JSON: ${err.message}. Content-Type: ${response.headers.get('Content-Type')}`,
			status: response.status,
		};
	}

	if (returnUndefinedForNotFoundError && response.status === 404) {
		// we suppose that if returnUndefinedForNotFoundError === true,
		// undefined is part of the ResponseType
		return undefined as any;
	}

	if (!response.ok) {
		const err = data as ApiError; // implied by an unsuccessful response
		throw {
			code: err?.code ?? 'unknown_error',
			message: err?.message ?? `Response status is ${response.status}`,
			status: response.status,
		};
	}

	// ResponseType implied by an successful response (we trust the server adheres to the agreed API schema)
	// We could validate the data against the schema to be sure that an invalid response does not break the app.
	return data as ResponseType;

};
