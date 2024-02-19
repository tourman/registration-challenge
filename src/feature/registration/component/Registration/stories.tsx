import { View } from 'feature/registration/types';
import Registration from '.';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import User from 'entity/user/user';
import UserValidator from 'entity/user/validator';
import ExternalUtilTime from 'util/time';

const meta: ComponentMeta<View> = {
  title: 'Registration',
  component: Registration,
  args: {
    name: { value: '', error: null },
    surname: { value: '', error: null },
    birthdate: { value: '', error: null },
    country: { value: '', error: null },
    user: new User(
      new UserValidator(
        async () => ({ pt: 'Portugal', es: 'Spain', fr: 'France' }),
        ExternalUtilTime
      )
    ),
    T: (key, placeholders?, countries?) => key,
    allowSubmit: false,
    submitting: true,
    error: new Error('General error'),
    done: { name: 'a', surname: 'b', birthdate: 'c', country: 'd' },
  },
  argTypes: {
    onSubmit: { action: 'SUBMIT' },
    onChange: { action: 'CHANGE' },
  },
};

export default meta;

export const Default: ComponentStory<View> = (args) => (
  <Registration {...args} />
);
