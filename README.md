# minimal-form-data-hoc (aka. miniform)

This package exposes a minimalistic higher-order React component for typed form data.
The implementation consists of <50 lines of code, with a key focus on simplicity.
You are encouraged to copy and modify the source directly if the component does not fit your exact needs.

## Installation

The package is available in the npm registry.
Install using your favorite package manager, e.g.

```
npm install minimal-form-data-hoc
```

## Usage

The higher-order component is used by first defining a form scheme with the following structure:

```typescript
import miniform from 'minimal-form-data-hoc';

const scheme = miniform.createFormScheme(() => ({
  username: {
    value: 'Initial value',
    rules: [
      ['Please fill required value', (value: string) => !value],
      ['Input too short', (value: string) => value.length < 5],
    ],
  },
}));
```

The scheme is then passed on to the `withFormData` HOC and used to construct the initial state of the form data.
Note that the `createFormScheme` method is simply a typed identity function to help define schemes with correct type.
Each property in the scheme is mapped to an object with a `value`, an `error` (if any of the validation rules return true) and an `onChange` method used to update the state of the form data.
The following shows a minimal example with a single text field:

```typescript
const LoginForm = miniform.withFormData(scheme)(props => {
  return (
    <form>
      Username: <input value={props.username.value} onChange={props.username.onChange} />
      <span>{props.username.error}</span>
    </form>
  );
});
```

### Dynamic initial values and typed props

Note that the `withFormData` higher-order component's first argument is in fact a function.
This function's input argument is the wrapped component's props which can be used to provide dynamic initial values.
Consider the following example:

```typescript
interface IProps {
  user: {
    name: string
  }
}

const scheme = miniform.createFormScheme((props: IProps) => ({
  username: { value: props.user.name },
}));

const LoginForm = miniform.withFormData(scheme)(props => {
  ...
});
```

This allows us to use the component's props for initial values. Furthermore, by providing a type for the input argument, the props in the wrapped component is also correctly typed.

## Examples

---

### Text fields

Username:  
\____________

Password:  
\____________

<details>
<summary>View source</summary>

Text fields simply pass on the values from the form data.

```typescript
const scheme = miniform.createFormScheme(() => ({
  username: { value: '' },
  password: { value: '' },
}));

const InputForm = miniform.withFormData(scheme)(props => {
  return (
    <form>
      Username:<br/><input value={props.username.value} onChange={props.username.onChange} /><br/>
      Password:<br/><input value={props.password.value} onChange={props.password.onChange} />
    </form>
  );
});

export default InputForm;
```

</details>

---

### Standalone checkbox

:ballot_box_with_check: Checkbox

<details>
<summary>View source</summary>

A standalone checkbox uses a boolean scheme property value, which is passed on to the input element's `checked` property.

```typescript
import withFormData from 'minimal-form-data-hoc';

const scheme = miniform.createFormScheme(() => ({
  consent: { value: false },
}));

const InputForm = miniform.withFormData(scheme)(props => {
  return (
    <form>
      <input type='checkbox' checked={props.consent.value} onChange={props.consent.onChange} /> Consent
    </form>
  );
});

export default InputForm;
```

</details>

---

### Standalone radio button

:radio_button: Radio button

<details>
<summary>View source</summary>

A standalone radio button uses a boolean scheme property value, which is passed on to the input element's `checked` property.

```typescript
import withFormData from 'minimal-form-data-hoc';

const scheme = miniform.createFormScheme(() => ({
  consent: { value: false },
}));

const InputForm = miniform.withFormData(scheme)(props => {
  return (
    <form>
      <input type='radio' checked={props.consent.value} onChange={props.consent.onChange} /> Consent
    </form>
  );
});

export default InputForm;
```

</details>

---

### Multiple checkboxes

:ballot_box_with_check: Coffee  
:ballot_box_with_check: Tea  
:white_large_square: Water


<details>
<summary>View source</summary>

Multiple checkboxes are grouped by assigning the input elements the same name as the scheme property.
The value of the scheme property is an array, while the value of the input elements are literals.
These literals are added and removed from the array as the boxes are toggled.

```typescript
import withFormData from 'minimal-form-data-hoc';

const scheme = miniform.createFormScheme(() => ({
  beverage: { value: [] },
}));

const InputForm = miniform.withFormData(scheme)(props => {
  return (
    <form>
      <input
        type='checkbox'
        name='beverage'
        value='coffee'
        checked={props.beverage.value.some((x: string) => x === 'coffee')}
        onChange={props.beverage.onChange}
      />
      Coffee
      <br />
      <input
        type='checkbox'
        name='beverage'
        value='tea'
        checked={props.beverage.value.some((x: string) => x === 'tea')}
        onChange={props.beverage.onChange}
      />
      Tea
      <br />
      <input
        type='checkbox'
        name='beverage'
        value='water'
        checked={props.beverage.value.some((x: string) => x === 'water')}
        onChange={props.beverage.onChange}
      />
      Water
    </form>
  );
});

export default InputForm;
```

</details>

---

### Multiple radio buttons

:radio_button: Coffee  
:radio_button: Tea  
:radio_button: Water

<details>
<summary>View source</summary>

Multiple radio buttons are grouped by assigning the input elements the same name as the scheme property.
The values of the input elements are assigned to the form data state as the buttons are toggled.

```typescript
import withFormData from 'minimal-form-data-hoc';

const scheme = miniform.createFormScheme(() => ({
  beverage: { value: '' },
}));

const InputForm = miniform.withFormData(scheme)(props => {
  return (
    <form>
      <input
        type='radio'
        name='beverage'
        value='coffee'
        checked={props.beverage.value === 'coffee'}
        onChange={props.beverage.onChange}
      />
      Coffee
      <br />
      <input
        type='radio'
        name='beverage'
        value='tea'
        checked={props.beverage.value === 'tea'}
        onChange={props.beverage.onChange}
      />
      Tea
      <br />
      <input
        type='radio'
        name='beverage'
        value='water'
        checked={props.beverage.value === 'water'}
        onChange={props.beverage.onChange}
      />
      Water
    </form>
  );
});

export default InputForm;
```

</details>

---

## Troubleshooting

- `Warning: A component is changing an uncontrolled input to be controlled.`

  Ensure that all initial values (defined in the scheme) are not null or undefined.

- `Type '(string | ((value: string) => boolean))[]' is not assignable to type 'readonly [any, (value: any) => boolean]'.`

  Try defining the scheme `as const` to distinguish array and tuple types.

- `Argument of type '{ ... }' is not assignable to parameter of type '(props: {}) => Readonly<Record<string, Readonly<FormSchemeItem>>>'.`

  Note that the `withFormData` HOC's first argument is a function and not an object.
  The function's input argument is the props of the wrapped component.

- `Property '...' does not exist on type 'PropsWithChildren<Readonly<Record<..., Readonly<FormDataItem>>>>'.`

  Try typing the input argument of the scheme. This input type is merged with the type of the form data.

  