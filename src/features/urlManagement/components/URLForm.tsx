import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/Button';
import type { CreateURLRequest, URL } from '../types';

interface URLFormProps {
  onSubmit: (data: CreateURLRequest) => void;
  loading?: boolean;
  initialData?: Partial<URL>;
  submitText?: string;
}

interface FormData {
  url: string;
  title: string;
  description: string;
}

const URLForm: React.FC<URLFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
  submitText = 'Add URL',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      url: initialData?.url || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
    },
    mode: 'onChange',
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      url: data.url,
      title: data.title,
      description: data.description || undefined,
    });

    if (!initialData) {
      reset(); // Only reset if it's a new form (not editing)
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      <div>
        <label htmlFor='url' className='block text-sm font-medium text-gray-700'>
          URL *
        </label>
        <div className='mt-1'>
          <input
            {...register('url', {
              required: 'URL is required',
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Please enter a valid URL starting with http:// or https://',
              },
            })}
            type='url'
            id='url'
            className='block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm'
            placeholder='https://example.com'
          />
          {errors.url && <p className='mt-2 text-sm text-red-600'>{errors.url.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor='title' className='block text-sm font-medium text-gray-700'>
          Title *
        </label>
        <div className='mt-1'>
          <input
            {...register('title', {
              required: 'Title is required',
              minLength: {
                value: 2,
                message: 'Title must be at least 2 characters',
              },
              maxLength: {
                value: 100,
                message: 'Title must be less than 100 characters',
              },
            })}
            type='text'
            id='title'
            className='block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm'
            placeholder='Website name or title'
          />
          {errors.title && <p className='mt-2 text-sm text-red-600'>{errors.title.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor='description' className='block text-sm font-medium text-gray-700'>
          Description
        </label>
        <div className='mt-1'>
          <textarea
            {...register('description', {
              maxLength: {
                value: 500,
                message: 'Description must be less than 500 characters',
              },
            })}
            id='description'
            rows={3}
            className='block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm'
            placeholder='Optional description of the website'
          />
          {errors.description && (
            <p className='mt-2 text-sm text-red-600'>{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className='flex justify-end space-x-3'>
        <Button type='button' variant='outline' onClick={() => reset()} disabled={loading}>
          Reset
        </Button>
        <Button type='submit' loading={loading} disabled={!isValid || loading}>
          {submitText}
        </Button>
      </div>
    </form>
  );
};

export default URLForm;
