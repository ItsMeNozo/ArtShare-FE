import qs from 'qs';

export const getQueryParams = <T extends object>(params: T): string => {
  return qs.stringify(params, {
    addQueryPrefix: true,
    skipNulls: true,
    arrayFormat: 'comma',
  });
};
