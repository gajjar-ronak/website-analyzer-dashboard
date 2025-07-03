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
  const baseClasses = 'inline-flex items-center py-1 px-2.5 rounded-full text-xs font-medium';

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
      <div className='bg-white shadow-sm rounded-lg border border-gray-200'>
        <div className='px-4 py-4 sm:px-6 sm:py-5'>
          <div className='animate-pulse space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='flex items-center space-x-4'>
                <div className='h-10 w-10 bg-gray-200 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-3/4' />
                  <div className='h-3 bg-gray-200 rounded w-1/2' />
                </div>
                <div className='h-8 w-20 bg-gray-200 rounded' />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className='bg-white shadow-sm rounded-lg border border-gray-200'>
        <div className='px-4 py-8 sm:px-6 sm:py-12 text-center'>
          <ChartBarIcon className='mx-auto h-12 w-12 text-gray-400' />
          <h3 className='mt-4 text-sm font-medium text-gray-900'>No URLs found</h3>
          <p className='mt-2 text-sm text-gray-500 max-w-sm mx-auto'>
            Get started by adding your first URL for analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                URL
              </th>
              <th className='hidden lg:table-cell px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Performance
              </th>
              <th className='hidden md:table-cell px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Last Updated
              </th>
              <th className='hidden sm:table-cell px-4 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th className='px-4 py-3 sm:px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {urls.map(url => (
              <tr key={url.id} className='hover:bg-gray-50 transition-colors'>
                <td className='px-4 py-4 sm:px-6'>
                  <div className='flex items-start space-x-3'>
                    <div className='flex-shrink-0 mt-1'>{getStatusIcon(url.status)}</div>
                    <div className='min-w-0 flex-1'>
                      <div
                        className='text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600 transition-colors break-words'
                        onClick={() => handleTitleClick(url)}
                        title='Click to view details'
                      >
                        {url.title || 'Untitled'}
                      </div>
                      <div className='flex items-center space-x-2 mt-1'>
                        <div className='text-sm text-gray-500 break-all'>{url.url}</div>
                        <a
                          href={url.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0'
                          title='Open URL in new tab'
                        >
                          <ArrowTopRightOnSquareIcon className='h-4 w-4' />
                        </a>
                      </div>
                      {/* Mobile status display */}
                      <div className='sm:hidden mt-2 flex items-center space-x-2'>
                        {getStatusBadge(url.status)}
                        {url.status_code > 0 && (
                          <span className='text-xs text-gray-500'>HTTP {url.status_code}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='hidden lg:table-cell px-4 py-4 sm:px-6 text-sm text-gray-900'>
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
                <td className='hidden md:table-cell px-4 py-4 sm:px-6 text-sm text-gray-500'>
                  {url.analyzed_at || url.created_at ? (
                    <>{new Date(url.analyzed_at || url.created_at).toLocaleString()} </>
                  ) : (
                    '-'
                  )}
                </td>
                <td className='hidden sm:table-cell px-4 py-4 sm:px-6'>
                  <div className='flex flex-col space-y-1'>
                    {getStatusBadge(url.status)}
                    {url.status_code > 0 && (
                      <span className='text-xs text-gray-500'>HTTP {url.status_code}</span>
                    )}
                  </div>
                </td>
                <td className='px-4 py-4 sm:px-6 text-right text-sm font-medium'>
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
  );
};

export default URLTable;
