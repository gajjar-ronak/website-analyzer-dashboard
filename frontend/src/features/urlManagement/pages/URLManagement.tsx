import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';
import Select from '../../../components/Select';
import Pagination from '../../../components/Pagination';
import { AddURLDialog, URLTable } from '../../dashboard/components';
import { useURLsList, useDeleteURL, useAnalyzeURL } from '../../../hooks';
import { useDebounce } from '../../../hooks/useDebounce';
import type { DashboardURL } from '../../dashboard/types';

interface URLFilters {
  search: string;
  status: 'all' | 'pending' | 'analyzing' | 'completed' | 'failed';
  page: number;
  limit: number;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

const URLManagement: React.FC = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filters, setFilters] = useState<URLFilters>({
    search: '',
    status: 'all',
    page: 1,
    limit: 10,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 800);

  // Queries and mutations using dashboard hooks
  const { data: urlsData, isLoading } = useURLsList({
    page: filters.page,
    limit: filters.limit,
    search: debouncedSearch,
    status: filters.status,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
  });
  const deleteURLMutation = useDeleteURL();
  const analyzeURLMutation = useAnalyzeURL();

  const handleDeleteURL = async (url: DashboardURL) => {
    const urlTitle = url.title || url.url;
    if (window.confirm(`Are you sure you want to delete "${urlTitle}"?`)) {
      try {
        await deleteURLMutation.mutateAsync(url.id);
      } catch (error) {
        console.error('Failed to delete URL:', error);
      }
    }
  };

  const handleAnalyzeURL = async (url: DashboardURL) => {
    try {
      await analyzeURLMutation.mutateAsync(url.id);
    } catch (error) {
      console.error('Failed to analyze URL:', error);
    }
  };

  const handleAddURLSuccess = () => {
    // Dialog will close automatically, no additional action needed
    console.log('URL added successfully');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: event.target.value,
      page: 1, // Reset to first page when searching
    }));
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      status: value as URLFilters['status'],
      page: 1, // Reset to first page when filtering
    }));
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sort_by: field,
      sort_order: prev.sort_by === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
      page: 1, // Reset to first page when sorting
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'analyzing', label: 'Analyzing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <h1 className='text-lg font-semibold text-gray-900 sm:text-xl'>URL Management</h1>
          <p className='mt-0.5 text-xs text-gray-600'>Monitor and manage your website URLs</p>
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

      {/* Add URL Dialog */}
      <AddURLDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleAddURLSuccess}
      />

      {/* Filters */}
      <div className='bg-white shadow-sm rounded-md border border-gray-200'>
        <div className='px-3 py-3 sm:px-4 sm:py-4'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
            {/* Search */}
            <div className='sm:col-span-2 xl:col-span-1'>
              <label htmlFor='search' className='block text-xs font-medium text-gray-700 mb-1'>
                Search
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none'>
                  <MagnifyingGlassIcon className='h-3.5 w-3.5 text-gray-400' />
                </div>
                <input
                  type='text'
                  id='search'
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                  className='block w-full pl-8 pr-2 py-1.5 text-xs border border-gray-300 rounded-md bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'
                  placeholder='Search URLs or titles...'
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Select
                label='Status'
                value={filters.status || 'all'}
                onChange={handleStatusFilterChange}
                options={statusOptions}
                size='sm'
              />
            </div>
          </div>
        </div>
      </div>

      {/* URLs Table */}
      <URLTable
        urls={urlsData?.data || []}
        loading={isLoading}
        onDelete={handleDeleteURL}
        onCheck={handleAnalyzeURL}
        sortBy={filters.sort_by}
        sortOrder={filters.sort_order}
        onSort={handleSort}
      />

      {/* Pagination */}
      {urlsData?.pagination && urlsData.pagination.total_pages > 1 && (
        <Pagination
          currentPage={urlsData.pagination.page}
          totalPages={urlsData.pagination.total_pages}
          onPageChange={handlePageChange}
          className='rounded-lg border border-gray-200'
        />
      )}

      {/* Loading states for mutations */}
      {(deleteURLMutation.isPending || analyzeURLMutation.isPending) && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-md p-4 shadow-xl'>
            <div className='flex items-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2' />
              <span className='text-xs text-gray-700'>
                {deleteURLMutation.isPending && 'Deleting URL...'}
                {analyzeURLMutation.isPending && 'Starting URL analysis...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default URLManagement;
