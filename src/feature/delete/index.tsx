import { ComponentType } from 'react';
import type * as List from 'feature/list';

export type Entry = List.Entry & { loading: boolean; error?: unknown };

export interface Delete {
  (id: List.ID): Promise<List.Entry[]>;
}

interface StorageProps {
  delete: Delete;
}

interface OuterProps extends StorageProps, List.InnerProps {}

interface InnerProps {
  list: Entry[];
  onDelete: (id: List.ID) => void;
}

export interface UseDelete {
  (props: OuterProps): InnerProps;
}

export type View = ComponentType<List.InnerProps & InnerProps>;

function deleteFactory({
  useDelete,
}: {
  useDelete: UseDelete;
}): ComponentType<OuterProps & { Component: View }> {
  return function Delete({ Component, ...outerProps }) {
    const innerProps = useDelete(outerProps);
    return <Component {...outerProps} {...innerProps} />;
  };
}

export default deleteFactory;
