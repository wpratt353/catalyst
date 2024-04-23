import { Field, FieldControl, FieldLabel } from '@bigcommerce/components/form';
import { Select, SelectContent, SelectItem } from '@bigcommerce/components/select';

import { AddressFields, FieldNameToFieldId } from '..';

type PicklistType = Extract<
  NonNullable<AddressFields>[number],
  { __typename: 'PicklistFormField' }
>;

interface PicklistProps {
  defaultValue?: string;
  field: PicklistType;
  name: string;
  onChange?: (value: string) => Promise<void>;
  options: Array<{ label: string; entityId: string | number }>;
}

export const Picklist = ({ defaultValue, field, name, onChange, options }: PicklistProps) => {
  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={`field-${field.entityId}`} isRequired={field.isRequired}>
        {field.label}
      </FieldLabel>
      <FieldControl asChild>
        <Select
          aria-label={field.choosePrefix}
          defaultValue={defaultValue}
          id={`field-${field.entityId}`}
          onValueChange={field.entityId === FieldNameToFieldId.countryCode ? onChange : undefined}
          placeholder={field.choosePrefix}
          required={field.isRequired}
        >
          <SelectContent>
            {field.entityId === FieldNameToFieldId.countryCode &&
              options.map(({ label, entityId }) => (
                <SelectItem key={entityId} value={entityId.toString()}>
                  {label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </FieldControl>
    </Field>
  );
};
