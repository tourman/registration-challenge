import { useEffect, useMemo, useState } from 'react';
import { UseList } from './types';

type FromLoader<L extends (...args: unknown[]) => Promise<unknown>> = Awaited<
  ReturnType<L>
>;

const useList: UseList = function useList({
  loadList,
  loadCountries,
  ...transit
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const defaultList: FromLoader<typeof loadList> = useMemo(() => [], []);
  const [list, setList] = useState(defaultList);
  const defaultCountries: FromLoader<typeof loadCountries> = useMemo(
    () => ({}),
    []
  );
  const [countries, setCountries] = useState(defaultCountries);
  useEffect(() => {
    Promise.all([loadList(), loadCountries()])
      .then(([list, countries]) => {
        setLoading(false);
        setList(list);
        setCountries(countries);
        setError(void 0);
      })
      .catch((error) => {
        setLoading(false);
        setList(defaultList);
        setCountries(defaultCountries);
        setError(error);
      });
  }, [loadList, defaultList, loadCountries, defaultCountries]);
  const result = { loading, error, list, countries, ...transit };
  console.log('result', result);
  return result;
};

export default useList;
