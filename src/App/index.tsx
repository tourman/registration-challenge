import { ComponentType, ReactElement } from 'react';
import { Container, Header, Segment } from 'semantic-ui-react';
import './styles.css';

const App: ComponentType<{ children: () => ReactElement }> = function App({
  children,
}) {
  return (
    <>
      <Header as="h1" content="Registration Challenge" textAlign="center" />
      <Container text>
        <Segment>{children()}</Segment>
      </Container>
    </>
  );
};

export default App;
