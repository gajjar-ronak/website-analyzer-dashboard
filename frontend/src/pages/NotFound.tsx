import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';

const NotFound: React.FC = () => {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='text-center'>
          <div className='mx-auto h-24 w-24 text-gray-400'>
            <svg fill='none' viewBox='0 0 24 24' stroke='currentColor' className='h-full w-full'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1}
                d='M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
          </div>

          <h1 className='mt-6 text-6xl font-bold text-gray-900'>404</h1>

          <h2 className='mt-4 text-2xl font-bold text-gray-900'>Page not found</h2>

          <p className='mt-2 text-base text-gray-500'>
            Sorry, we couldn't find the page you're looking for.
          </p>

          <div className='mt-8 flex justify-center space-x-4'>
            <Link to='/dashboard'>
              <Button className='inline-flex items-center'>
                <HomeIcon className='mr-2 h-4 w-4' />
                Go to Dashboard
              </Button>
            </Link>

            <Button variant='outline' onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>

          <div className='mt-8'>
            <p className='text-sm text-gray-500'>
              If you think this is an error, please{' '}
              <a
                href='mailto:support@example.com'
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                contact support
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
