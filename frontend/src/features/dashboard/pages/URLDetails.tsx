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
      <div className='min-h-screen bg-gray-50 py-4'>
        <div className='max-w-7xl mx-auto px-3 sm:px-4 lg:px-6'>
          <div className='text-center'>
            <ExclamationTriangleIcon className='mx-auto h-10 w-10 text-gray-400' />
            <h3 className='mt-1.5 text-xs font-medium text-gray-900'>URL not found</h3>
            <p className='mt-0.5 text-xs text-gray-500'>
              The URL you're looking for doesn't exist or has been deleted.
            </p>
            <div className='mt-4'>
              <Button size='sm' onClick={handleBack}>
                <ArrowLeftIcon className='mr-1.5 h-3.5 w-3.5' />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 sm:py-4 lg:py-2'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-4 sm:mb-4'>
          <Button
            variant='outline'
            onClick={handleBack}
            size='sm'
            className='flex items-center flex-shrink-0 mb-4'
          >
            <ArrowLeftIcon className='mr-2 h-3 w-3' />
            <span className='text-xs'>Back</span>
          </Button>

          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
            <div className='flex items-start space-x-2'>
              <div className='min-w-0 flex-1'>
                <h1 className='text-lg font-semibold text-gray-900 sm:text-xl break-words'>
                  {url.title || 'Untitled'}
                </h1>
                <div className='flex items-center space-x-1.5 mt-1.5'>
                  <p className='text-xs text-gray-600 break-all'>{url.url}</p>
                  <a
                    href={url.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0'
                    title='Open URL in new tab'
                  >
                    <ArrowTopRightOnSquareIcon className='h-3.5 w-3.5' />
                  </a>
                </div>
              </div>
            </div>

            <div className='flex items-center space-x-2 flex-shrink-0'>
              <StatusBadge status={url.status} />
              {(url.status === 'pending' || url.status === 'failed') && (
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeURLMutation.isPending}
                  size='sm'
                  className='flex items-center text-xs'
                >
                  <PlayIcon className='mr-1.5 h-3.5 w-3.5' />
                  {analyzeURLMutation.isPending ? 'Analyzing...' : 'Analyze'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-3 sm:space-y-4'>
            <OverviewCard url={url} />
            <SEOAnalysisCard url={url} />
            <HeadingTagsDetailCard url={url} />
            <BrokenLinksCard url={url} />
            <PerformanceCard url={url} />
          </div>

          {/* Sidebar */}
          <div className='space-y-3 sm:space-y-4'>
            <StatusCard url={url} />
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
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <GlobeAltIcon className='mr-1.5 h-4 w-4 text-gray-400' />
          Overview
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        <dl className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
          <div>
            <dt className='text-xs font-medium text-gray-500 mb-0.5'>Title</dt>
            <dd className='text-xs text-gray-900 break-words'>{url.title || 'No title'}</dd>
          </div>
          <div>
            <dt className='text-xs font-medium text-gray-500 mb-0.5'>Status Code</dt>
            <dd className='text-xs text-gray-900'>
              {url.status_code > 0 ? (
                <span
                  className={cn(
                    'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                    url.status_code >= 200 && url.status_code < 300
                      ? 'bg-green-100 text-green-800'
                      : url.status_code >= 300 && url.status_code < 400
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  )}
                >
                  HTTP {url.status_code}
                </span>
              ) : (
                'Not analyzed'
              )}
            </dd>
          </div>
          <div className='sm:col-span-2'>
            <dt className='text-xs font-medium text-gray-500 mb-0.5'>Description</dt>
            <dd className='text-xs text-gray-900 break-words'>
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
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <DocumentTextIcon className='mr-1.5 h-4 w-4 text-gray-400' />
          SEO Analysis
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        {url.status === 'completed' ? (
          <div className='space-y-4'>
            {/* Basic Meta Information */}
            <div className='space-y-3'>
              <div>
                <dt className='text-xs font-medium text-gray-500'>HTML Version</dt>
                <dd className='mt-0.5 text-xs text-gray-900'>
                  {seo_analysis.html_version || 'Unknown'}
                </dd>
              </div>
              <div>
                <dt className='text-xs font-medium text-gray-500'>Meta Title</dt>
                <dd className='mt-0.5 text-xs text-gray-900'>
                  {seo_analysis.meta_title || 'No meta title found'}
                </dd>
              </div>
              <div>
                <dt className='text-xs font-medium text-gray-500'>Meta Description</dt>
                <dd className='mt-0.5 text-xs text-gray-900'>
                  {seo_analysis.meta_description || 'No meta description found'}
                </dd>
              </div>
            </div>

            {/* Heading Tags Analysis */}
            <div>
              <h4 className='text-xs font-medium text-gray-900 mb-2'>Heading Tags</h4>
              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2'>
                {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map(tag => {
                  const countKey = `${tag}_count` as keyof typeof seo_analysis.heading_tags;
                  return (
                    <div key={tag} className='text-center p-2 bg-gray-50 rounded-md'>
                      <div className='text-sm font-semibold text-gray-900'>
                        {seo_analysis.heading_tags[countKey]}
                      </div>
                      <div className='text-[11px] text-gray-500'>{tag.toUpperCase()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Link Analysis */}
            <div>
              <h4 className='text-xs font-medium text-gray-900 mb-2'>Link Analysis</h4>
              <div className='grid grid-cols-2 lg:grid-cols-4 gap-2'>
                <div className='text-center p-2 bg-blue-50 rounded-md'>
                  <div className='text-sm font-semibold text-blue-900'>
                    {seo_analysis.link_analysis.total_links}
                  </div>
                  <div className='text-[11px] text-blue-600'>Total</div>
                </div>
                <div className='text-center p-2 bg-green-50 rounded-md'>
                  <div className='text-sm font-semibold text-green-900'>
                    {seo_analysis.link_analysis.internal_links}
                  </div>
                  <div className='text-[11px] text-green-600'>Internal</div>
                </div>
                <div className='text-center p-2 bg-purple-50 rounded-md'>
                  <div className='text-sm font-semibold text-purple-900'>
                    {seo_analysis.link_analysis.external_links}
                  </div>
                  <div className='text-[11px] text-purple-600'>External</div>
                </div>
                <div className='text-center p-2 bg-red-50 rounded-md'>
                  <div className='text-sm font-semibold text-red-900'>
                    {seo_analysis.link_analysis.broken_links}
                  </div>
                  <div className='text-[11px] text-red-600'>Broken</div>
                </div>
              </div>
            </div>

            {/* Form and Image Analysis */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <h4 className='text-xs font-medium text-gray-900 mb-2'>Forms</h4>
                <div className='space-y-1.5'>
                  <div className='flex items-center space-x-1.5'>
                    <span className='text-xs text-gray-500'>Total Forms:</span>
                    <span className='text-xs font-medium text-gray-900'>
                      {seo_analysis.form_analysis.form_count}
                    </span>
                  </div>
                  <div className='flex items-center space-x-1.5'>
                    <span className='text-xs text-gray-500'>Login Form:</span>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        seo_analysis.form_analysis.has_login_form
                          ? 'text-green-600'
                          : 'text-gray-500'
                      )}
                    >
                      {seo_analysis.form_analysis.has_login_form ? 'Detected' : 'Not Found'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className='text-xs font-medium text-gray-900 mb-2'>Images</h4>
                <div className='text-center p-2 bg-yellow-50 rounded-md'>
                  <div className='text-sm font-semibold text-yellow-900'>
                    {seo_analysis.image_count}
                  </div>
                  <div className='text-[11px] text-yellow-600'>Total Images</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center py-6'>
            <DocumentTextIcon className='mx-auto h-10 w-10 text-gray-400' />
            <h4 className='mt-1.5 text-xs font-medium text-gray-900'>No SEO data available</h4>
            <p className='mt-0.5 text-xs text-gray-500'>
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
    <div className='bg-white shadow rounded-md'>
      <div className='px-4 py-3 border-b border-gray-200'>
        <h3 className='text-sm font-medium text-gray-900 flex items-center'>
          <ChartBarIcon className='mr-1.5 h-4 w-4' />
          Performance Metrics
        </h3>
      </div>
      <div className='px-4 py-3'>
        {url.status === 'completed' ? (
          <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='text-center'>
              <dt className='text-xs font-medium text-gray-500 mb-1'>Load Time</dt>
              <dd className={cn('text-2xl font-bold', getLoadTimeColor(performance.load_time))}>
                {formatLoadTime(performance.load_time)}
              </dd>
              <div className='mt-1 text-[11px] text-gray-500'>
                {performance.load_time < 2
                  ? 'Excellent'
                  : performance.load_time < 4
                    ? 'Good'
                    : 'Needs improvement'}
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
    <div className='bg-white shadow rounded-md'>
      <div className='px-4 py-3 border-b border-gray-200'>
        <h3 className='text-sm font-medium text-gray-900 flex items-center'>
          <EyeIcon className='mr-1.5 h-4 w-4' />
          Status
        </h3>
      </div>
      <div className='px-4 py-3'>
        <div className='text-center'>
          <div className='flex justify-center mb-2'>{getStatusIcon(url.status)}</div>
          <h4 className='text-sm font-medium text-gray-900 capitalize'>{url.status}</h4>
          <p className='text-xs text-gray-500 mt-0.5'>{getStatusDescription(url.status)}</p>
          {url.status_code > 0 && (
            <div className='mt-3 p-2 bg-gray-50 rounded-md'>
              <div className='flex items-center justify-center'>
                <ServerIcon className='mr-1.5 h-4 w-4 text-gray-400' />
                <span className='text-xs font-medium text-gray-900'>HTTP {url.status_code}</span>
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
    <div className='bg-white shadow rounded-md'>
      <div className='px-4 py-3 border-b border-gray-200'>
        <h3 className='text-sm font-medium text-gray-900 flex items-center'>
          <TimeIcon className='mr-1.5 h-4 w-4' />
          Metadata
        </h3>
      </div>
      <div className='px-4 py-3'>
        <dl className='space-y-3'>
          <div>
            <dt className='text-xs font-medium text-gray-500'>Created</dt>
            <dd className='mt-0.5 text-xs text-gray-900'>
              {formatDistanceToNow(new Date(url.created_at), { addSuffix: true })}
            </dd>
            <dd className='text-[11px] text-gray-500'>
              {new Date(url.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className='text-xs font-medium text-gray-500'>Last Updated</dt>
            <dd className='mt-0.5 text-xs text-gray-900'>
              {formatDistanceToNow(new Date(url.updated_at), { addSuffix: true })}
            </dd>
            <dd className='text-[11px] text-gray-500'>
              {new Date(url.updated_at).toLocaleString()}
            </dd>
          </div>
          {url.analyzed_at && (
            <div>
              <dt className='text-xs font-medium text-gray-500'>Last Analyzed</dt>
              <dd className='mt-0.5 text-xs text-gray-900'>
                {formatDistanceToNow(new Date(url.analyzed_at), { addSuffix: true })}
              </dd>
              <dd className='text-[11px] text-gray-500'>
                {new Date(url.analyzed_at).toLocaleString()}
              </dd>
            </div>
          )}
          <div>
            <dt className='text-xs font-medium text-gray-500'>URL ID</dt>
            <dd className='mt-0.5 text-xs text-gray-900 font-mono'>#{url.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

// Heading Tags Detail Card Component
const HeadingTagsDetailCard: React.FC<{ url: DashboardURL }> = ({ url }) => {
  const { seo_analysis } = url;

  if (url.status !== 'completed') {
    return null;
  }

  const headingData = [
    {
      level: 'H1',
      tags: seo_analysis.heading_tags.h1_tags,
      count: seo_analysis.heading_tags.h1_count,
    },
    {
      level: 'H2',
      tags: seo_analysis.heading_tags.h2_tags,
      count: seo_analysis.heading_tags.h2_count,
    },
    {
      level: 'H3',
      tags: seo_analysis.heading_tags.h3_tags,
      count: seo_analysis.heading_tags.h3_count,
    },
    {
      level: 'H4',
      tags: seo_analysis.heading_tags.h4_tags,
      count: seo_analysis.heading_tags.h4_count,
    },
    {
      level: 'H5',
      tags: seo_analysis.heading_tags.h5_tags,
      count: seo_analysis.heading_tags.h5_count,
    },
    {
      level: 'H6',
      tags: seo_analysis.heading_tags.h6_tags,
      count: seo_analysis.heading_tags.h6_count,
    },
  ].filter(item => item.count > 0);

  if (headingData.length === 0) {
    return null;
  }

  return (
    <div className='bg-white shadow rounded-md'>
      <div className='px-4 py-3 border-b border-gray-200'>
        <h3 className='text-sm font-medium text-gray-900 flex items-center'>
          <DocumentTextIcon className='mr-1.5 h-4 w-4' />
          Heading Tags Content
        </h3>
      </div>
      <div className='px-4 py-3'>
        <div className='space-y-4'>
          {headingData.map(({ level, tags, count }) => (
            <div key={level}>
              <h4 className='text-xs font-medium text-gray-900 mb-1'>
                {level} Tags ({count})
              </h4>
              <div className='bg-gray-50 rounded-md p-2'>
                <p className='text-xs text-gray-700 whitespace-pre-wrap'>
                  {tags || `No ${level} tags found`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Broken Links Card Component
const BrokenLinksCard: React.FC<{ url: DashboardURL }> = ({ url }) => {
  const { seo_analysis } = url;

  if (url.status !== 'completed' || seo_analysis.link_analysis.broken_links === 0) {
    return null;
  }

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-medium text-gray-900 flex items-center'>
          <ExclamationTriangleIcon className='mr-2 h-5 w-5 text-red-500' />
          Broken Links ({seo_analysis.link_analysis.broken_links})
        </h3>
      </div>
      <div className='px-6 py-4'>
        {seo_analysis.link_analysis.broken_links_list &&
        seo_analysis.link_analysis.broken_links_list.length > 0 ? (
          <div className='space-y-2'>
            {seo_analysis.link_analysis.broken_links_list.map((link, index) => (
              <div
                key={index}
                className='flex items-center justify-between p-3 bg-red-50 rounded-lg'
              >
                <div className='flex items-center space-x-2'>
                  <XCircleIcon className='h-4 w-4 text-red-500' />
                  <span className='text-sm text-gray-900 break-all'>{link}</span>
                </div>
                <a
                  href={link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-red-600 hover:text-red-800'
                  title='Open link in new tab'
                >
                  <ArrowTopRightOnSquareIcon className='h-4 w-4' />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-4'>
            <p className='text-sm text-gray-500'>
              {seo_analysis.link_analysis.broken_links} broken links detected, but details are not
              available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default URLDetails;
