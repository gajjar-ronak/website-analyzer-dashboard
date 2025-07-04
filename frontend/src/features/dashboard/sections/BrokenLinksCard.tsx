/**
 * BrokenLinksCard component
 * Displays list of broken links found during analysis
 */

import React from 'react';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import type { DashboardURL } from '../types';

interface BrokenLinksCardProps {
  url: DashboardURL;
}

export const BrokenLinksCard: React.FC<BrokenLinksCardProps> = ({ url }) => {
  const { seo_analysis } = url;

  if (url.status !== 'completed' || seo_analysis.link_analysis.broken_links === 0) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('URL copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy URL');
      });
  };

  const getStatusCodeColor = (statusCode: number) => {
    if (statusCode === 0) return 'text-gray-600'; // Network error
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600'; // Client error
    if (statusCode >= 500) return 'text-red-600'; // Server error
    return 'text-gray-600';
  };

  const getStatusCodeText = (statusCode: number, error?: string) => {
    if (statusCode === 0 && error) return 'Network Error';
    if (statusCode === 0) return 'Unknown Error';
    return `HTTP ${statusCode}`;
  };

  return (
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <ExclamationTriangleIcon className='mr-1.5 h-4 w-4 text-red-500' />
          Broken Links ({seo_analysis.link_analysis.broken_links})
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        {seo_analysis.link_analysis.broken_links_list &&
        seo_analysis.link_analysis.broken_links_list.length > 0 ? (
          <div className='space-y-3'>
            {seo_analysis.link_analysis.broken_links_list.map((brokenLink, index) => (
              <div key={index} className='p-3 bg-red-50 rounded-md border border-red-100'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-start space-x-2 min-w-0 flex-1'>
                    <XCircleIcon className='h-4 w-4 text-red-500 flex-shrink-0 mt-0.5' />
                    <div className='min-w-0 flex-1'>
                      <div className='text-xs text-gray-900 break-all font-medium mb-1'>
                        {brokenLink.url}
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`text-xs font-medium ${getStatusCodeColor(brokenLink.status_code)}`}
                        >
                          {getStatusCodeText(brokenLink.status_code, brokenLink.error)}
                        </span>
                        {brokenLink.error && brokenLink.status_code === 0 && (
                          <span className='text-xs text-gray-500' title={brokenLink.error}>
                            (
                            {brokenLink.error.length > 50
                              ? brokenLink.error.substring(0, 50) + '...'
                              : brokenLink.error}
                            )
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(brokenLink.url)}
                    className='text-red-600 hover:text-red-800 flex-shrink-0 ml-2 p-1 rounded hover:bg-red-100 transition-colors'
                    title='Copy URL to clipboard'
                  >
                    <ClipboardDocumentIcon className='h-3 w-3' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-4'>
            <p className='text-xs text-gray-500'>
              {seo_analysis.link_analysis.broken_links} broken links detected, but details are not
              available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
