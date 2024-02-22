import { View } from 'feature/list/types';
import { Dimmer, Loader, Message, Table } from 'semantic-ui-react';
import './style.css';

const List: View = function List({ loading, error, list, countries, T, Time }) {
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
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {list.map(({ id, name, surname, country, birthdate }) => (
              <Table.Row key={id}>
                <Table.Cell>
                  {name} {surname}
                </Table.Cell>
                <Table.Cell>{T(`country:${country}`, countries)}</Table.Cell>
                <Table.Cell>{Time.formatDate(birthdate)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </>
  );
};

export default List;
