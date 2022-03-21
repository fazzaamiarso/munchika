import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

export const PasswordField = ({ fieldData, isBusy }) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);
  return (
    <>
      <label htmlFor="password" className="font-semibold">
        Password
      </label>
      <div className="relative flex w-full">
        <input
          name="password"
          id="password"
          type={show ? 'text' : 'password'}
          placeholder="password"
          required
          autoComplete="off"
          defaultValue={fieldData?.fields ? fieldData.fields.password : ''}
          className={`w-full rounded-md ${
            fieldData?.fieldErrors?.password && !isBusy ? 'border-red-400' : ''
          }`}
          aria-describedby="password-error"
          aria-invalid={fieldData?.fieldErrors?.password ? 'true' : 'false'}
        />
        <button
          aria-label={show ? 'Hide password' : 'Show password'}
          type="button"
          onClick={toggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:opacity-70"
        >
          {show ? <EyeOffIcon className="h-6" /> : <EyeIcon className="h-6" />}
        </button>
      </div>
    </>
  );
};
