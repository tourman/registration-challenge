import { ComponentType } from 'react';
import { OuterProps, UseRegistration, View } from './types';

const Registration: ComponentType<
  OuterProps & { useRegistration: UseRegistration; Component: View }
> = function Registration({ useRegistration, Component, ...outerProps }) {
  const innerProps = useRegistration(outerProps);
  return <Component {...innerProps} />;
};

export default Registration;
