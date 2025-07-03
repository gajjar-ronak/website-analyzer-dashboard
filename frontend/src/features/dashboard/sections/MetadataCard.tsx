/**
 * MetadataCard component
 * Displays URL metadata and additional information
 */

import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import type { DashboardURL } from '../types';

interface MetadataCardProps {
  url: DashboardURL;
}

export const MetadataCard: React.FC<MetadataCardProps> = ({ url }) => {
  return (
    <div className='bg-white shadow-sm rounded-md border border-gray-200'>
      <div className='px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-200'>
        <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
          <EyeIcon className='mr-1.5 h-4 w-4 text-gray-400' />
          Metadata
        </h3>
      </div>
      <div className='px-3 py-3 sm:px-4 sm:py-4'>
        <div className='space-y-3'>
          <div>
            <dt className='text-xs font-medium text-gray-500 mb-1'>URL ID</dt>
            <dd className='text-xs text-gray-900 font-mono'>#{url.id}</dd>
          </div>
          
          <div>
            <dt className='text-xs font-medium text-gray-500 mb-1'>Full URL</dt>
            <dd className='text-xs text-gray-900 break-all'>{url.url}</dd>
          </div>
          
          {url.status === 'completed' && url.seo_analysis && (
            <>
              <div>
                <dt className='text-xs font-medium text-gray-500 mb-1'>Total Elements</dt>
                <dd className='text-xs text-gray-900'>
                  <div className='grid grid-cols-2 gap-2 text-xs'>
                    <div>Images: {url.seo_analysis.image_count}</div>
                    <div>Links: {url.seo_analysis.link_analysis.total_links}</div>
                    <div>Forms: {url.seo_analysis.form_analysis.form_count}</div>
                    <div>Headings: {
                      url.seo_analysis.heading_tags.h1_count +
                      url.seo_analysis.heading_tags.h2_count +
                      url.seo_analysis.heading_tags.h3_count +
                      url.seo_analysis.heading_tags.h4_count +
                      url.seo_analysis.heading_tags.h5_count +
                      url.seo_analysis.heading_tags.h6_count
                    }</div>
                  </div>
                </dd>
              </div>
              
              {url.seo_analysis.html_version && (
                <div>
                  <dt className='text-xs font-medium text-gray-500 mb-1'>HTML Version</dt>
                  <dd className='text-xs text-gray-900'>{url.seo_analysis.html_version}</dd>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
