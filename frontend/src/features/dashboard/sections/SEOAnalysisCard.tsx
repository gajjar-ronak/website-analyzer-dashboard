/**
 * SEOAnalysisCard component
 * Displays comprehensive SEO analysis data including meta tags, headings, links, and forms
 */

import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { cn } from '../../../utils/cn';
import DonutChart from '../../../components/DonutChart';
import type { DashboardURL } from '../types';

interface SEOAnalysisCardProps {
  url: DashboardURL;
}

export const SEOAnalysisCard: React.FC<SEOAnalysisCardProps> = ({ url }) => {
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
                <div className='text-center p-2 bg-gray-50 rounded-md'>
                  <div className='text-sm font-semibold text-gray-900'>
                    {seo_analysis.heading_tags.h1_count}
                  </div>
                  <div className='text-xs text-gray-500'>H1</div>
                </div>
                <div className='text-center p-2 bg-gray-50 rounded-md'>
                  <div className='text-sm font-semibold text-gray-900'>
                    {seo_analysis.heading_tags.h2_count}
                  </div>
                  <div className='text-xs text-gray-500'>H2</div>
                </div>
                <div className='text-center p-2 bg-gray-50 rounded-md'>
                  <div className='text-sm font-semibold text-gray-900'>
                    {seo_analysis.heading_tags.h3_count}
                  </div>
                  <div className='text-xs text-gray-500'>H3</div>
                </div>
                <div className='text-center p-2 bg-gray-50 rounded-md'>
                  <div className='text-sm font-semibold text-gray-900'>
                    {seo_analysis.heading_tags.h4_count}
                  </div>
                  <div className='text-xs text-gray-500'>H4</div>
                </div>
                <div className='text-center p-2 bg-gray-50 rounded-md'>
                  <div className='text-sm font-semibold text-gray-900'>
                    {seo_analysis.heading_tags.h5_count}
                  </div>
                  <div className='text-xs text-gray-500'>H5</div>
                </div>
                <div className='text-center p-2 bg-gray-50 rounded-md'>
                  <div className='text-sm font-semibold text-gray-900'>
                    {seo_analysis.heading_tags.h6_count}
                  </div>
                  <div className='text-xs text-gray-500'>H6</div>
                </div>
              </div>
            </div>

            {/* Link Analysis */}
            <div>
              <h4 className='text-xs font-medium text-gray-900 mb-2'>Link Analysis</h4>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {/* Statistics Cards */}
                <div className='grid grid-cols-2 gap-2'>
                  <div className='flex flex-col items-center justify-center text-center p-2 bg-blue-50 rounded-md'>
                    <div className='text-sm font-semibold text-blue-900'>
                      {seo_analysis.link_analysis.total_links}
                    </div>
                    <div className='text-xs text-blue-600'>Total</div>
                  </div>
                  <div className='flex flex-col items-center justify-center text-center p-2 bg-green-50 rounded-md'>
                    <div className='text-sm font-semibold text-green-900'>
                      {seo_analysis.link_analysis.internal_links}
                    </div>
                    <div className='text-xs text-green-600'>Internal</div>
                  </div>
                  <div className='flex flex-col items-center justify-center text-center p-2 bg-purple-50 rounded-md'>
                    <div className='text-sm font-semibold text-purple-900'>
                      {seo_analysis.link_analysis.external_links}
                    </div>
                    <div className='text-xs text-purple-600'>External</div>
                  </div>
                  <div className='flex flex-col items-center justify-center text-center p-2 bg-red-50 rounded-md'>
                    <div className='text-sm font-semibold text-red-900'>
                      {seo_analysis.link_analysis.broken_links}
                    </div>
                    <div className='text-xs text-red-600'>Broken</div>
                  </div>
                </div>

                {/* Donut Chart for Internal vs External Links */}
                <div className='flex items-center justify-center'>
                  <DonutChart
                    data={[
                      {
                        name: 'Internal Links',
                        value: seo_analysis.link_analysis.internal_links,
                        color: '#10b981', // green-500
                      },
                      {
                        name: 'External Links',
                        value: seo_analysis.link_analysis.external_links,
                        color: '#8b5cf6', // purple-500
                      },
                    ]}
                    size='sm'
                    showLegend={true}
                    showTooltip={true}
                  />
                </div>
              </div>
            </div>

            {/* Form and Image Analysis */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <h4 className='text-xs font-medium text-gray-900 mb-2'>Forms</h4>
                <div className='space-y-1'>
                  <div className='flex justify-between'>
                    <span className='text-xs text-gray-500'>Total Forms:</span>
                    <span className='text-xs font-medium text-gray-900'>
                      {seo_analysis.form_analysis.form_count}
                    </span>
                  </div>
                  <div className='flex justify-between'>
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
                  <div className='text-xs text-yellow-600'>Total Images</div>
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
