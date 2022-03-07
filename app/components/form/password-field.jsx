import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';

export const PasswordField = ({ fieldData }) => {
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
            fieldData?.fieldErrors?.password ? 'border-red-400' : ''
          }`}
        />
        <button
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
