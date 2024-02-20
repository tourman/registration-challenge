import { ComponentType, ReactElement } from 'react';

const App: ComponentType<{ children: () => ReactElement }> = function App({
  children,
}) {
  return children();
};

export default App;
