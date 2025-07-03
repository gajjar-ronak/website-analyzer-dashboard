/**
 * URL Details Page Component
 * Displays comprehensive analysis data for a specific URL
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  GlobeAltIcon,
  EyeIcon,
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon,
  ClockIcon as TimeIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useURL, useAnalyzeURL } from '../hooks';
import { Button } from '../../../components/Button';
import { cn } from '../../../utils/cn';
import type { DashboardURL } from '../types';

const URLDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const urlId = id ? parseInt(id, 10) : 0;

  const { data: url, isLoading, error } = useURL(urlId);
  const analyzeURLMutation = useAnalyzeURL();

  const handleAnalyze = () => {
    if (url) {
      analyzeURLMutation.mutate(url.id);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='animate-pulse space-y-6'>
            <div className='h-8 bg-gray-200 rounded w-1/4'></div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2 space-y-6'>
                <div className='h-64 bg-gray-200 rounded-lg'></div>
                <div className='h-48 bg-gray-200 rounded-lg'></div>
              </div>
              <div className='space-y-6'>
                <div className='h-32 bg-gray-200 rounded-lg'></div>
                <div className='h-48 bg-gray-200 rounded-lg'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <ExclamationTriangleIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>URL not found</h3>
            <p className='mt-1 text-sm text-gray-500'>
              The URL you're looking for doesn't exist or has been deleted.
            </p>
            <div className='mt-6'>
              <Button onClick={handleBack}>
                <ArrowLeftIcon className='mr-2 h-4 w-4' />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Button variant='outline' onClick={handleBack} className='flex items-center'>
                <ArrowLeftIcon className='mr-2 h-4 w-4' />
                Back
              </Button>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>{url.title || 'Untitled'}</h1>
                <div className='flex items-center space-x-2 mt-1'>
                  <p className='text-sm text-gray-500 break-all'>{url.url}</p>
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
            <div className='flex items-center space-x-3'>
              <StatusBadge status={url.status} />
              {(url.status === 'pending' || url.status === 'failed') && (
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeURLMutation.isPending}
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
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Overview Card */}
            <OverviewCard url={url} />

            {/* SEO Analysis Card */}
            <SEOAnalysisCard url={url} />

            {/* Performance Card */}
            <PerformanceCard url={url} />
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
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

// Status Badge Component
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
          icon: ChartBarIcon,
          text: 'Analyzing',
          className: 'bg-blue-100 text-blue-800',
          iconClassName: 'text-blue-500',
        };
      case 'pending':
        return {
          icon: ClockIcon,
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800',
          iconClassName: 'text-yellow-500',
        };
      default:
        return {
          icon: ClockIcon,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800',
          iconClassName: 'text-gray-500',
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

// Overview Card Component
const OverviewCard: React.FC<{ url: DashboardURL }> = ({ url }) => {
  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <GlobeAltIcon className='mr-2 h-5 w-5' />
          Overview
        </h3>
      </div>
      <div className='px-6 py-4'>
        <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <dt className='text-sm font-medium text-gray-500'>Title</dt>
            <dd className='mt-1 text-sm text-gray-900'>{url.title || 'No title'}</dd>
          </div>
          <div>
            <dt className='text-sm font-medium text-gray-500'>Status Code</dt>
            <dd className='mt-1 text-sm text-gray-900'>
              {url.status_code > 0 ? `HTTP ${url.status_code}` : 'Not analyzed'}
            </dd>
          </div>
          <div className='sm:col-span-2'>
            <dt className='text-sm font-medium text-gray-500'>Description</dt>
            <dd className='mt-1 text-sm text-gray-900'>
              {url.description || 'No description available'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

// SEO Analysis Card Component
const SEOAnalysisCard: React.FC<{ url: DashboardURL }> = ({ url }) => {
  const { seo_analysis } = url;

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <DocumentTextIcon className='mr-2 h-5 w-5' />
          SEO Analysis
        </h3>
      </div>
      <div className='px-6 py-4'>
        {url.status === 'completed' ? (
          <dl className='space-y-4'>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Meta Title</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {seo_analysis.meta_title || 'No meta title found'}
              </dd>
            </div>
            <div>
              <dt className='text-sm font-medium text-gray-500'>Meta Description</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {seo_analysis.meta_description || 'No meta description found'}
              </dd>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <dt className='text-sm font-medium text-gray-500'>H1 Tags</dt>
                <dd className='mt-1 text-sm text-gray-900'>
                  {seo_analysis.h1_tags || 'No H1 tags found'}
                </dd>
              </div>
              <div>
                <dt className='text-sm font-medium text-gray-500'>H2 Tags</dt>
                <dd className='mt-1 text-sm text-gray-900'>
                  {seo_analysis.h2_tags || 'No H2 tags found'}
                </dd>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-center'>
                <PhotoIcon className='mr-2 h-5 w-5 text-gray-400' />
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Images</dt>
                  <dd className='text-sm text-gray-900'>{seo_analysis.image_count}</dd>
                </div>
              </div>
              <div className='flex items-center'>
                <LinkIcon className='mr-2 h-5 w-5 text-gray-400' />
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Links</dt>
                  <dd className='text-sm text-gray-900'>{seo_analysis.link_count}</dd>
                </div>
              </div>
            </div>
          </dl>
        ) : (
          <div className='text-center py-8'>
            <DocumentTextIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h4 className='mt-2 text-sm font-medium text-gray-900'>No SEO data available</h4>
            <p className='mt-1 text-sm text-gray-500'>
              {url.status === 'pending' || url.status === 'analyzing'
                ? 'Analysis in progress...'
                : 'Run analysis to see SEO data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Performance Card Component
const PerformanceCard: React.FC<{ url: DashboardURL }> = ({ url }) => {
  const { performance } = url;

  const formatLoadTime = (loadTime: number): string => {
    if (loadTime === 0) return 'Not measured';
    if (loadTime < 1) return `${Math.round(loadTime * 1000)}ms`;
    return `${loadTime.toFixed(2)}s`;
  };

  const formatPageSize = (pageSize: number): string => {
    if (pageSize === 0) return 'Not measured';
    if (pageSize < 1024) return `${pageSize}B`;
    if (pageSize < 1024 * 1024) return `${(pageSize / 1024).toFixed(1)}KB`;
    return `${(pageSize / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getLoadTimeColor = (loadTime: number): string => {
    if (loadTime === 0) return 'text-gray-500';
    if (loadTime < 2) return 'text-green-600';
    if (loadTime < 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <ChartBarIcon className='mr-2 h-5 w-5' />
          Performance Metrics
        </h3>
      </div>
      <div className='px-6 py-4'>
        {url.status === 'completed' ? (
          <dl className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <div className='text-center'>
              <dt className='text-sm font-medium text-gray-500 mb-2'>Load Time</dt>
              <dd className={cn('text-3xl font-bold', getLoadTimeColor(performance.load_time))}>
                {formatLoadTime(performance.load_time)}
              </dd>
              <div className='mt-2 text-xs text-gray-500'>
                {performance.load_time < 2
                  ? 'Excellent'
                  : performance.load_time < 4
                    ? 'Good'
                    : 'Needs improvement'}
              </div>
            </div>
            <div className='text-center'>
              <dt className='text-sm font-medium text-gray-500 mb-2'>Page Size</dt>
              <dd className='text-3xl font-bold text-blue-600'>
                {formatPageSize(performance.page_size)}
              </dd>
              <div className='mt-2 text-xs text-gray-500'>
                {performance.page_size < 1024 * 1024
                  ? 'Optimized'
                  : performance.page_size < 5 * 1024 * 1024
                    ? 'Acceptable'
                    : 'Large'}
              </div>
            </div>
          </dl>
        ) : (
          <div className='text-center py-8'>
            <ChartBarIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h4 className='mt-2 text-sm font-medium text-gray-900'>
              No performance data available
            </h4>
            <p className='mt-1 text-sm text-gray-500'>
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

// Status Card Component
const StatusCard: React.FC<{ url: DashboardURL }> = ({ url }) => {
  const getStatusIcon = (status: DashboardURL['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className='h-8 w-8 text-green-500' />;
      case 'failed':
        return <XCircleIcon className='h-8 w-8 text-red-500' />;
      case 'analyzing':
        return <ChartBarIcon className='h-8 w-8 text-blue-500' />;
      case 'pending':
        return <ClockIcon className='h-8 w-8 text-yellow-500' />;
      default:
        return <ClockIcon className='h-8 w-8 text-gray-400' />;
    }
  };

  const getStatusDescription = (status: DashboardURL['status']) => {
    switch (status) {
      case 'completed':
        return 'Analysis completed successfully';
      case 'failed':
        return 'Analysis failed to complete';
      case 'analyzing':
        return 'Analysis is currently in progress';
      case 'pending':
        return 'Waiting for analysis to start';
      default:
        return 'Status unknown';
    }
  };

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <EyeIcon className='mr-2 h-5 w-5' />
          Status
        </h3>
      </div>
      <div className='px-6 py-4'>
        <div className='text-center'>
          <div className='flex justify-center mb-3'>{getStatusIcon(url.status)}</div>
          <h4 className='text-lg font-medium text-gray-900 capitalize'>{url.status}</h4>
          <p className='text-sm text-gray-500 mt-1'>{getStatusDescription(url.status)}</p>
          {url.status_code > 0 && (
            <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center justify-center'>
                <ServerIcon className='mr-2 h-5 w-5 text-gray-400' />
                <span className='text-sm font-medium text-gray-900'>HTTP {url.status_code}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Metadata Card Component
const MetadataCard: React.FC<{ url: DashboardURL }> = ({ url }) => {
  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <TimeIcon className='mr-2 h-5 w-5' />
          Metadata
        </h3>
      </div>
      <div className='px-6 py-4'>
        <dl className='space-y-4'>
          <div>
            <dt className='text-sm font-medium text-gray-500'>Created</dt>
            <dd className='mt-1 text-sm text-gray-900'>
              {formatDistanceToNow(new Date(url.created_at), { addSuffix: true })}
            </dd>
            <dd className='text-xs text-gray-500'>{new Date(url.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className='text-sm font-medium text-gray-500'>Last Updated</dt>
            <dd className='mt-1 text-sm text-gray-900'>
              {formatDistanceToNow(new Date(url.updated_at), { addSuffix: true })}
            </dd>
            <dd className='text-xs text-gray-500'>{new Date(url.updated_at).toLocaleString()}</dd>
          </div>
          {url.analyzed_at && (
            <div>
              <dt className='text-sm font-medium text-gray-500'>Last Analyzed</dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {formatDistanceToNow(new Date(url.analyzed_at), { addSuffix: true })}
              </dd>
              <dd className='text-xs text-gray-500'>
                {new Date(url.analyzed_at).toLocaleString()}
              </dd>
            </div>
          )}
          <div>
            <dt className='text-sm font-medium text-gray-500'>URL ID</dt>
            <dd className='mt-1 text-sm text-gray-900 font-mono'>#{url.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default URLDetails;
