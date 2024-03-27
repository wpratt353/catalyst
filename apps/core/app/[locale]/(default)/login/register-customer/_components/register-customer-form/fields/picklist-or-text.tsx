import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { Field, FieldControl, FieldLabel, FieldMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem } from '~/components/ui/select';

import { AddressFields, FieldNameToFieldId } from '..';

type PicklistOrTextType = Extract<
  NonNullable<AddressFields>[number],
  { __typename: 'PicklistOrTextFormField' }
>;

interface PicklistWithTextProps {
  defaultValue?: string;
  field: PicklistOrTextType;
  name: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  options: Array<{ label: string; entityId: string | number }>;
  variant?: 'error';
}

export const PicklistOrText = ({
  defaultValue,
  field,
  name,
  onChange,
  options,
}: PicklistWithTextProps) => {
  const t = useTranslations('Account.Register');

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel
        htmlFor={`field-${field.entityId}`}
        isRequired={options.length !== 0 ? field.isRequired : false}
      >
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        {options.length === 0 ? (
          <Input
            id={`field-${field.entityId}`}
            onChange={field.isRequired ? onChange : undefined}
            onInvalid={field.isRequired ? onChange : undefined}
            type="text"
          />
        ) : (
          <Select
            aria-label="Choose state or province"
            defaultValue={defaultValue}
            id={`field-${field.entityId}`}
            key={defaultValue}
            placeholder="Choose state or province"
            required={field.isRequired}
          >
            <SelectContent>
              {field.entityId === FieldNameToFieldId.stateOrProvince &&
                options.map(({ entityId, label }) => {
                  return (
                    <SelectItem key={entityId} value={entityId.toString()}>
                      {label}
                    </SelectItem>
                  );
                })}
            </SelectContent>
          </Select>
        )}
      </FieldControl>
      {field.isRequired && options.length === 0 && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-red-200"
          match="valueMissing"
        >
          {t('emptyTextValidatoinMessage')}
        </FieldMessage>
      )}
    </Field>
  );
};
