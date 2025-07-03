/**
 * PerformanceCard component
 * Displays website performance metrics including load time and page size
 */

import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import type { DashboardURL } from '../types';

interface PerformanceCardProps {
  url: DashboardURL;
}

// Helper functions for formatting
const formatLoadTime = (seconds: number): string => {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`;
  }
  return `${seconds.toFixed(2)}s`;
};

const formatPageSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ url }) => {
  const { performance } = url;

  return (
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <ChartBarIcon className='mr-1.5 h-4 w-4 text-gray-400' />
          Performance
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        {url.status === 'completed' ? (
          <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='text-center'>
              <dt className='text-xs font-medium text-gray-500 mb-1'>Load Time</dt>
              <dd className='text-2xl font-bold text-green-600'>
                {formatLoadTime(performance.load_time)}
              </dd>
              <div className='mt-1 text-[11px] text-gray-500'>
                {performance.load_time < 2
                  ? 'Excellent'
                  : performance.load_time < 4
                    ? 'Good'
                    : performance.load_time < 6
                      ? 'Fair'
                      : 'Slow'}
              </div>
            </div>
            <div className='text-center'>
              <dt className='text-xs font-medium text-gray-500 mb-1'>Page Size</dt>
              <dd className='text-2xl font-bold text-blue-600'>
                {formatPageSize(performance.page_size)}
              </dd>
              <div className='mt-1 text-[11px] text-gray-500'>
                {performance.page_size < 1024 * 1024
                  ? 'Optimized'
                  : performance.page_size < 5 * 1024 * 1024
                    ? 'Acceptable'
                    : 'Large'}
              </div>
            </div>
          </dl>
        ) : (
          <div className='text-center py-6'>
            <ChartBarIcon className='mx-auto h-10 w-10 text-gray-400' />
            <h4 className='mt-1.5 text-xs font-medium text-gray-900'>
              No performance data available
            </h4>
            <p className='mt-0.5 text-xs text-gray-500'>
              {url.status === 'pending' || url.status === 'analyzing'
                ? 'Analysis in progress...'
                : 'Run analysis to see performance metrics'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
