import React from 'react';

type Error = any | undefined;
type Rule = [Error, (value: any) => boolean];

interface FormScheme extends Record<string, {
  value: any
  rules?: Array<Rule>
}> {}

type FormData<T> = Record<keyof T, {
  value: any
  error: Error
  onChange: (event: any) => void
}>;

type FormComponent<T, R> = React.ComponentType<R & { data: FormData<T> }>

export const createFormScheme = <T extends FormScheme>(scheme: T) => scheme;

export const withFormData = <T extends FormScheme, R = {}>(schemeFactory: (props: R) => T) => 
  (Component: FormComponent<T, R>) => (props: R) => {

  const [scheme] = React.useState(schemeFactory(props));

  const [rules] = React.useState(Object.keys(scheme).reduce(
    (acc, key) => Object.assign(acc, { [key]: scheme[key].rules || [] }),
    {} as Record<keyof T, Array<Rule>>,
  ));

  const validate = React.useCallback(
    (key: string, value: any) => rules[key].find(rule => rule[1](value))?.[0], [rules],
  );

  const onChange = React.useCallback(
    (key: string) => (event: any) => {
      const value = getElementValue(event.target);
      const error = validate(key, value);
      setData(prev => ({ ...prev, [key]: { ...prev[key], value, error } }));
    }, [validate],
  );

  const [data, setData] = React.useState(Object.keys(scheme).reduce(
    (acc, key) => Object.assign(acc, { [key]: {
      value: scheme[key].value ?? '',
      error: validate(key, scheme[key].value),
      onChange: onChange(key),
    }}), {} as FormData<T>,
  ));

  return React.createElement(Component, { ...props, data });
};

const getElementValue = (input: HTMLInputElement) => {
  switch (input.type) {
    case 'checkbox': return getCheckboxValue(input);
    case 'radio': return getRadioValue(input);
    default: return input.value;
  }
};

const getCheckboxValue = (input: HTMLInputElement) => {
  if (!input.name) return input.checked;
  return getElementsByName(input.name)
    .filter(element => element.checked)
    .map(element => element.value);
};

const getRadioValue = (input: HTMLInputElement) => {
  if (!input.name) return input.checked;
  return getElementsByName(input.name)
    .find(element => element.checked)
    ?.value;
};

const getElementsByName = (name: string) => {
  return Array.from(document.getElementsByName(name)) as HTMLInputElement[];
};
