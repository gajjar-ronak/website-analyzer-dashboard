import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';
import Select from '../../../components/Select';
import Pagination from '../../../components/Pagination';
import { ConfirmationDialog } from '../../../components/ConfirmationDialog';
import { AddURLDialog } from '../../dashboard/components';
import URLTable from '../components/URLTable';
import BulkImportDialog from '../components/BulkImportDialog';
import { useURLsList, useDeleteURL, useAnalyzeURL } from '../../../hooks';
import { useBulkDeleteURLs, useBulkAnalyzeURLs, useBulkImportURLs } from '../hooks';
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
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedURLIds, setSelectedURLIds] = useState<number[]>([]);
  const [analyzingURLIds, setAnalyzingURLIds] = useState<number[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<DashboardURL | null>(null);
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
  const bulkDeleteMutation = useBulkDeleteURLs();
  const bulkAnalyzeMutation = useBulkAnalyzeURLs();
  const bulkImportMutation = useBulkImportURLs();

  // Clean up analyzing state when URLs are no longer analyzing
  useEffect(() => {
    if (urlsData?.data) {
      setAnalyzingURLIds(prev =>
        prev.filter(id => {
          const url = urlsData.data.find(u => u.id === id);
          return url?.status === 'analyzing';
        })
      );
    }
  }, [urlsData?.data]);

  const handleDeleteURL = (url: DashboardURL) => {
    setUrlToDelete(url);
  };

  const confirmDeleteURL = async () => {
    if (!urlToDelete) return;

    try {
      await deleteURLMutation.mutateAsync(urlToDelete.id);
      setUrlToDelete(null);
    } catch (error) {
      console.error('Failed to delete URL:', error);
    }
  };

  const cancelDeleteURL = () => {
    setUrlToDelete(null);
  };

  const handleAnalyzeURL = async (url: DashboardURL) => {
    setAnalyzingURLIds(prev => [...prev, url.id]);
    try {
      await analyzeURLMutation.mutateAsync(url.id);
    } catch (error) {
      console.error('Failed to analyze URL:', error);
    } finally {
      setAnalyzingURLIds(prev => prev.filter(id => id !== url.id));
    }
  };

  const handleAddURLSuccess = () => {
    // Dialog will close automatically, no additional action needed
    console.log('URL added successfully');
  };

  const handleViewURL = (url: DashboardURL) => {
    navigate(`/url-details/${url.id}`);
  };

  // Bulk operation handlers
  const handleSelectUrl = (id: number, selected: boolean) => {
    setSelectedURLIds(prev => (selected ? [...prev, id] : prev.filter(urlId => urlId !== id)));
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedURLIds(selected ? urlsData?.data.map(url => url.id) || [] : []);
  };

  const handleBulkDelete = () => {
    if (selectedURLIds.length === 0) return;
    setShowConfirmDelete(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedURLIds);
      setSelectedURLIds([]);
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Failed to bulk delete URLs:', error);
    }
  };

  const handleBulkAnalyze = async () => {
    if (selectedURLIds.length === 0) return;

    // Immediately add selected URLs to analyzing state
    setAnalyzingURLIds(prev => [...prev, ...selectedURLIds]);

    try {
      await bulkAnalyzeMutation.mutateAsync(selectedURLIds);
      // Clear selection after successful bulk analysis
      setSelectedURLIds([]);
    } catch (error) {
      console.error('Failed to bulk analyze URLs:', error);
      // Remove from analyzing state on error
      setAnalyzingURLIds(prev => prev.filter(id => !selectedURLIds.includes(id)));
    }
  };

  const handleBulkImport = () => {
    setIsBulkImportOpen(true);
  };

  const handleImportFile = async (file: File) => {
    try {
      // Close dialog immediately and show loading in table
      setIsBulkImportOpen(false);

      const result = await bulkImportMutation.mutateAsync(file);
      console.log('Import result:', result);

      return result;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
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
    <>
      {/* Header with Title and Actions */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
        <div className='min-w-0 flex-1 mb-4'>
          <h1 className='text-base font-semibold text-gray-900 sm:text-lg'>URL Management</h1>
          <p className='mt-0.5 text-[13px] text-gray-600'>Monitor and manage your website URLs</p>
          {selectedURLIds.length > 0 && (
            <p className='mt-0.5 text-[11px] text-blue-600'>
              {selectedURLIds.length} URL{selectedURLIds.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div className='flex items-center space-x-2'>
          {/* Bulk Import Button - only show when no URLs are selected */}
          {selectedURLIds.length === 0 && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleBulkImport}
              disabled={
                deleteURLMutation.isPending ||
                analyzeURLMutation.isPending ||
                bulkDeleteMutation.isPending ||
                bulkAnalyzeMutation.isPending ||
                bulkImportMutation.isPending
              }
              className='flex items-center space-x-1 px-2 py-1 text-[11px] h-7'
            >
              {bulkImportMutation.isPending ? (
                <>
                  <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600' />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className='h-3 w-3' />
                  <span>Bulk Import</span>
                </>
              )}
            </Button>
          )}

          {/* Bulk Operations - only show when URLs are selected */}
          {selectedURLIds.length > 0 && (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkAnalyze}
                disabled={
                  deleteURLMutation.isPending ||
                  analyzeURLMutation.isPending ||
                  bulkDeleteMutation.isPending ||
                  bulkAnalyzeMutation.isPending ||
                  bulkImportMutation.isPending
                }
                className='flex items-center space-x-1 px-2 py-1 text-blue-600 border-blue-300 hover:bg-blue-50 text-[11px] h-7'
              >
                {bulkAnalyzeMutation.isPending ? (
                  <>
                    <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600' />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className='h-3 w-3' />
                    <span>Re-run Analysis</span>
                  </>
                )}
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkDelete}
                disabled={
                  deleteURLMutation.isPending ||
                  analyzeURLMutation.isPending ||
                  bulkDeleteMutation.isPending ||
                  bulkAnalyzeMutation.isPending ||
                  bulkImportMutation.isPending
                }
                className='flex items-center space-x-1 px-2 py-1 text-red-600 border-red-300 hover:bg-red-50 text-[11px] h-7'
              >
                {bulkDeleteMutation.isPending ? (
                  <>
                    <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-red-600' />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <TrashIcon className='h-3 w-3' />
                    <span>Delete URLs</span>
                  </>
                )}
              </Button>
            </>
          )}

          {/* Add URL Button */}
          {selectedURLIds.length === 0 && (
            <Button
              onClick={() => setShowAddDialog(true)}
              size='sm'
              className='inline-flex items-center text-[11px] h-8'
            >
              <PlusIcon className='h-4 w-3' />
              Add URL
            </Button>
          )}
        </div>
      </div>

      {/* Add URL Dialog */}
      <AddURLDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleAddURLSuccess}
      />

      {/* Filters */}
      <div className='bg-white shadow-sm rounded-md border border-gray-200 mb-4'>
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
                size='md'
                className='max-w-[180px] text-xs h-[44px]'
              />
            </div>
          </div>
        </div>
      </div>

      {/* URLs Table */}
      <URLTable
        urls={urlsData?.data || []}
        loading={isLoading || bulkDeleteMutation.isPending || bulkImportMutation.isPending}
        selectedIds={selectedURLIds}
        analyzingIds={analyzingURLIds}
        sortBy={filters.sort_by}
        sortOrder={filters.sort_order}
        onView={handleViewURL}
        onDelete={handleDeleteURL}
        onCheck={handleAnalyzeURL}
        onSelectUrl={handleSelectUrl}
        onSelectAll={handleSelectAll}
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

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleImportFile}
        loading={bulkImportMutation.isPending}
      />

      {/* Bulk Delete Confirmation Dialog */}
      {showConfirmDelete && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
            <div className='mt-3 text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
                <TrashIcon className='h-6 w-6 text-red-600' />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mt-4'>Delete URLs</h3>
              <div className='mt-2 px-7 py-3'>
                <p className='text-sm text-gray-500'>
                  Are you sure you want to delete {selectedURLIds.length} URL
                  {selectedURLIds.length !== 1 ? 's' : ''}? This action cannot be undone.
                </p>
              </div>
              <div className='flex justify-center space-x-3 mt-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={bulkDeleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={confirmBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  className='bg-red-600 hover:bg-red-700 focus:ring-red-500'
                >
                  {bulkDeleteMutation.isPending ? (
                    <div className='flex items-center space-x-2'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!urlToDelete}
        onClose={cancelDeleteURL}
        onConfirm={confirmDeleteURL}
        title='Delete URL'
        message={`Are you sure you want to delete "${urlToDelete?.title || urlToDelete?.url}"?`}
        confirmText='Delete'
        cancelText='Cancel'
        confirmVariant='destructive'
        loading={deleteURLMutation.isPending}
      />
    </>
  );
};

export default URLManagement;
