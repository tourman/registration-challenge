import { memoize } from 'lodash-es';
import {
  ComponentType,
  ReactElement,
  ReactNode,
  useDeferredValue,
  useLayoutEffect,
  useState,
} from 'react';

export type TranslateArgs<L extends string> = [`lang:${L}`];

interface Translate<L extends string> {
  (...args: TranslateArgs<L>): string;
}

export type View<L extends string> = ComponentType<{
  loading: boolean;
  error?: unknown;
  lang: L;
  languages: L[];
  onChange: (lang: L) => void;
  T?: Translate<L>;
}>;

interface Unsubscribe {
  (): void;
}

interface Subscription<T> {
  subscribe(subscriber: {
    next: (value: T) => void;
    error: (error: unknown) => void;
    finally: () => void;
  }): Unsubscribe;
}

interface Observable {
  <T>(p: Promise<T>): Subscription<T>;
}

function languageFactory<L extends string, T extends Translate<L>>(
  tFactories: Record<L, () => Promise<T>>,
): ComponentType<{
  children: (props: {
    renderSwitch: () => ReactNode;
    T?: T;
    lang: L;
  }) => ReactElement;
  defaultLang: L;
  Component: View<L>;
  from: Observable;
}> {
  const languages = Object.keys(tFactories) as L[];
  const loadT = memoize((lang: L) => tFactories[lang]());
  return function Language({ children, defaultLang, Component, from }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>();
    const [lang, setLang] = useState(defaultLang);
    const [payload, setTranslate] = useState<{ T?: T; lang: L }>({
      lang: defaultLang,
    });
    useLayoutEffect(() => {
      if (error) {
        return;
      }
      setLoading(true);
      return from(loadT(lang)).subscribe({
        next: (t) => setTranslate({ T: t, lang }),
        error: (e) => setError(() => e),
        finally: () => setLoading(false),
      });
    }, [from, lang, error]);
    const deferredPayload = useDeferredValue(payload);
    return children({
      renderSwitch: () => (
        <Component
          {...{
            loading,
            error,
            lang,
            languages,
            onChange: setLang,
            T: payload.T,
          }}
        />
      ),
      ...deferredPayload,
    });
  };
}

export default languageFactory;
