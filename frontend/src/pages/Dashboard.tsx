import React, { useState } from 'react';
import {
  GlobeAltIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useDashboardData } from '../hooks';
import { RecentURLs, AddURLDialog } from '../features/dashboard/components';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Button } from '../components/Button';

/**
 * Dashboard component
 * Displays overview statistics and recent URLs with real-time data
 */
const Dashboard: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: dashboardData, isLoading, error } = useDashboardData();

  const handleAddURLSuccess = () => {
    // Dialog will close automatically, no additional action needed
    console.log('URL added successfully from dashboard');
  };

  // Prepare stats data from API response
  const stats = React.useMemo(() => {
    if (!dashboardData?.stats) {
      return [
        {
          name: 'Total URLs',
          value: 0,
          icon: GlobeAltIcon,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          name: 'Completed',
          value: 0,
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
        {
          name: 'Pending',
          value: 0,
          icon: ClockIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        },
        {
          name: 'Failed',
          value: 0,
          icon: ExclamationTriangleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        },
      ];
    }

    const { stats: apiStats } = dashboardData;

    return [
      {
        name: 'Total URLs',
        value: apiStats.total_urls,
        icon: GlobeAltIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        name: 'Completed',
        value: apiStats.completed_urls,
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        name: 'Pending',
        value: apiStats.pending_urls,
        icon: ClockIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      },
      {
        name: 'Failed',
        value: apiStats.failed_urls,
        icon: ExclamationTriangleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
    ];
  }, [dashboardData?.stats]);

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-4' />
          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='h-8 w-8 bg-gray-200 rounded' />
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
                      <div className='h-6 bg-gray-200 rounded w-1/2' />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Recent URLs loading skeleton */}
          <div className='bg-white shadow rounded-lg mt-6'>
            <div className='px-4 py-5 sm:p-6'>
              <div className='h-6 bg-gray-200 rounded w-1/4 mb-4' />
              <div className='space-y-3'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='h-16 bg-gray-100 rounded-lg' />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='space-y-6'>
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <ExclamationTriangleIcon className='h-5 w-5 text-red-400' />
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>Failed to load dashboard data</h3>
              <div className='mt-2 text-sm text-red-700'>
                <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className='space-y-3 sm:space-y-4'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <h1 className='text-lg font-semibold text-gray-900 sm:text-xl'>Dashboard</h1>
            <p className='mt-0.5 text-xs text-gray-600'>
              Overview of your website analysis and monitoring
            </p>
          </div>
          <div className='flex-shrink-0'>
            <Button
              onClick={() => setShowAddDialog(true)}
              size='sm'
              className='inline-flex items-center text-xs'
            >
              <PlusIcon className='mr-1.5 h-3.5 w-3.5' />
              Add URL
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map(stat => (
            <div
              key={stat.name}
              className='bg-white overflow-hidden shadow-sm rounded-md border border-gray-200'
            >
              <div className='p-3 sm:p-4'>
                <div className='flex items-center'>
                  <div className='flex-shrink-0'>
                    <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className='ml-3 w-0 flex-1'>
                    <dl>
                      <dt className='text-xs font-medium text-gray-500 truncate'>{stat.name}</dt>
                      <dd className='text-base font-semibold text-gray-900'>{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent URLs */}
        <ErrorBoundary>
          <RecentURLs urls={dashboardData?.recentURLs || []} />
        </ErrorBoundary>

        {/* Add URL Dialog */}
        <AddURLDialog
          isOpen={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={handleAddURLSuccess}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
