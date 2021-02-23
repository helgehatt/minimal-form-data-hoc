import React from 'react';

type Error = any | undefined;
type Rule = Readonly<[Error, (value: any) => boolean]>;

interface FormSchemeItem {
  value: any
  rules?: Readonly<Array<Rule>>
}

interface FormDataItem {
  value: any
  error: Error
  onChange: (event: any) => void
}

type FormScheme = Readonly<Record<string, Readonly<FormSchemeItem>>>;
type FormData<T> = Readonly<Record<keyof T, Readonly<FormDataItem>>>;
type FormComponent<T, R> = React.ComponentType<R & FormData<T>>

const createFormScheme = <T extends FormScheme, R = {}>(schemeConstructor: (props: R) => T) => schemeConstructor;

const withFormData = <T extends FormScheme, R = {}>(schemeConstructor: (props: R) => T) => 
  (Component: FormComponent<T, R>) => (props: R) => {

  const [scheme] = React.useState(schemeConstructor(props));

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
      value: scheme[key].value,
      error: validate(key, scheme[key].value),
      onChange: onChange(key),
    }}), {} as FormData<T>,
  ));

  return React.createElement(Component, { ...props, ...data });
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

const miniform = {
  createFormScheme,
  withFormData,
};

export default miniform;
