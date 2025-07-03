/**
 * BrokenLinksCard component
 * Displays list of broken links found during analysis
 */

import React from 'react';
import { ExclamationTriangleIcon, XCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { DashboardURL } from '../types';

interface BrokenLinksCardProps {
  url: DashboardURL;
}

export const BrokenLinksCard: React.FC<BrokenLinksCardProps> = ({ url }) => {
  const { seo_analysis } = url;

  if (url.status !== 'completed' || seo_analysis.link_analysis.broken_links === 0) {
    return null;
  }

  return (
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <ExclamationTriangleIcon className='mr-1.5 h-4 w-4 text-red-500' />
          Broken Links ({seo_analysis.link_analysis.broken_links})
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        {seo_analysis.link_analysis.broken_links_list && seo_analysis.link_analysis.broken_links_list.length > 0 ? (
          <div className='space-y-2'>
            {seo_analysis.link_analysis.broken_links_list.map((link, index) => (
              <div key={index} className='flex items-center justify-between p-2 bg-red-50 rounded-md'>
                <div className='flex items-center space-x-2 min-w-0 flex-1'>
                  <XCircleIcon className='h-3 w-3 text-red-500 flex-shrink-0' />
                  <span className='text-xs text-gray-900 break-all'>{link}</span>
                </div>
                <a
                  href={link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-red-600 hover:text-red-800 flex-shrink-0 ml-2'
                  title='Open link in new tab'
                >
                  <ArrowTopRightOnSquareIcon className='h-3 w-3' />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-4'>
            <p className='text-xs text-gray-500'>
              {seo_analysis.link_analysis.broken_links} broken links detected, but details are not available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
