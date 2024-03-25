import type * as DeleteTypes from 'feature/delete';
import type * as ListTypes from 'feature/list';
import { ComponentType, useCallback } from 'react';
import type * as SUIR from 'semantic-ui-react';

type PropsFrom<C> = C extends ComponentType<infer P> ? P : never;

function Delete<P extends PropsFrom<ListTypes.View>>(
  props: PropsFrom<DeleteTypes.View> &
    P & {
      List: ComponentType<P>;
      Table: Pick<typeof SUIR.Table, 'Cell' | 'HeaderCell'>;
      Button: typeof SUIR.Button;
    },
) {
  const {
    list,
    onDelete,

    List,
    Button,
    Table: { HeaderCell: TableHeaderCell, Cell: TableCell },
  } = props;
  const render: Required<
    Pick<PropsFrom<ListTypes.View>, 'renderBodyCell' | 'renderHeaderCell'>
  > = {
    renderHeaderCell: useCallback(
      () => <TableHeaderCell collapsing />,
      [TableHeaderCell],
    ),
    renderBodyCell: useCallback(
      (index) => {
        const { id, loading } = list[index];
        return (
          <TableCell collapsing>
            <Button
              disabled={loading}
              loading={loading}
              icon="close"
              color="red"
              onClick={() => onDelete(id)}
            />
          </TableCell>
        );
      },
      [list, onDelete, TableCell, Button],
    ),
  };
  return <List {...props} {...render} />;
}

export default Delete;
