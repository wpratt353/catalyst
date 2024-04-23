import { Field, FieldControl, FieldLabel, FieldMessage } from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { AddressFields, FieldNameToFieldId } from '..';

type TextType = Extract<NonNullable<AddressFields>[number], { __typename: 'TextFormField' }>;

interface TextProps {
  field: TextType;
  isValid?: boolean;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export const Text = ({ field, isValid, name, onChange, type }: TextProps) => {
  const t = useTranslations('Account.Register'); // TODO: update later

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Input
          defaultValue={field.defaultText ?? undefined}
          id={`field-${field.entityId}`}
          maxLength={field.maxLength ?? undefined}
          onChange={field.isRequired ? onChange : undefined}
          onInvalid={field.isRequired ? onChange : undefined}
          required={field.isRequired}
          type={type ?? 'text'}
          variant={isValid === false ? 'error' : undefined}
        />
      </FieldControl>
      {field.isRequired && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-red-200"
          match="valueMissing"
        >
          {t('emptyTextValidatoinMessage')}
        </FieldMessage>
      )}
      {FieldNameToFieldId[field.entityId] === 'email' && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-red-200"
          match="typeMismatch"
        >
          {t('emailValidationMessage')}
        </FieldMessage>
      )}
    </Field>
  );
};
