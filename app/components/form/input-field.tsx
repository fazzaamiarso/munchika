import { useTransition } from '@remix-run/react';
import { ComponentPropsWithoutRef } from 'react';

type OwnInputProps = {
  label: string;
  fieldData: string | number | undefined;
  fieldError: string | undefined;
  hint?: string;
};

type InputFieldProps = OwnInputProps & Omit<ComponentPropsWithoutRef<'input'>, keyof OwnInputProps>;

export const InputField = ({
  name,
  label,
  type = 'text',
  required = true,
  placeholder = '',
  hint = '',
  fieldData,
  fieldError,
}: InputFieldProps) => {
  const transition = useTransition();
  const isBusy = transition.state === 'submitting' || transition.state === 'loading';

  return (
    <>
      <div className="self-start">
        <label htmlFor={name} className=" font-semibold ">
          {label}
        </label>
        {hint ? (
          <p id={`${name}-hint`} className="text-sm font-normal leading-none text-gray-600">
            {hint}
          </p>
        ) : null}
      </div>
      <input
        name={name}
        id={name}
        type={type}
        required={required}
        autoComplete="off"
        placeholder={placeholder}
        defaultValue={fieldData ? fieldData : ''}
        className={`w-full rounded-md ${fieldError && !isBusy ? 'border-red-600' : ''}`}
        aria-describedby={`${name}-hint`}
        aria-errormessage={`${name}-error`}
        aria-invalid={fieldError ? 'true' : 'false'}
      />
    </>
  );
};
