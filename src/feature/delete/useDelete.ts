import type * as List from 'feature/list';
import type * as Delete from 'feature/delete';
import { produce } from 'immer';
import { useCallback, useLayoutEffect, useState } from 'react';

function toIndexMap<I, L extends { id: I }[]>(list: L): Map<I, number> {
  return list.reduce(
    (acc, { id }, index) => acc.set(id, index),
    new Map<I, number>(),
  );
}

const findIndexById = <I, A extends { id: I }>(arr: A[]) => {
  const maps = new WeakMap<A[], Map<I, number>>();
  if (!maps.has(arr)) {
    maps.set(arr, toIndexMap(arr));
  }
  return (id: I): number | undefined => {
    return maps.get(arr)?.get(id);
  };
};

function toDeleteEntry(list: List.Entry[]): Delete.Entry[] {
  return list.map((item) => ({ ...item, loading: false }));
}

const useDelete: Delete.UseDelete = function useDelete({
  delete: remove,
  list: outerList,
}) {
  const [list, setList] = useState<Delete.Entry[]>(() =>
    toDeleteEntry(outerList),
  );
  useLayoutEffect(() => {
    setList(toDeleteEntry(outerList));
  }, [outerList]);
  const onDelete: ReturnType<Delete.UseDelete>['onDelete'] = useCallback(
    (id) => {
      setList(
        produce(list, (draft) => {
          const index = findIndexById(list)(id);
          (draft[index ?? -1] ?? {}).loading = true;
        }),
      );
      remove(id)
        .then(toDeleteEntry)
        .then(setList)
        .catch((error) =>
          setList(
            produce((draft) => {
              const index = findIndexById(list)(id);
              Object.assign(draft[index ?? -1] ?? {}, {
                error,
                loading: false,
              });
            }),
          ),
        );
    },
    [list, remove],
  );
  return { list, onDelete };
};

export default useDelete;
