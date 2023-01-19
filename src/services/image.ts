import i18next from 'i18next';
import { config } from '../common/config/config';
import { FetchError, FetchOptions, FetchResponse, Headers } from '../types/fetch.type';
import { buildUrl } from '../utils/url.util';
import { getToken, validateStatus } from './fetch';

const getDefaultHeaders = (token: string | null): Headers => {
	return {
		Accept: 'image/png',
		'Content-Type': 'image/png;charset=UTF-8',
		'Accept-Language': i18next.language,
		Authorization: token ? `Bearer ${token}` : '',
	};
};

const parseData = async (response: Response): Promise<string | undefined> => {
	if (!validateStatus(response.status)) {
		const error: FetchError = {
			reason: `request failed with status ${response.status}`,
			status: response.status,
			message: response.statusText,
		};
		throw error;
	}
	try {
		const img = URL.createObjectURL(await response.blob());
		return img;
	} catch {
		return void 0;
	}
};

export const image = async (endpoint: string, options?: FetchOptions): Promise<FetchResponse<string | undefined>> => {
	const url = buildUrl(endpoint, options?.params);
	const token = getToken();

	const defaultHeaders = getDefaultHeaders(token);
	const otherHeaders = options?.headers ?? {};
	const combinedHeaders = { ...defaultHeaders, ...otherHeaders };

	if (config.stage === 'localhost') {
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	const response = await window.fetch(url, {
		method: 'GET',
		headers: combinedHeaders,
		signal: options?.signal,
	});
	const data = await parseData(response);

	const status = response.status;
	const statusText = response.statusText;

	return { status, statusText, data: data };
};
