import Registration from '.';
import { ArgTypes, ComponentMeta, ComponentStory } from '@storybook/react';
import User from 'entity/user';
import UserValidator from 'entity/user/validator';
import ExternalUtilTime from 'util/time';
import 'semantic-ui-css/semantic.css';
import { ComponentType } from 'react';
import {
  Dropdown,
  Form,
  Input,
  Button,
  Grid,
  Message,
  Divider,
  Popup,
  Container,
} from 'semantic-ui-react';

type PropsFrom<C> = C extends ComponentType<infer P> ? P : never;

type Action = 'onSubmit' | 'onChange';

const defaultArgs: Omit<PropsFrom<typeof Registration>, Action> = {
  name: { value: '', error: null },
  surname: { value: '', error: null },
  birthdate: { value: '', error: null },
  country: { value: '', error: null },
  user: new User(
    new UserValidator(
      async () => ({ pt: 'Portugal', es: 'Spain', fr: 'France' }),
      ExternalUtilTime,
    ),
  ),
  T: (...args) => args[0],
  allowSubmit: false,
  submitting: true,
  error: new Error('General error'),
  done: { name: 'a', surname: 'b', birthdate: 'c', country: 'd' },
  countries: { fr: 'France', pt: 'Portugal' },
  lang: 'en',

  Dropdown,
  Form,
  Input,
  Button,
  Grid,
  Message,
  Divider,
  Popup,
  Container,
};

const argTypes: ArgTypes<Pick<PropsFrom<typeof Registration>, Action>> = {
  onSubmit: { action: 'SUBMIT' },
  onChange: { action: 'CHANGE' },
};

const meta: ComponentMeta<typeof Registration> = {
  title: 'Registration',
  component: Registration,
  args: defaultArgs,
  argTypes,
};

export default meta;

export const Default: ComponentStory<typeof Registration> = (args) => (
  <Registration {...args} />
);
