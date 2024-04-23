import { Field, FieldControl, FieldLabel, FieldMessage } from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { Select, SelectContent, SelectItem } from '@bigcommerce/components/select';
import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

import { AddressFields, FieldNameToFieldId } from '..';

type PicklistOrTextType = Extract<
  NonNullable<AddressFields>[number],
  { __typename: 'PicklistOrTextFormField' }
>;

interface PicklistOrTextProps {
  defaultValue?: string;
  field: PicklistOrTextType;
  name: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  options: Array<{ label: string; entityId: string | number }>;
  pending?: boolean;
  variant?: 'error';
}

export const PicklistOrText = ({
  defaultValue,
  field,
  name,
  onChange,
  options,
  pending,
  variant,
}: PicklistOrTextProps) => {
  const t = useTranslations('Account.Register');

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        <span className="flex justify-start">
          {field.label}
          {pending && field.entityId === FieldNameToFieldId.stateOrProvince && (
            <span className="ms-1 text-primary">
              <Spinner aria-hidden="true" className="animate-spin" />
              <span className="sr-only">{t('loadingStates')}</span>
            </span>
          )}
        </span>
      </FieldLabel>
      <FieldControl asChild>
        {field.entityId === FieldNameToFieldId.stateOrProvince && options.length === 0 ? (
          <Input
            disabled={pending}
            id={`field-${field.entityId}`}
            onChange={field.isRequired ? onChange : undefined}
            onInvalid={field.isRequired ? onChange : undefined}
            required={field.isRequired}
            type="text"
            variant={variant}
          />
        ) : (
          <Select
            aria-label={field.label}
            defaultValue={defaultValue}
            disabled={pending}
            id={`field-${field.entityId}`}
            key={defaultValue}
            placeholder={field.label}
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
