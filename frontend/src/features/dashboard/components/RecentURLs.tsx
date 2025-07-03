/**
 * RecentURLs component
 * Displays a list of recently added URLs with their status and analysis data
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardURL } from '../types';
import { cn } from '../../../utils/cn';

interface RecentURLsProps {
  urls: DashboardURL[];
  className?: string;
}

/**
 * Get status icon and styling based on URL status
 */
const getStatusDisplay = (status: DashboardURL['status']) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircleIcon,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Completed',
      };
    case 'pending':
      return {
        icon: ClockIcon,
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        label: 'Pending',
      };
    case 'analyzing':
      return {
        icon: ChartBarIcon,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'Analyzing',
      };
    case 'failed':
      return {
        icon: ExclamationTriangleIcon,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Failed',
      };
    default:
      return {
        icon: ClockIcon,
        iconColor: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: 'Unknown',
      };
  }
};

/**
 * Format load time for display
 */
const formatLoadTime = (loadTime: number): string => {
  if (loadTime === 0) return '-';
  if (loadTime < 1) return `${Math.round(loadTime * 1000)}ms`;
  return `${loadTime.toFixed(2)}s`;
};

/**
 * Format page size for display
 */
const formatPageSize = (pageSize: number): string => {
  if (pageSize === 0) return '-';
  if (pageSize < 1024) return `${pageSize}B`;
  if (pageSize < 1024 * 1024) return `${(pageSize / 1024).toFixed(1)}KB`;
  return `${(pageSize / (1024 * 1024)).toFixed(1)}MB`;
};

export const RecentURLs: React.FC<RecentURLsProps> = ({ urls, className }) => {
  const navigate = useNavigate();

  const handleTitleClick = (url: DashboardURL) => {
    navigate(`/url-details/${url.id}`);
  };
  return (
    <div className={cn('bg-white shadow rounded-lg', className)}>
      <div className='px-4 py-5 sm:p-6'>
        <h3 className='text-lg font-medium leading-6 text-gray-900 mb-4'>Recent URLs</h3>

        {urls.length > 0 ? (
          <div className='space-y-3'>
            {urls.map(url => {
              const statusDisplay = getStatusDisplay(url.status);
              const StatusIcon = statusDisplay.icon;

              return (
                <div
                  key={url.id}
                  className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                >
                  {/* Left side - Status and URL info */}
                  <div className='flex items-center space-x-3 flex-1 min-w-0'>
                    {/* Status indicator */}
                    <div className={`p-1.5 rounded-full ${statusDisplay.bgColor}`}>
                      <StatusIcon className={`h-4 w-4 ${statusDisplay.iconColor}`} />
                    </div>

                    {/* URL details */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center space-x-2'>
                        <p
                          className='text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors'
                          onClick={() => handleTitleClick(url)}
                          title='Click to view details'
                        >
                          {url.title || 'Untitled'}
                        </p>
                        <a
                          href={url.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors'
                          title='Open URL in new tab'
                        >
                          <ArrowTopRightOnSquareIcon className='h-3 w-3' />
                        </a>
                      </div>
                      <p className='text-xs text-gray-500 truncate'>{url.url}</p>
                      <div className='flex items-center space-x-4 mt-1'>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${statusDisplay.bgColor} ${statusDisplay.iconColor}`}
                        >
                          {statusDisplay.label}
                        </span>
                        {url.status_code > 0 && (
                          <span className='text-xs text-gray-500'>Status: {url.status_code}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Performance metrics */}
                  <div className='text-right flex-shrink-0 ml-4'>
                    {url.status === 'completed' && (
                      <div className='space-y-1'>
                        <p className='text-sm text-gray-900'>
                          {formatLoadTime(url.performance.load_time)}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {formatPageSize(url.performance.page_size)}
                        </p>
                      </div>
                    )}

                    {/* Time since creation/analysis */}
                    <p className='text-xs text-gray-400 mt-1'>
                      {url.analyzed_at
                        ? `Analyzed ${formatDistanceToNow(new Date(url.analyzed_at), { addSuffix: true })}`
                        : `Added ${formatDistanceToNow(new Date(url.created_at), { addSuffix: true })}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='text-center py-8'>
            <ChartBarIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>No URLs yet</h3>
            <p className='mt-1 text-sm text-gray-500'>
              Get started by adding your first URL for analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
