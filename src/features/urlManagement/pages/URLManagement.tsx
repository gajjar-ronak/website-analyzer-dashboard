import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';
import URLTable from '../components/URLTable';
import URLForm from '../components/URLForm';
import { useURLs, useCreateURL, useDeleteURL, useCheckURL } from '../hooks';
import type { URL, URLListFilters, CreateURLRequest } from '../types';

const URLManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<URLListFilters>({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Queries and mutations
  const { data: urlsData, isLoading } = useURLs(filters);
  const createURLMutation = useCreateURL();
  const deleteURLMutation = useDeleteURL();
  const checkURLMutation = useCheckURL();

  const handleCreateURL = async (data: CreateURLRequest) => {
    try {
      await createURLMutation.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create URL:', error);
    }
  };

  const handleDeleteURL = async (url: URL) => {
    if (window.confirm(`Are you sure you want to delete "${url.title}"?`)) {
      try {
        await deleteURLMutation.mutateAsync(url.id);
      } catch (error) {
        console.error('Failed to delete URL:', error);
      }
    }
  };

  const handleCheckURL = async (url: URL) => {
    try {
      await checkURLMutation.mutateAsync(url.id);
    } catch (error) {
      console.error('Failed to check URL:', error);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: event.target.value,
    }));
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      status: event.target.value as URLListFilters['status'],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            URL Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage your website URLs
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add URL
          </Button>
        </div>
      </div>

      {/* Add URL Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Add New URL
            </h3>
            <URLForm
              onSubmit={handleCreateURL}
              loading={createURLMutation.isPending}
              submitText="Add URL"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={filters.search || ''}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search URLs..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={filters.status || 'all'}
                onChange={handleStatusFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                {urlsData && (
                  <span>
                    Showing {urlsData.urls.length} of {urlsData.total} URLs
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* URLs Table */}
      <URLTable
        urls={urlsData?.urls || []}
        loading={isLoading}
        onDelete={handleDeleteURL}
        onCheck={handleCheckURL}
      />

      {/* Loading states for mutations */}
      {(deleteURLMutation.isPending || checkURLMutation.isPending) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3" />
              <span className="text-sm text-gray-700">
                {deleteURLMutation.isPending && 'Deleting URL...'}
                {checkURLMutation.isPending && 'Checking URL status...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default URLManagement;
