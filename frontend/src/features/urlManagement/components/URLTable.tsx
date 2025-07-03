import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';
import { formatDateTime, formatRelativeTime } from '../../../utils/formatDate';
import { cn } from '../../../utils/cn';
import type { URL } from '../types';

interface URLTableProps {
  urls: URL[];
  loading?: boolean;
  onView?: (url: URL) => void;
  onEdit?: (url: URL) => void;
  onDelete?: (url: URL) => void;
  onCheck?: (url: URL) => void;
}

const getStatusIcon = (status: URL['status']) => {
  switch (status) {
    case 'active':
      return <CheckCircleIcon className='h-5 w-5 text-green-500' />;
    case 'inactive':
      return <XCircleIcon className='h-5 w-5 text-red-500' />;
    case 'pending':
      return <ClockIcon className='h-5 w-5 text-yellow-500' />;
    default:
      return <ClockIcon className='h-5 w-5 text-gray-400' />;
  }
};

const getStatusBadge = (status: URL['status']) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  switch (status) {
    case 'active':
      return <span className={cn(baseClasses, 'bg-green-100 text-green-800')}>Active</span>;
    case 'inactive':
      return <span className={cn(baseClasses, 'bg-red-100 text-red-800')}>Inactive</span>;
    case 'pending':
      return <span className={cn(baseClasses, 'bg-yellow-100 text-yellow-800')}>Pending</span>;
    default:
      return <span className={cn(baseClasses, 'bg-gray-100 text-gray-800')}>Unknown</span>;
  }
};

const URLTable: React.FC<URLTableProps> = ({
  urls,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onCheck,
}) => {
  if (loading) {
    return (
      <div className='animate-pulse'>
        <div className='bg-white shadow rounded-lg'>
          <div className='px-4 py-5 sm:p-6'>
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='flex items-center space-x-4'>
                  <div className='h-4 bg-gray-200 rounded w-1/4' />
                  <div className='h-4 bg-gray-200 rounded w-1/3' />
                  <div className='h-4 bg-gray-200 rounded w-1/6' />
                  <div className='h-4 bg-gray-200 rounded w-1/6' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className='bg-white shadow rounded-lg'>
        <div className='px-4 py-12 text-center'>
          <div className='mx-auto h-12 w-12 text-gray-400'>
            <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 105.656-5.656l-1.102 1.102'
              />
            </svg>
          </div>
          <h3 className='mt-2 text-sm font-medium text-gray-900'>No URLs</h3>
          <p className='mt-1 text-sm text-gray-500'>
            Get started by adding your first URL to monitor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                URL
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Response Time
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Last Checked
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {urls.map(url => (
              <tr key={url.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    {getStatusIcon(url.status)}
                    <div className='ml-3'>{getStatusBadge(url.status)}</div>
                  </div>
                </td>
                <td className='px-6 py-4'>
                  <div className='flex flex-col'>
                    <div className='text-sm font-medium text-gray-900 truncate max-w-xs'>
                      {url.title}
                    </div>
                    <div className='text-sm text-gray-500 truncate max-w-xs'>{url.url}</div>
                    {url.description && (
                      <div className='text-xs text-gray-400 truncate max-w-xs mt-1'>
                        {url.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {url.responseTime ? `${url.responseTime}ms` : '-'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  <div className='flex flex-col'>
                    <span>{formatRelativeTime(url.lastChecked)}</span>
                    <span className='text-xs text-gray-400'>{formatDateTime(url.lastChecked)}</span>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                  <div className='flex items-center space-x-2'>
                    {onView && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onView(url)}
                        className='text-gray-400 hover:text-gray-600'
                      >
                        <EyeIcon className='h-4 w-4' />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onEdit(url)}
                        className='text-gray-400 hover:text-gray-600'
                      >
                        <PencilIcon className='h-4 w-4' />
                      </Button>
                    )}
                    {onCheck && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onCheck(url)}
                        className='text-blue-400 hover:text-blue-600'
                      >
                        Check
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onDelete(url)}
                        className='text-red-400 hover:text-red-600'
                      >
                        <TrashIcon className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default URLTable;
