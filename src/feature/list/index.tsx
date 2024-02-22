import { ComponentType } from 'react';
import { OuterProps, UseList, View } from './types';

const List: ComponentType<OuterProps & { Component: View; useList: UseList }> =
  function List({ Component, useList, ...outerProps }) {
    const innerProps = useList(outerProps);
    return <Component {...innerProps} />;
  };

export default List;
