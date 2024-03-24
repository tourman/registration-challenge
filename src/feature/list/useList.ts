import { useEffect, useMemo, useState } from 'react';
import type { UseList } from 'feature/list';

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
    [],
  );
  const [countries, setCountries] = useState(defaultCountries);
  useEffect(() => {
    Promise.all([loadList(), loadCountries()])
      .then(([newList, newCountries]) => {
        setLoading(false);
        setList(newList);
        setCountries(newCountries);
        setError(void 0);
      })
      .catch((err) => {
        setLoading(false);
        setList(defaultList);
        setCountries(defaultCountries);
        setError(err);
      });
  }, [loadList, defaultList, loadCountries, defaultCountries]);
  const result = { loading, error, list, countries, ...transit };
  return result;
};

export default useList;
