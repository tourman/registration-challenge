import { CountryMap, Key } from 'entity/user/types';
import { InnerProps, View } from 'feature/registration/types';
import {
  ComponentType,
  useEffect,
  useState,
  Ref,
  ReactElement,
  FunctionComponent,
  memo,
} from 'react';
import 'semantic-ui-css/semantic.min.css';
import {
  Dropdown,
  Form,
  FormField as DefaultFormField,
  Input,
  DropdownItemProps,
  Button,
  StrictFormFieldProps,
  Grid,
  Message,
  Divider,
  Popup,
  Container,
} from 'semantic-ui-react';
import { shallowEqual } from 'shallow-equal';
import './style.css';

type PropsFrom<C> = C extends ComponentType<infer P>
  ? P
  : C extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[C]
  : never;

function FormField<C>(
  props: StrictFormFieldProps & {
    control: C;
    fieldRef?: Ref<HTMLElement>;
  } & PropsFrom<C>
) {
  const { fieldRef: ref, ...rest } = props;
  return <DefaultFormField {...rest} ref={ref} />;
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
    props: FieldProps<K>
  ): ReturnType<FunctionComponent> {
    const { name, children, fields, onChange, T, submitting } = props;
    const { value, error } = fields[name];
    return children({
      id: `${idPrefix}-${name}`,
      value,
      error: !!error,
      label: error ? T(`error:${error}`) : T(`label:${name}`),
      handleChange: (value) => onChange({ [name]: value }),
      disabled: submitting,
    });
  },
  (prev, next) => shallowEqual(extractToCompare(prev), extractToCompare(next))
);

Field.displayName = 'MemoizedField';

const Registration: View = function Registration({
  done,
  user,
  T,
  allowSubmit,
  submitting,
  error,
  onSubmit,
  onChange,
  registerSecondaryTask,
  ...fields
}) {
  const [countries, setCountries] = useState<CountryMap>({});
  const [countryOptions, setCountryOptions] = useState<DropdownItemProps[]>([]);
  const { loadCountries } = user.validator;
  useEffect(() => {
    loadCountries().then((countries) =>
      registerSecondaryTask(() => {
        setCountries(countries);
        setCountryOptions(
          Object.keys(countries)
            .map((key) => ({
              key,
              value: key,
              text: T(`country:${key}`, countries),
            }))
            .sort(({ text: a }, { text: b }) => (a < b ? -1 : 1))
        );
      })
    );
  }, [loadCountries, T, registerSecondaryTask]);
  const fieldProps = { fields, onChange, T, submitting };
  return (
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
                'Please fill out the form correctly before submitting'
              )}
            />
          </Grid.Column>
          <Grid.Column width={11}>
            {error && <Message error content={error.toString()} />}
            {done && <Message success content={T('done', done, countries)} />}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form>
  );
};

export default Registration;
