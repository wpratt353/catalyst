'use client';

import { Button } from '@bigcommerce/components/button';
import { Field, Form, FormSubmit } from '@bigcommerce/components/form';
import { Message } from '@bigcommerce/components/message';
import { Loader2 as Spinner } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import { getShippingStates } from '~/app/[locale]/(default)/cart/_actions/get-shipping-states';
import { Link } from '~/components/link';

import { addAddress } from '../../_actions/add-address';
import { NewAddressQueryResponseType } from '../customer-new-address';

import { FieldWrapper, Password, Picklist, PicklistOrText, Text } from './fields';
import {
  createPasswordValidationHandler,
  createPicklistOrTextValidationHandler,
  createTextInputValidationHandler,
} from './handlers';

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

export type AddressFields = NonNullable<
  NewAddressQueryResponseType['site']['settings']
>['formFields']['shippingAddress'];

export type Countries = NonNullable<NewAddressQueryResponseType['geography']['countries']>;
type CountryCode = Countries[number]['code'];
type CountryStates = Countries[number]['statesOrProvinces'];

export enum FieldNameToFieldId {
  email = 1,
  password,
  confirmPassword,
  firstName,
  lastName,
  company,
  phone,
  address1,
  address2,
  city,
  countryCode,
  stateOrProvince,
  postalCode,
  currentPassword = 24,
  exclusiveOffers = 25,
}

export const BOTH_CUSTOMER_ADDRESS_FIELDS = [
  FieldNameToFieldId.firstName,
  FieldNameToFieldId.lastName,
  FieldNameToFieldId.company,
  FieldNameToFieldId.phone,
];

interface SumbitMessages {
  messages: {
    submit: string;
    submitting: string;
  };
}

export const createFieldName = (fieldType: 'customer' | 'address', fieldId: number) => {
  const secondFieldType = fieldType === 'customer' ? 'address' : 'customer';

  return `${fieldType}-${BOTH_CUSTOMER_ADDRESS_FIELDS.includes(fieldId) ? `${secondFieldType}-` : ''}${FieldNameToFieldId[fieldId] || fieldId}`;
};

const SubmitButton = ({ messages }: SumbitMessages) => {
  const { pending } = useFormStatus();

  return (
    <Button
      className="relative items-center px-8 py-2 md:w-fit"
      disabled={pending}
      variant="primary"
    >
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

interface AddAddressProps {
  addressFields: AddressFields;
  countries: Countries;
  defaultCountry: {
    id: number;
    code: CountryCode;
    states: CountryStates;
  };
  fallbackCountryId: number;
  reCaptchaSettings?: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  };
}

export const AddAddress = ({
  addressFields,
  countries,
  defaultCountry,
  fallbackCountryId,
  reCaptchaSettings,
}: AddAddressProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const router = useRouter();
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const [textInputValid, setTextInputValid] = useState<{ [key: string]: boolean }>({});
  const [passwordValid, setPassswordValid] = useState<{ [key: string]: boolean }>({
    [FieldNameToFieldId.password]: true,
    [FieldNameToFieldId.confirmPassword]: true,
  });

  const t = useTranslations('Account.Addresses');

  const [countryStates, setCountryStates] = useState(defaultCountry.states);
  const [countryStatesPending, setCountryStatesPending] = useState(false);

  const [picklistWithTextValid, setPicklistWithTextValid] = useState<{ [key: string]: boolean }>(
    {},
  );

  const handleTextInputValidation = createTextInputValidationHandler(
    textInputValid,
    setTextInputValid,
  );
  const handlePasswordValidation = createPasswordValidationHandler(setPassswordValid);
  const handleCountryChange = async (value: string) => {
    const country = countries.find(({ code }) => code === value);

    setCountryStatesPending(true);

    const { data = [] } = await getShippingStates(country?.entityId || fallbackCountryId);

    setCountryStatesPending(false);

    setCountryStates(
      data.map(({ id, state, state_abbreviation }) => ({
        abbreviation: state_abbreviation,
        name: state,
        entityId: id,
        __typename: 'StateOrProvince',
      })),
    );
  };

  const handlePicklistOrTextValidation = createPicklistOrTextValidationHandler(
    picklistWithTextValid,
    setPicklistWithTextValid,
  );

  const onReCaptchaChange = (token: string | null) => {
    if (!token) {
      return setReCaptchaValid(false);
    }

    setReCaptchaToken(token);
    setReCaptchaValid(true);
  };

  const onSubmit = async (formData: FormData) => {
    if (reCaptchaSettings?.isEnabledOnStorefront && !reCaptchaToken) {
      return setReCaptchaValid(false);
    }

    setReCaptchaValid(true);

    const submit = await addAddress({ formData });

    if (submit.status === 'success') {
      form.current?.reset();
      setFormStatus({
        status: 'success',
        message: t('successMessage'),
      });

      setTimeout(() => {
        router.replace('/account/addresses');
      }, 3000);
    }

    if (submit.status === 'error') {
      setFormStatus({ status: 'error', message: submit.message || '' });
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {formStatus && (
        <Message className="mx-auto mb-8 w-full" variant={formStatus.status}>
          <p>{formStatus.message}</p>
        </Message>
      )}
      <Form action={onSubmit} ref={form}>
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
          {addressFields.map((field) => {
            switch (field.__typename) {
              case 'TextFormField': {
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <Text
                      field={field}
                      isValid={textInputValid[field.entityId]}
                      name={createFieldName('address', field.entityId)}
                      onChange={handleTextInputValidation}
                    />
                  </FieldWrapper>
                );
              }

              case 'PicklistFormField':
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <Picklist
                      defaultValue={
                        field.entityId === FieldNameToFieldId.countryCode
                          ? defaultCountry.code
                          : undefined
                      }
                      field={field}
                      name={createFieldName('address', field.entityId)}
                      onChange={
                        field.entityId === FieldNameToFieldId.countryCode
                          ? handleCountryChange
                          : undefined
                      }
                      options={countries.map(({ name, code }) => {
                        return { label: name, entityId: code };
                      })}
                    />
                  </FieldWrapper>
                );

              case 'PicklistOrTextFormField':
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <PicklistOrText
                      defaultValue={
                        field.entityId === FieldNameToFieldId.stateOrProvince
                          ? countryStates[0]?.name
                          : undefined
                      }
                      field={field}
                      name={createFieldName('address', field.entityId)}
                      onChange={handlePicklistOrTextValidation}
                      options={countryStates.map(({ name }) => {
                        return { entityId: name, label: name };
                      })}
                      pending={
                        FieldNameToFieldId.stateOrProvince === field.entityId
                          ? countryStatesPending
                          : undefined
                      }
                      variant={
                        picklistWithTextValid[field.entityId] === false ? 'error' : undefined
                      }
                    />
                  </FieldWrapper>
                );

              case 'PasswordFormField': {
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <Password
                      field={field}
                      isValid={passwordValid[field.entityId]}
                      name={createFieldName('customer', field.entityId)}
                      onChange={handlePasswordValidation}
                      variant={!passwordValid[field.entityId] ? 'error' : undefined}
                    />
                  </FieldWrapper>
                );
              }

              default:
                return null;
            }
          })}

          {reCaptchaSettings?.isEnabledOnStorefront && (
            <Field className="relative col-span-full max-w-full space-y-2 pb-7" name="ReCAPTCHA">
              <ReCaptcha
                onChange={onReCaptchaChange}
                ref={reCaptchaRef}
                sitekey={reCaptchaSettings.siteKey}
              />
              {!isReCaptchaValid && (
                <span className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-error">
                  {t('recaptchaText')}
                </span>
              )}
            </Field>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-stretch gap-2 md:flex-row md:justify-start md:gap-6">
          <FormSubmit asChild>
            <SubmitButton
              messages={{ submit: `${t('submit')}`, submitting: `${t('submitting')}` }}
            />
          </FormSubmit>
          <Button className="items-center px-8 md:w-fit" variant="secondary">
            <Link href="/account/addresses">{t('cancel')}</Link>
          </Button>
        </div>
      </Form>
    </>
  );
};
