import { ChangeEvent } from 'react';

import { Countries, createFieldName, FieldNameToFieldId } from '.';

interface FieldState {
  [key: string]: boolean;
}

type StateOrProvince = Countries[number]['statesOrProvinces'];
type FieldStateSetFn<Type> = (state: Type | ((prevState: Type) => Type)) => void;

const createTextInputValidationHandler =
  (textInputStateSetter: FieldStateSetFn<FieldState>, textInputState: FieldState) =>
  (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;

    return textInputStateSetter({ ...textInputState, [fieldId]: !validationStatus });
  };

const createPasswordValidationHandler =
  (passwordStateSetter: FieldStateSetFn<FieldState>) => (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = e.target.id.split('-')[1] ?? '';

    switch (FieldNameToFieldId[Number(fieldId)]) {
      case 'password':
        return passwordStateSetter((prevState) => ({
          ...prevState,
          [fieldId]: !e.target.validity.valueMissing,
        }));

      case 'confirmPassword': {
        const confirmPassword = e.target.value;

        const passwordFieldName = createFieldName('customer', +fieldId);
        const password = new FormData(e.target.form ?? undefined).get(passwordFieldName);

        return passwordStateSetter((prevState) => ({
          ...prevState,
          [fieldId]: password === confirmPassword && !e.target.validity.valueMissing,
        }));
      }

      default:
        return passwordStateSetter((prevState) => ({
          ...prevState,
          [fieldId]: !e.target.validity.valueMissing,
        }));
    }
  };

const createPicklistOrTextValidationHandler =
  (picklistWithTextStateSetter: FieldStateSetFn<FieldState>, picklistWithTextState: FieldState) =>
  (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = Number(e.target.id.split('-')[1]);

    const validationStatus = e.target.validity.valueMissing;

    return picklistWithTextStateSetter({ ...picklistWithTextState, [fieldId]: !validationStatus });
  };

const createCountryChangeHandler =
  (provinceSetter: FieldStateSetFn<StateOrProvince>, countries: Countries) => (value: string) => {
    const states = countries.find(({ code }) => code === value)?.statesOrProvinces;

    provinceSetter(states ?? []);
  };

export {
  createTextInputValidationHandler,
  createPicklistOrTextValidationHandler,
  createPasswordValidationHandler,
  createCountryChangeHandler,
};
