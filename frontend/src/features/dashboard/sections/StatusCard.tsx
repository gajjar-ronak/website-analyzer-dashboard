/**
 * StatusCard component
 * Displays URL status information and analysis timestamps
 */

import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../utils/cn';
import type { DashboardURL } from '../types';

interface StatusCardProps {
  url: DashboardURL;
}

// Status badge component
const StatusBadge: React.FC<{ status: DashboardURL['status'] }> = ({ status }) => {
  const getStatusConfig = (status: DashboardURL['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircleIcon,
          label: 'Completed',
          className: 'bg-green-100 text-green-800',
          iconClassName: 'text-green-500',
        };
      case 'failed':
        return {
          icon: XCircleIcon,
          label: 'Failed',
          className: 'bg-red-100 text-red-800',
          iconClassName: 'text-red-500',
        };
      case 'analyzing':
        return {
          icon: ClockIcon,
          label: 'Analyzing',
          className: 'bg-blue-100 text-blue-800',
          iconClassName: 'text-blue-500',
        };
      case 'pending':
      default:
        return {
          icon: ExclamationTriangleIcon,
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800',
          iconClassName: 'text-yellow-500',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        config.className
      )}
    >
      <Icon className={cn('mr-1 h-3 w-3', config.iconClassName)} />
      {config.label}
    </span>
  );
};

export const StatusCard: React.FC<StatusCardProps> = ({ url }) => {
  return (
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <ClockIcon className='mr-1.5 h-4 w-4 text-gray-400' />
          Status
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        <div className='space-y-3'>
          <div>
            <dt className='text-xs font-medium text-gray-500 mb-1'>Current Status</dt>
            <dd>
              <StatusBadge status={url.status} />
            </dd>
          </div>

          {url.analyzed_at && (
            <div>
              <dt className='text-xs font-medium text-gray-500 mb-1'>Last Analyzed</dt>
              <dd className='text-xs text-gray-900'>
                {formatDistanceToNow(new Date(url.analyzed_at), { addSuffix: true })}
              </dd>
            </div>
          )}

          <div>
            <dt className='text-xs font-medium text-gray-500 mb-1'>Created</dt>
            <dd className='text-xs text-gray-900'>
              {formatDistanceToNow(new Date(url.created_at), { addSuffix: true })}
            </dd>
          </div>

          <div>
            <dt className='text-xs font-medium text-gray-500 mb-1'>Last Updated</dt>
            <dd className='text-xs text-gray-900'>
              {new Date(url.updated_at).toLocaleString()}
              <span className='text-gray-500'>
                ({formatDistanceToNow(new Date(url.updated_at), { addSuffix: true })})
              </span>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};
