'use client';

import { Loader2 as Spinner } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import ReCaptcha from 'react-google-recaptcha';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { Field, Form, FormSubmit } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

import { updateAddress } from '../../_actions/update-address';
import { AddressFields, Countries, createFieldName, FieldNameToFieldId } from '../add-address';
import { FieldWrapper, Password, Picklist, PicklistOrText, Text } from '../add-address/fields';
import {
  createPasswordValidationHandler,
  createPicklistOrTextValidationHandler,
  createTextInputValidationHandler,
} from '../add-address/handlers';
import { Address } from '../customer-edit-address';

interface FormStatus {
  status: 'success' | 'error';
  message: string;
}

type CountryStates = Countries[number]['statesOrProvinces'];
type FieldUnionType = Exclude<
  keyof typeof FieldNameToFieldId,
  'email' | 'password' | 'confirmPassword' | 'exclusiveOffers' | 'currentPassword'
>;

const isExistedField = (name: unknown): name is FieldUnionType => {
  if (typeof name === 'string' && name in FieldNameToFieldId) {
    return true;
  }

  return false;
};

interface SumbitMessages {
  messages: {
    submit: string;
    submitting: string;
  };
}

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

interface EditAddressProps {
  address: Address;
  addressFields: AddressFields;
  countries: Countries;
  reCaptchaSettings?: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  };
}

export const EditAddress = ({
  address,
  addressFields,
  countries,
  reCaptchaSettings,
}: EditAddressProps) => {
  const form = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const t = useTranslations('Account.EditAddress');

  const reCaptchaRef = useRef<ReCaptcha>(null);
  const router = useRouter();
  const [reCaptchaToken, setReCaptchaToken] = useState('');
  const [isReCaptchaValid, setReCaptchaValid] = useState(true);

  const [textInputValid, setTextInputValid] = useState<{ [key: string]: boolean }>({});
  const [passwordValid, setPassswordValid] = useState<{ [key: string]: boolean }>({
    [FieldNameToFieldId.password]: true,
    [FieldNameToFieldId.confirmPassword]: true,
  });

  const defaultStates = countries
    .filter((country) => country.code === address.countryCode)
    .flatMap((country) => country.statesOrProvinces);
  const [countryStates, setCountryStates] = useState<CountryStates>(defaultStates);
  const [picklistWithTextValid, setPicklistWithTextValid] = useState<{ [key: string]: boolean }>(
    {},
  );

  const handleTextInputValidation = createTextInputValidationHandler(
    setTextInputValid,
    textInputValid,
  );
  const handlePasswordValidation = createPasswordValidationHandler(setPassswordValid);
  const handleCountryChange = (value: string) => {
    const country = countries.find(({ code }) => code === value);
    const states = country?.statesOrProvinces;

    if (states) {
      setCountryStates(states);
    }
  };

  const handlePicklistOrTextValidation = createPicklistOrTextValidationHandler(
    setPicklistWithTextValid,
    picklistWithTextValid,
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

    const submit = await updateAddress({ addressId: address.entityId, formData });

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
            const key = FieldNameToFieldId[field.entityId];

            if (!isExistedField(key)) {
              return null;
            }

            const defaultValue = address[key] || undefined;

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
                        field.entityId === FieldNameToFieldId.countryCode ? defaultValue : undefined
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

              case 'PicklistOrTextFormField': {
                return (
                  <FieldWrapper fieldId={field.entityId} key={field.entityId}>
                    <PicklistOrText
                      defaultValue={
                        field.entityId === FieldNameToFieldId.stateOrProvince
                          ? defaultValue
                          : undefined
                      }
                      field={field}
                      key={countryStates.length}
                      name={createFieldName('address', field.entityId)}
                      onChange={handlePicklistOrTextValidation}
                      options={countryStates.map(({ name }) => {
                        return { entityId: name, label: name };
                      })}
                      variant={
                        picklistWithTextValid[field.entityId] === false ? 'error' : undefined
                      }
                    />
                  </FieldWrapper>
                );
              }

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
          {/* TODO: add DELETE button */}
        </div>
      </Form>
    </>
  );
};
