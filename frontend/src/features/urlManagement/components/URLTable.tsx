import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';
import { formatDateTime, formatRelativeTime } from '../../../utils/formatDate';
import { cn } from '../../../utils/cn';
import type { DashboardURL } from '../../dashboard/types';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

interface URLTableProps {
  urls: DashboardURL[];
  loading?: boolean;
  selectedIds?: number[];
  analyzingIds?: number[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onView?: (url: DashboardURL) => void;
  onEdit?: (url: DashboardURL) => void;
  onDelete?: (url: DashboardURL) => void;
  onCheck?: (url: DashboardURL) => void;
  onSelectUrl?: (id: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onSort?: (field: string) => void;
}

const getStatusIcon = (status: DashboardURL['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className='h-5 w-5 text-green-500' />;
    case 'failed':
      return <XCircleIcon className='h-5 w-5 text-red-500' />;
    case 'analyzing':
      return <ClockIcon className='h-5 w-5 text-blue-500' />;
    case 'pending':
      return <ClockIcon className='h-5 w-5 text-yellow-500' />;
    default:
      return <ClockIcon className='h-5 w-5 text-gray-400' />;
  }
};

const getStatusBadge = (status: DashboardURL['status']) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text[10px]';

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

const URLTable: React.FC<URLTableProps> = ({
  urls,
  loading = false,
  selectedIds = [],
  analyzingIds = [],
  sortBy,
  sortOrder,
  onView,
  onEdit,
  onDelete,
  onCheck,
  onSelectUrl,
  onSelectAll,
  onSort,
}) => {
  const allSelected = urls.length > 0 && selectedIds.length === urls.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < urls.length;

  const getSortIcons = (field: string) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? (
        <ArrowUpIcon className='h-4 w-4 text-blue-500 inline' />
      ) : (
        <ArrowDownIcon className='h-4 w-4 text-blue-500 inline' />
      );
    }
    // Show both faded icons for inactive columns with spacing
    return (
      <span className='flex flex-col ml-1 items-center'>
        <ArrowUpIcon className='h-3 w-3 text-gray-300 mb-0.5' />
        <ArrowDownIcon className='h-3 w-3 text-gray-300 mt-0.5' />
      </span>
    );
  };

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };
  if (loading) {
    return (
      <div className='animate-pulse' data-testid='loading-spinner'>
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
      <div className='bg-white shadow rounded-lg' data-testid='empty-state'>
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
          <h3 className='mt-2 text-sm font-medium text-gray-900'>No URLs found</h3>
          <p className='mt-1 text-sm text-gray-500' data-testid='empty-state-description'>
            Get started by adding your first URL to monitor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg overflow-hidden' data-testid='url-table-container'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200 text-xs' data-testid='url-table'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[12px]'>
                <input
                  type='checkbox'
                  className='h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={e => onSelectAll?.(e.target.checked)}
                  data-testid='select-all-checkbox'
                />
              </th>
              <th
                className='px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 text-[12px]'
                onClick={() => handleSort('title')}
                data-testid='table-header'
              >
                <div className='flex items-center space-x-1'>
                  <span>URL</span>
                  {getSortIcons('title')}
                </div>
              </th>
              <th
                className='px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[12px]'
                data-testid='table-header'
              >
                HTML Version
              </th>
              <th
                className='px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[12px]'
                data-testid='table-header'
              >
                Internal Links
              </th>
              <th
                className='px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[12px]'
                data-testid='table-header'
              >
                External Links
              </th>
              <th
                className='px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 text-[12px]'
                onClick={() => handleSort('status')}
                data-testid='table-header'
              >
                <div className='flex items-center space-x-1'>
                  <span>Status</span>
                  {getSortIcons('status')}
                </div>
              </th>
              {/* <th
                className='px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 text-[12px]'
                onClick={() => handleSort('analyzed_at')}
              >
                <div className='flex items-center space-x-1'>
                  <span>Last Checked</span>
                  {getSortIcons('analyzed_at')}
                </div>
              </th> */}
              <th
                className='px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[12px]'
                data-testid='table-header'
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200 text-xs'>
            {urls.map(url => (
              <tr key={url.id} className='hover:bg-gray-50' data-testid='url-row'>
                <td className='px-2 py-2 whitespace-nowrap'>
                  <input
                    type='checkbox'
                    className='h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    checked={selectedIds.includes(url.id)}
                    onChange={e => onSelectUrl?.(url.id, e.target.checked)}
                    data-testid='url-checkbox'
                  />
                </td>
                <td className='px-2 py-2'>
                  <div className='flex flex-col'>
                    <button
                      onClick={() => onView?.(url)}
                      className='text-xs font-medium text-blue-600 hover:text-blue-800 truncate max-w-xs text-left'
                      data-testid='url-title'
                    >
                      {url.title}
                    </button>
                    <div className='text-xs text-gray-500 truncate max-w-xs' data-testid='url-link'>
                      {url.url}
                    </div>
                    {url.description && (
                      <div className='text-[10px] text-gray-400 truncate max-w-xs mt-0.5'>
                        {url.description}
                      </div>
                    )}
                  </div>
                </td>
                <td
                  className='px-2 py-2 whitespace-nowrap text-xs text-gray-900'
                  data-testid='html-version'
                >
                  {url.seo_analysis?.html_version || '-'}
                </td>
                <td
                  className='px-2 py-2 whitespace-nowrap text-xs text-gray-900'
                  data-testid='internal-links'
                >
                  {url.seo_analysis?.link_analysis?.internal_links || 0}
                </td>
                <td
                  className='px-2 py-2 whitespace-nowrap text-xs text-gray-900'
                  data-testid='external-links'
                >
                  {url.seo_analysis?.link_analysis?.external_links || 0}
                </td>
                <td className='px-2 py-2 whitespace-nowrap' data-testid='url-status'>
                  <div className='flex items-center'>
                    {getStatusIcon(url.status)}
                    <div className='ml-2' data-testid='status-badge'>
                      {getStatusBadge(url.status)}
                    </div>
                  </div>
                </td>
                {/* <td className='px-2 py-2 whitespace-nowrap text-xs text-gray-500'>
                  <div className='flex flex-col'>
                    <span>
                      {url.analyzed_at ? formatRelativeTime(new Date(url.analyzed_at)) : 'Never'}
                    </span>
                    {url.analyzed_at && (
                      <span className='text-[10px] text-gray-400'>
                        {formatDateTime(new Date(url.analyzed_at))}
                      </span>
                    )}
                  </div>
                </td> */}
                <td className='px-2 py-2 whitespace-nowrap text-xs font-medium'>
                  <div className='flex items-center space-x-1'>
                    {onCheck && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onCheck(url)}
                        disabled={analyzingIds.includes(url.id) || url.status === 'analyzing'}
                        className='text-blue-400 hover:text-blue-600 disabled:opacity-50'
                        data-testid='analyze-url-button'
                      >
                        {analyzingIds.includes(url.id) || url.status === 'analyzing' ? (
                          <div className='flex items-center space-x-1'>
                            <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600' />
                          </div>
                        ) : (
                          <PlayIcon className='h-4 w-4' />
                        )}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onDelete(url)}
                        className='text-red-400 hover:text-red-600'
                        data-testid='delete-url-button'
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
