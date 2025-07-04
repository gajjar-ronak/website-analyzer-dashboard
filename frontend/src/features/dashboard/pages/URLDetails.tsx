/**
 * URLDetails page component
 * Displays comprehensive analysis details for a specific URL
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { useURL, useAnalyzeURL } from '../../../hooks';
import { Button } from '../../../components/Button';
import { cn } from '../../../utils/cn';
import {
  OverviewCard,
  SEOAnalysisCard,
  HeadingTagsDetailCard,
  BrokenLinksCard,
  PerformanceCard,
  StatusCard,
  MetadataCard,
} from '../sections';
import type { DashboardURL } from '../types';

const URLDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const urlId = parseInt(id || '0', 10);

  const { data: url, isLoading, error } = useURL(urlId);
  const analyzeURLMutation = useAnalyzeURL();

  const handleBack = () => {
    navigate(-1);
  };

  const handleAnalyze = () => {
    if (url) {
      analyzeURLMutation.mutate(url.id);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='animate-pulse space-y-6'>
            <div className='h-8 bg-gray-200 rounded w-1/4' />
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2 space-y-6'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='h-64 bg-gray-200 rounded' />
                ))}
              </div>
              <div className='space-y-6'>
                {[...Array(2)].map((_, i) => (
                  <div key={i} className='h-32 bg-gray-200 rounded' />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className='min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center py-12'>
            <XCircleIcon className='mx-auto h-12 w-12 text-red-500' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>URL not found</h3>
            <p className='mt-1 text-sm text-gray-500'>
              The URL you're looking for doesn't exist or has been deleted.
            </p>
            <div className='mt-6'>
              <Button onClick={handleBack} variant='outline'>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6 sm:mb-8'>
          <Button
            variant='outline'
            onClick={handleBack}
            size='sm'
            className='flex mb-4 items-center flex-shrink-0'
          >
            <ArrowLeftIcon className='mr-2 h-4 w-4' />
            Back
          </Button>
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
            <div className='flex items-start space-x-4'>
              <div className='min-w-0 flex-1'>
                <h1 className='text-xl font-semibold text-gray-900 sm:text-2xl break-words'>
                  {url.title || 'Untitled'}
                </h1>
                <div className='flex items-center space-x-2 mt-2'>
                  <p className='text-sm text-gray-600 break-all'>{url.url}</p>
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
              </div>
            </div>
            <div className='flex items-center space-x-3 flex-shrink-0'>
              {(url.status === 'pending' || url.status === 'failed') && (
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeURLMutation.isPending}
                  size='sm'
                  className='flex items-center'
                >
                  <PlayIcon className='mr-2 h-4 w-4' />
                  {analyzeURLMutation.isPending ? 'Analyzing...' : 'Analyze'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-4 sm:space-y-6'>
            {/* Overview Card */}
            <OverviewCard url={url} />

            {/* SEO Analysis Card */}
            <SEOAnalysisCard url={url} />

            {/* Detailed Heading Tags */}
            <HeadingTagsDetailCard url={url} />

            {/* Broken Links Card */}
            <BrokenLinksCard url={url} />

            {/* Performance Card */}
            <PerformanceCard url={url} />
          </div>

          {/* Sidebar */}
          <div className='space-y-4 sm:space-y-6'>
            {/* Status Card */}
            <StatusCard url={url} />

            {/* Metadata Card */}
            <MetadataCard url={url} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component (used in URLDetails header)
const StatusBadge: React.FC<{ status: DashboardURL['status'] }> = ({ status }) => {
  const getStatusConfig = (status: DashboardURL['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircleIcon,
          text: 'Completed',
          className: 'bg-green-100 text-green-800',
          iconClassName: 'text-green-500',
        };
      case 'failed':
        return {
          icon: XCircleIcon,
          text: 'Failed',
          className: 'bg-red-100 text-red-800',
          iconClassName: 'text-red-500',
        };
      case 'analyzing':
        return {
          icon: ClockIcon,
          text: 'Analyzing',
          className: 'bg-blue-100 text-blue-800',
          iconClassName: 'text-blue-500',
        };
      case 'pending':
      default:
        return {
          icon: ExclamationTriangleIcon,
          text: 'Pending',
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
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        config.className
      )}
    >
      <Icon className={cn('mr-1.5 h-4 w-4', config.iconClassName)} />
      {config.text}
    </span>
  );
};

export default URLDetails;
