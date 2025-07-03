/**
 * OverviewCard component
 * Displays basic URL information and overview data
 */

import React from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { cn } from '../../../utils/cn';
import type { DashboardURL } from '../types';

interface OverviewCardProps {
  url: DashboardURL;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ url }) => {
  return (
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <GlobeAltIcon className='mr-1.5 h-4 w-4 text-gray-400' />
          Overview
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        <dl className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
          <div>
            <dt className='text-xs font-medium text-gray-500 mb-1'>Title</dt>
            <dd className='text-xs text-gray-900 break-words'>{url.title || 'No title'}</dd>
          </div>
          <div>
            <dt className='text-xs font-medium text-gray-500 mb-1'>Status Code</dt>
            <dd className='text-xs text-gray-900'>
              {url.status_code > 0 ? (
                <span className={cn(
                  'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                  url.status_code >= 200 && url.status_code < 300
                    ? 'bg-green-100 text-green-800'
                    : url.status_code >= 300 && url.status_code < 400
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                )}>
                  HTTP {url.status_code}
                </span>
              ) : (
                'Not analyzed'
              )}
            </dd>
          </div>
          <div className='sm:col-span-2'>
            <dt className='text-xs font-medium text-gray-500 mb-1'>Description</dt>
            <dd className='text-xs text-gray-900 break-words'>
              {url.description || 'No description available'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
