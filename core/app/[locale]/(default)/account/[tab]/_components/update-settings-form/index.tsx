'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Form, FormSubmit } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { getCustomerSettingsQuery } from '../../page-data';

import { updateCustomer } from './_actions/update-customer';
import { Text } from './fields/text';

type CustomerInfo = NonNullable<
  Awaited<ReturnType<typeof getCustomerSettingsQuery>>
>['customerInfo'];
type CustomerFields = NonNullable<
  Awaited<ReturnType<typeof getCustomerSettingsQuery>>
>['customerFields'];
type AddressFields = NonNullable<
  Awaited<ReturnType<typeof getCustomerSettingsQuery>>
>['addressFields'];

interface FormProps {
  addressFields: AddressFields;
  customerInfo: CustomerInfo;
  customerFields: CustomerFields;
}

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

interface SumbitMessages {
  messages: {
    submit: string;
    submitting: string;
  };
}

enum FieldNameToFieldId {
  email = 1,
  firstName = 4,
  lastName,
  company,
  phone,
}

type FieldUnionType = keyof typeof FieldNameToFieldId;

const isExistedField = (name: unknown): name is FieldUnionType => {
  if (typeof name === 'string' && name in FieldNameToFieldId) {
    return true;
  }

  return false;
};

const SubmitButton = ({ messages }: SumbitMessages) => {
  const { pending } = useFormStatus();

  return (
    <Button className="relative w-fit items-center px-8 py-2" disabled={pending} variant="primary">
      <>
        {pending && (
          <>
            <span className="absolute z-10 flex h-full w-full items-center justify-center bg-gray-400">
              <Spinner aria-hidden="true" className="animate-spin" />
            </span>
            <span className="sr-only">{messages.submitting}</span>
          </>
        )}
        <span aria-hidden={pending}>{messages.submit}</span>
      </>
    </Button>
  );
};

export const UpdateSettingsForm = ({ addressFields, customerFields, customerInfo }: FormProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const [textInputValid, setTextInputValid] = useState<{ [key: string]: boolean }>({});

  const t = useTranslations('Account.Settings');

  const handleTextInputValidation = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldId = e.target.id;

    const validityState = e.target.validity;
    const validationStatus = validityState.valueMissing || validityState.typeMismatch;

    return setTextInputValid({ ...textInputValid, [fieldId]: !validationStatus });
  };

  const onSubmit = async (formData: FormData) => {
    const submit = await updateCustomer(formData);

    if (submit.status === 'success') {
      setFormStatus({
        status: 'success',
        message: t('successMessage', {
          firstName: submit.data?.firstName,
          lastName: submit.data?.lastName,
        }),
      });
    }

    if (submit.status === 'error') {
      setFormStatus({ status: 'error', message: submit.error ?? '' });
    }
  };

  return (
    <>
      {formStatus && (
        <Message className="mx-auto" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form action={onSubmit} ref={form}>
        <div className="mb-10 mt-8 grid grid-cols-1 gap-y-6 text-base lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
          {addressFields.map((field) => {
            const key = FieldNameToFieldId[field.entityId] ?? '';

            if (!isExistedField(key)) {
              return null;
            }

            const defaultValue = customerInfo[key];

            return (
              <Text
                defaultValue={defaultValue}
                isRequired={field.isRequired}
                isValid={textInputValid.phone}
                key={field.entityId}
                label={field.label}
                name={FieldNameToFieldId[field.entityId] ?? ''}
                onChange={handleTextInputValidation}
              />
            );
          })}
          <div className="lg:col-span-2">
            <Text
              defaultValue={customerInfo.email}
              isRequired
              isValid={textInputValid.email}
              label={
                customerFields.find((field) => field.entityId === FieldNameToFieldId.email)
                  ?.label ?? ''
              }
              name="email"
              onChange={handleTextInputValidation}
              type="email"
            />
          </div>

          <div className="mt-8 flex lg:col-span-2">
            <FormSubmit asChild>
              <SubmitButton
                messages={{ submit: `${t('submit')}`, submitting: `${t('submitting')}` }}
              />
            </FormSubmit>
            <Button asChild className="ms-4 w-fit" variant="secondary">
              <Link href="/account">{t('cancel')}</Link>
            </Button>
          </div>
        </div>
      </Form>
    </>
  );
};
