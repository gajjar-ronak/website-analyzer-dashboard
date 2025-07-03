import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { cn } from '../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options = [], // Default to empty array
  placeholder = 'Select an option',
  disabled = false,
  error,
  label,
  className,
  size = 'md',
}) => {
  const selectedOption = options.find(option => option.value === value);

  const sizeClasses = {
    sm: 'py-1 pl-2 pr-7 text-xs',
    md: 'py-1.5 pl-2.5 pr-8 text-xs',
    lg: 'py-2 pl-3 pr-9 text-sm',
  };

  const iconSizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('relative', className)}>
      {label && <label className='block text-xs font-medium text-gray-700 mb-0.5'>{label}</label>}

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className='relative'>
          <Listbox.Button
            className={cn(
              'relative w-full cursor-default rounded-md border bg-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              sizeClasses[size],
              error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',
              disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'
            )}
          >
            <span className='block truncate'>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5'>
              <ChevronUpDownIcon
                className={cn('text-gray-400', iconSizeClasses[size])}
                aria-hidden='true'
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-2 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
              {options.map(option => (
                <Listbox.Option
                  key={option.value}
                  className={({ active, disabled: optionDisabled }) =>
                    cn(
                      'relative cursor-default select-none py-1.5 pl-8 pr-2',
                      active ? 'bg-primary-100 text-primary-900' : 'text-gray-900',
                      optionDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    )
                  }
                  value={option.value}
                  disabled={option.disabled}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className='absolute inset-y-0 left-0 flex items-center pl-2 text-primary-600'>
                          <CheckIcon className='h-3 w-3' aria-hidden='true' />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>

      {error && (
        <p className='mt-0.5 text-xs text-red-600' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
