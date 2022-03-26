import { useTransition } from 'remix';

export const InputField = ({
  name,
  label,
  type = 'text',
  required = true,
  placeholder = '',
  hint = '',
  fieldData,
  fieldError,
}) => {
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
        className={`w-full rounded-md ${fieldData && !isBusy ? 'border-red-400' : ''}`}
        aria-describedby={`${name}-hint`}
        aria-errormessage={`${name}-error`}
        aria-invalid={fieldError ? 'true' : 'false'}
      />
    </>
  );
};
