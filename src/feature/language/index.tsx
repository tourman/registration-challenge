import { memoize } from 'lodash-es';
import {
  ComponentType,
  ReactElement,
  ReactNode,
  useCallback,
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
    const [translate, setTranslate] = useState<T>();
    const onChange = useCallback<typeof setLang>((newLang) => {
      setLoading(true);
      setLang(newLang);
    }, []);
    useLayoutEffect(() => {
      if (error) {
        return;
      }
      return from(loadT(lang)).subscribe({
        next: (t) => setTranslate(() => t),
        error: (e) => setError(() => e),
        finally: () => setLoading(false),
      });
    }, [from, lang, error]);
    const deferredT = useDeferredValue(translate);
    return children({
      renderSwitch: () => (
        <Component
          {...{
            loading,
            error,
            lang,
            languages,
            onChange,
            T: translate,
          }}
        />
      ),
      T: deferredT,
      lang,
    });
  };
}

export default languageFactory;
