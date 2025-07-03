/**
 * URLTable component for dashboard
 * Displays URLs with their analysis status and performance metrics
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  TrashIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../../../components/Button';
import { cn } from '../../../utils/cn';
import type { DashboardURL } from '../types';

interface URLTableProps {
  urls: DashboardURL[];
  loading?: boolean;
  onView?: (url: DashboardURL) => void;
  onDelete?: (url: DashboardURL) => void;
  onCheck?: (url: DashboardURL) => void;
}

const getStatusIcon = (status: DashboardURL['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className='h-5 w-5 text-green-500' />;
    case 'failed':
      return <XCircleIcon className='h-5 w-5 text-red-500' />;
    case 'analyzing':
      return <ChartBarIcon className='h-5 w-5 text-blue-500' />;
    case 'pending':
      return <ClockIcon className='h-5 w-5 text-yellow-500' />;
    default:
      return <ClockIcon className='h-5 w-5 text-gray-400' />;
  }
};

const getStatusBadge = (status: DashboardURL['status']) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  switch (status) {
    case 'completed':
      return <span className={cn(baseClasses, 'bg-green-100 text-green-800')}>Completed</span>;
    case 'failed':
      return <span className={cn(baseClasses, 'bg-red-100 text-red-800')}>Failed</span>;
    case 'analyzing':
      return <span className={cn(baseClasses, 'bg-blue-100 text-blue-800')}>Analyzing</span>;
    case 'pending':
      return <span className={cn(baseClasses, 'bg-yellow-100 text-yellow-800')}>Pending</span>;
    default:
      return <span className={cn(baseClasses, 'bg-gray-100 text-gray-800')}>Unknown</span>;
  }
};

const formatLoadTime = (loadTime: number): string => {
  if (loadTime === 0) return '-';
  if (loadTime < 1) return `${Math.round(loadTime * 1000)}ms`;
  return `${loadTime.toFixed(2)}s`;
};

const formatPageSize = (pageSize: number): string => {
  if (pageSize === 0) return '-';
  if (pageSize < 1024) return `${pageSize}B`;
  if (pageSize < 1024 * 1024) return `${(pageSize / 1024).toFixed(1)}KB`;
  return `${(pageSize / (1024 * 1024)).toFixed(1)}MB`;
};

export const URLTable: React.FC<URLTableProps> = ({
  urls,
  loading = false,
  onView,
  onDelete,
  onCheck,
}) => {
  const navigate = useNavigate();

  const handleTitleClick = (url: DashboardURL) => {
    navigate(`/url-details/${url.id}`);
  };
  if (loading) {
    return (
      <div className='bg-white shadow rounded-lg'>
        <div className='px-4 py-5 sm:p-6'>
          <div className='animate-pulse space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-16 bg-gray-200 rounded' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className='bg-white shadow rounded-lg'>
        <div className='px-4 py-5 sm:p-6 text-center'>
          <ChartBarIcon className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-2 text-sm font-medium text-gray-900'>No URLs found</h3>
          <p className='mt-1 text-sm text-gray-500'>
            Get started by adding your first URL for analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg overflow-hidden'>
      <div className='px-4 py-5 sm:p-6'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  URL
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Performance
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Last Updated
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {urls.map(url => (
                <tr key={url.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0'>{getStatusIcon(url.status)}</div>
                      <div className='ml-4 min-w-0 flex-1'>
                        <div
                          className='text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors'
                          onClick={() => handleTitleClick(url)}
                          title='Click to view details'
                        >
                          {url.title || 'Untitled'}
                        </div>
                        <div className='flex items-center space-x-2'>
                          <div className='text-sm text-gray-500 truncate max-w-xs'>{url.url}</div>
                          <a
                            href={url.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-gray-400 hover:text-gray-600'
                            title='Open URL in new tab'
                          >
                            <ArrowTopRightOnSquareIcon className='h-4 w-4' />
                          </a>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex flex-col space-y-1'>
                      {getStatusBadge(url.status)}
                      {url.status_code > 0 && (
                        <span className='text-xs text-gray-500'>HTTP {url.status_code}</span>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {url.status === 'completed' ? (
                      <div className='space-y-1'>
                        <div>Load: {formatLoadTime(url.performance.load_time)}</div>
                        <div className='text-xs text-gray-500'>
                          Size: {formatPageSize(url.performance.page_size)}
                        </div>
                      </div>
                    ) : (
                      <span className='text-gray-400'>-</span>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {url.analyzed_at
                      ? formatDistanceToNow(new Date(url.analyzed_at), { addSuffix: true })
                      : formatDistanceToNow(new Date(url.created_at), { addSuffix: true })}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <div className='flex items-center justify-end space-x-2'>
                      {onView && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onView(url)}
                          title='View details'
                        >
                          <EyeIcon className='h-4 w-4' />
                        </Button>
                      )}

                      {onCheck && (url.status === 'pending' || url.status === 'failed') && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onCheck(url)}
                          title='Start analysis'
                        >
                          <PlayIcon className='h-4 w-4' />
                        </Button>
                      )}

                      {onDelete && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onDelete(url)}
                          className='text-red-600 hover:text-red-700'
                          title='Delete URL'
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
    </div>
  );
};
