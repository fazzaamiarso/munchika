import { ComponentPropsWithoutRef, useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

type OwnInputProps = {
  fieldData: string | undefined;
  isBusy: boolean;
};
type PasswordFieldProps = OwnInputProps &
  Omit<ComponentPropsWithoutRef<'input'>, keyof OwnInputProps>;

export const PasswordField = ({ fieldData, isBusy, autoComplete }: PasswordFieldProps) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);
  return (
    <>
      <div className="self-start">
        <label htmlFor="password" className="  font-semibold">
          Password
        </label>
        <p id="pass-hint" className="text-sm font-normal leading-none text-gray-600">
          Must contain 6+ characters with at least 1 number
        </p>
      </div>
      <div className="relative flex w-full">
        <input
          name="password"
          id="password"
          type={show ? 'text' : 'password'}
          required
          autoComplete={autoComplete}
          defaultValue={fieldData ?? ''}
          className={`w-full rounded-md ${fieldData && !isBusy ? 'border-red-600' : ''}`}
          aria-describedby="pass-hint "
          aria-errormessage="password-error"
          aria-invalid={fieldData ? 'true' : 'false'}
        />
        <button
          aria-labelledby="eye-label"
          type="button"
          onClick={toggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 hover:opacity-70"
        >
          <span className="sr-only" id="eye-label">
            {show ? 'Hide password' : 'Show password'}
          </span>
          {show ? <EyeOffIcon className="h-6" /> : <EyeIcon className="h-6" />}
        </button>
      </div>
    </>
  );
};
