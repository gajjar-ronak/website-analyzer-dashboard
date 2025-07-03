/**
 * HeadingTagsDetailCard component
 * Displays detailed content of heading tags (H1-H6)
 */

import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import type { DashboardURL } from '../types';

interface HeadingTagsDetailCardProps {
  url: DashboardURL;
}

export const HeadingTagsDetailCard: React.FC<HeadingTagsDetailCardProps> = ({ url }) => {
  const { seo_analysis } = url;

  if (url.status !== 'completed') {
    return null;
  }

  const headingData = [
    { level: 'H1', tags: seo_analysis.heading_tags.h1_tags, count: seo_analysis.heading_tags.h1_count },
    { level: 'H2', tags: seo_analysis.heading_tags.h2_tags, count: seo_analysis.heading_tags.h2_count },
    { level: 'H3', tags: seo_analysis.heading_tags.h3_tags, count: seo_analysis.heading_tags.h3_count },
    { level: 'H4', tags: seo_analysis.heading_tags.h4_tags, count: seo_analysis.heading_tags.h4_count },
    { level: 'H5', tags: seo_analysis.heading_tags.h5_tags, count: seo_analysis.heading_tags.h5_count },
    { level: 'H6', tags: seo_analysis.heading_tags.h6_tags, count: seo_analysis.heading_tags.h6_count },
  ].filter(item => item.count > 0);

  if (headingData.length === 0) {
    return null;
  }

  return (
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <DocumentTextIcon className='mr-1.5 h-4 w-4 text-gray-400' />
          Heading Tags Content
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        <div className='space-y-4'>
          {headingData.map(({ level, tags, count }) => (
            <div key={level}>
              <h4 className='text-xs font-medium text-gray-900 mb-1.5'>
                {level} Tags ({count})
              </h4>
              <div className='bg-gray-50 rounded-md p-3'>
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
