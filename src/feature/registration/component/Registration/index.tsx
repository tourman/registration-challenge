import type { Key } from 'entity/user';
import type { InnerProps } from 'feature/registration';
import {
  ComponentType,
  Ref,
  ReactElement,
  FunctionComponent,
  useMemo,
  createContext,
  useContext,
  memo,
} from 'react';
import type * as SUIR from 'semantic-ui-react';
import { shallowEqual } from 'shallow-equal';
import './style.css';
import invariant from 'invariant';

type PropsFrom<C> = C extends ComponentType<infer P>
  ? P
  : C extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[C]
  : never;

const Context = createContext<Pick<typeof SUIR.Form, 'Field'> | null>(null);

function FormField<C>(
  props: SUIR.FormFieldProps & {
    control: C;
    fieldRef?: Ref<HTMLElement>;
  } & PropsFrom<C>,
) {
  const Form = useContext(Context);
  invariant(Form, 'Form is not defined');
  const { fieldRef: ref, ...rest } = props;
  return <Form.Field {...rest} ref={ref} />;
}

const idPrefix = 'registration';

type FieldProps<K extends Key> = {
  name: K;
  children: (props: {
    id: string;
    value: string;
    error: boolean;
    label: string;
    handleChange: (value: string) => void;
    disabled: boolean;
  }) => ReactElement;
  fields: Pick<InnerProps, Key>;
  submitting: boolean;
  dependency?: unknown;
} & Pick<InnerProps, 'onChange' | 'T'>;

function extractToCompare<K extends Key>(props: FieldProps<K>) {
  const { name, fields, submitting, onChange, T, dependency } = props;
  const value = fields[name];
  return { name, value, submitting, onChange, T, dependency };
}

const Field = memo(
  function Field<K extends Key>(
    props: FieldProps<K>,
  ): ReturnType<FunctionComponent> {
    const { name, children, fields, onChange, T, submitting } = props;
    const { value, error } = fields[name];
    return children({
      id: `${idPrefix}-${name}`,
      value,
      error: !!error,
      label: error ? T(`error:${error}`) : T(`label:${name}`),
      handleChange: (change) => onChange({ [name]: change }),
      disabled: submitting,
    });
  },
  (prev, next) => shallowEqual(extractToCompare(prev), extractToCompare(next)),
);

Field.displayName = 'MemoizedField';

function Registration({
  done,
  user,
  T,
  lang,
  allowSubmit,
  submitting,
  error,
  onSubmit,
  onChange,
  countries,

  Dropdown,
  Form,
  Input,
  Button,
  Grid,
  Message,
  Divider,
  Popup,
  Container,

  ...fields
}: InnerProps & {
  // In fact it would be better to follow ISP but it requires more efforts
  Dropdown: typeof SUIR.Dropdown;
  Form: typeof SUIR.Form;
  Input: typeof SUIR.Input;
  Button: typeof SUIR.Button;
  Grid: typeof SUIR.Grid;
  Message: typeof SUIR.Message;
  Divider: typeof SUIR.Divider;
  Popup: typeof SUIR.Popup extends ComponentType<infer C>
    ? ComponentType<C>
    : never;
  Container: typeof SUIR.Container;
}) {
  const countryOptions = useMemo(
    () =>
      Object.keys(countries ?? {})
        .map((key) => ({
          key,
          value: key,
          text: T(`country:${key}`),
        }))
        .sort(({ text: a }, { text: b }) =>
          a.localeCompare(b, lang, { sensitivity: 'base' }),
        ),
    [countries, T, lang],
  );
  const fieldProps = { fields, onChange, T, submitting };
  return (
    <Context.Provider value={Form}>
      <Form onSubmit={onSubmit} error={!!error} success={!!done}>
        <Field name="name" {...fieldProps}>
          {({ handleChange, ...props }) => (
            <FormField
              {...props}
              control={Input}
              placeholder={T('Enter your first name')}
              onChange={(_, { value }) => handleChange(value)}
            />
          )}
        </Field>
        <Field name="surname" {...fieldProps}>
          {({ handleChange, ...props }) => (
            <FormField
              {...props}
              control={Input}
              placeholder={T('Enter your second name')}
              onChange={(_, { value }) => handleChange(value)}
            />
          )}
        </Field>
        <Field name="birthdate" {...fieldProps}>
          {({ handleChange, ...props }) => (
            <FormField
              {...props}
              control={'input' as const}
              type="date"
              max={user.validator.getMaxDate()}
              min={user.validator.getMinDate()}
              placeholder={T('Enter your first name')}
              onChange={({ target: { value } }) => handleChange(value)}
            />
          )}
        </Field>
        <Field name="country" {...fieldProps} dependency={countryOptions}>
          {({ handleChange, disabled, ...props }) => (
            <FormField
              {...props}
              control={Dropdown}
              fluid
              search
              selection
              closeOnChange
              options={countryOptions}
              loading={!countryOptions.length}
              disabled={disabled || !countryOptions.length}
              placeholder={T('Choose your country')}
              onChange={(_, { value }) => handleChange(value?.toString() ?? '')}
            />
          )}
        </Field>
        <Divider />
        <Grid>
          <Grid.Row>
            <Grid.Column width={5}>
              {useMemo(
                () => (
                  <Popup
                    disabled={allowSubmit}
                    size="small"
                    on="hover"
                    position="right center"
                    trigger={
                      <Container>
                        <Button
                          loading={submitting}
                          type="submit"
                          disabled={!allowSubmit}
                          fluid
                          size="big"
                          color={error ? 'red' : 'blue'}
                        >
                          {T('Save')}
                        </Button>
                      </Container>
                    }
                    content={T(
                      'Please fill out the form correctly before submitting',
                    )}
                  />
                ),
                [Button, Container, Popup, T, allowSubmit, error, submitting],
              )}
            </Grid.Column>
            <Grid.Column width={11}>
              {error && <Message error content={error.toString()} />}
              {done && <Message success content={T('done', done)} />}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Context.Provider>
  );
}

export default Registration;
