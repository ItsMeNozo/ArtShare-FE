import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

/**
 * A custom hook to safely get and parse a numeric URL parameter.
 * @param paramName The name of the parameter in the route (e.g., 'projectId').
 * @returns The parsed number, or `undefined` if the param is missing or not a valid number.
 */
export const useNumericParam = (paramName: string): number | undefined => {
  const params = useParams();
  const paramValue = params[paramName];

  // useMemo ensures this parsing logic only re-runs when the param value changes.
  return useMemo(() => {
    if (paramValue === undefined) {
      return undefined;
    }
    const numericValue = parseInt(paramValue, 10);
    return isNaN(numericValue) ? undefined : numericValue;
  }, [paramValue]);
};
