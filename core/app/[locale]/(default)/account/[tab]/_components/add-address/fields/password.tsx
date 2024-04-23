import { Field, FieldControl, FieldLabel, FieldMessage } from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { AddressFields, FieldNameToFieldId } from '..';

type PasswordType = Extract<
  NonNullable<AddressFields>[number],
  { __typename: 'PasswordFormField' }
>;

interface PasswordProps {
  field: PasswordType;
  isValid?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  variant?: 'error';
}

export const Password = ({ field, isValid, name, onChange, variant }: PasswordProps) => {
  const t = useTranslations('Account.Register');

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
          onChange={onChange}
          onInvalid={onChange}
          required={field.isRequired}
          type="text"
          variant={variant}
        />
      </FieldControl>
      {field.isRequired && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-red-200"
          match="valueMissing"
        >
          {t('emptyPasswordValidatoinMessage')}
        </FieldMessage>
      )}
      {FieldNameToFieldId[field.entityId] === 'confirmPassword' && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-red-200"
          match={() => {
            return !isValid;
          }}
        >
          {t('equalPasswordValidatoinMessage')}
        </FieldMessage>
      )}
    </Field>
  );
};
