import type { InnerProps } from 'feature/list';
import type * as SUIR from 'semantic-ui-react';
import './style.css';

const emptyRender = () => <></>;

function List({
  loading,
  error,
  list,
  countries,
  T,
  Time,
  renderHeaderCell = emptyRender,
  renderBodyCell = emptyRender,

  Dimmer,
  Loader,
  Message,
  Table,
}: InnerProps & {
  Dimmer: typeof SUIR.Dimmer;
  Loader: typeof SUIR.Loader;
  Message: typeof SUIR.Message;
  Table: typeof SUIR.Table;
}) {
  return (
    <>
      <Dimmer active={loading} inverted>
        <Loader />
      </Dimmer>
      {error && <Message error content={error.message} />}
      {!!list.length && (
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{T('Name')}</Table.HeaderCell>
              <Table.HeaderCell>{T('Country')}</Table.HeaderCell>
              <Table.HeaderCell>{T('Birthdate')}</Table.HeaderCell>
              {renderHeaderCell()}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {list.map(({ id, name, surname, country, birthdate }, index) => (
              <Table.Row key={id}>
                <Table.Cell>
                  {name} {surname}
                </Table.Cell>
                <Table.Cell>{T(`country:${country}`, countries)}</Table.Cell>
                <Table.Cell>{Time.formatDate(birthdate)}</Table.Cell>
                {renderBodyCell(index)}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </>
  );
}

export default List;
