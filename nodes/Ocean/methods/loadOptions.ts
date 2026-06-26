import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { oceanApiRequest } from '../GenericFunctions';
import { countriesFromDataFields, industriesFromDataFields } from '../OceanDataFields';
import { getStaticCountryOptions } from '../OceanCountries';

export const loadOptions = {
	async getCountries(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const data = await oceanApiRequest.call(this, 'GET', '/v2/data-fields');
			const options = countriesFromDataFields(data);
			if (options.length > 0) {
				return options;
			}
		} catch {
			// Fall back to static ISO list when credentials are missing or the API is unavailable.
		}

		return getStaticCountryOptions();
	},

	async getIndustries(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const data = await oceanApiRequest.call(this, 'GET', '/v2/data-fields');
			return industriesFromDataFields(data);
		} catch {
			return [];
		}
	},
};
