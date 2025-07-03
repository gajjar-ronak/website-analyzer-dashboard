/**
 * AddURLForm component
 * Simplified form for adding URLs that matches the backend API requirements
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/Button';
import type { CreateURLRequest } from '../types';

interface AddURLFormProps {
  onSubmit: (data: CreateURLRequest) => void;
  onCancel?: () => void;
  loading?: boolean;
  submitText?: string;
  showCancelButton?: boolean;
}

interface FormData {
  url: string;
  title: string;
}

export const AddURLForm: React.FC<AddURLFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  submitText = 'Add URL',
  showCancelButton = true,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      url: '',
      title: '',
    },
  });

  const urlValue = watch('url');

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      url: data.url.trim(),
      title: data.title.trim(),
    });
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  const handleReset = () => {
    reset();
  };

  // URL validation pattern
  const urlPattern = {
    value:
      /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
    message: 'Please enter a valid URL starting with http:// or https://',
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      <div>
        <label htmlFor='title' className='block text-sm font-medium text-gray-700'>
          Website Title
        </label>
        <div className='mt-1'>
          <input
            {...register('title', {
              required: 'Website title is required',
              minLength: {
                value: 2,
                message: 'Title must be at least 2 characters long',
              },
              maxLength: {
                value: 100,
                message: 'Title must be less than 100 characters',
              },
            })}
            type='text'
            id='title'
            placeholder='Enter website title'
            className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            disabled={loading}
          />
          {errors.title && (
            <p className='mt-2 text-sm text-red-600' role='alert'>
              {errors.title.message}
            </p>
          )}
        </div>
        <p className='mt-2 text-sm text-gray-500'>A descriptive title for the website</p>
      </div>

      <div>
        <label htmlFor='url' className='block text-sm font-medium text-gray-700'>
          Website URL
        </label>
        <div className='mt-1'>
          <input
            {...register('url', {
              required: 'URL is required',
              pattern: urlPattern,
              validate: {
                notEmpty: value => value.trim().length > 0 || 'URL cannot be empty',
                validProtocol: value => {
                  const trimmed = value.trim();
                  return (
                    trimmed.startsWith('http://') ||
                    trimmed.startsWith('https://') ||
                    'URL must start with http:// or https://'
                  );
                },
              },
            })}
            type='url'
            id='url'
            autoComplete='url'
            placeholder='https://example.com'
            className='block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
            disabled={loading}
          />
          {errors.url && (
            <p className='mt-2 text-sm text-red-600' role='alert'>
              {errors.url.message}
            </p>
          )}
        </div>
        <p className='mt-2 text-sm text-gray-500'>
          Enter the complete URL including http:// or https://
        </p>
      </div>

      {/* URL Preview */}
      {urlValue && !errors.url && (
        <div className='rounded-md bg-blue-50 p-4'>
          <div className='flex'>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-blue-800'>URL Preview</h3>
              <div className='mt-2 text-sm text-blue-700'>
                <p className='break-all'>{urlValue}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className='flex items-center justify-end space-x-3 pt-4'>
        {showCancelButton && (
          <Button type='button' variant='outline' onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
        )}

        <Button
          type='button'
          variant='outline'
          onClick={handleReset}
          disabled={loading || !isDirty}
        >
          Reset
        </Button>

        <Button type='submit' loading={loading} disabled={!isValid || loading || !isDirty}>
          {submitText}
        </Button>
      </div>
    </form>
  );
};
