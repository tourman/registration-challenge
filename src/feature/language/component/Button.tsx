import type { View } from 'feature/language';
import type * as SUIR from 'semantic-ui-react';
import { PropsFrom } from 'util/type';

const buttonFactory = <L extends string>() => {
  function ButtonSwitch({
    loading,
    error,
    lang,
    T,
    languages,
    onChange,

    Button,
    Icon,
  }: PropsFrom<View<L>> & {
    Button: typeof SUIR.Button;
    Icon: typeof SUIR.Icon;
  }) {
    const innerError = error || languages.length > 2;
    if (languages.length < 2) {
      return null;
    }
    const common: SUIR.ButtonProps = { floated: 'right' };
    if (innerError) {
      return (
        <Button {...common} icon color="red" disabled>
          <Icon name="ban" />
        </Button>
      );
    }
    if (loading || !T) {
      return (
        <Button {...common} loading disabled>
          XX
        </Button>
      );
    }
    return (
      <Button
        {...common}
        animated="vertical"
        onClick={() =>
          onChange(lang === languages[0] ? languages[1] : languages[0])
        }
      >
        {languages.map((language) => (
          <Button.Content
            key={language}
            hidden={language !== lang}
            visible={language === lang}
          >
            {T(`lang:${language}`)}
          </Button.Content>
        ))}
      </Button>
    );
  }
  return ButtonSwitch;
};
