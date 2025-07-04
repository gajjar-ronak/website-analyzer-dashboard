import React, { useState } from 'react';
import { TrashIcon, PlayIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';

interface BulkOperationsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkAnalyze: () => void;
  onBulkImport: () => void;
  loading?: boolean;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkAnalyze,
  onBulkImport,
  loading = false,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleBulkDelete = () => {
    if (selectedCount === 0) return;
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    onBulkDelete();
    setShowConfirmDelete(false);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <>
      <div className='flex items-center justify-between bg-white p-4 border-b border-gray-200'>
        <div className='flex items-center space-x-4'>
          <h2 className='text-lg font-medium text-gray-900'>URL Management</h2>
          {selectedCount > 0 && (
            <span className='text-sm text-gray-500'>
              {selectedCount} URL{selectedCount !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>

        <div className='flex items-center space-x-3'>
          {/* Bulk Import Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={onBulkImport}
            disabled={loading}
            className='flex items-center space-x-2'
          >
            <DocumentArrowUpIcon className='h-4 w-4' />
            <span>Bulk Import</span>
          </Button>

          {/* Bulk Operations - only show when URLs are selected */}
          {selectedCount > 0 && (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={onBulkAnalyze}
                disabled={loading}
                className='flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600' />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className='h-4 w-4' />
                    <span>Re-run Analysis</span>
                  </>
                )}
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkDelete}
                disabled={loading}
                className='flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50'
              >
                <TrashIcon className='h-4 w-4' />
                <span>Delete URLs</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
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
                  Are you sure you want to delete {selectedCount} URL
                  {selectedCount !== 1 ? 's' : ''}? This action cannot be undone.
                </p>
              </div>
              <div className='flex justify-center space-x-3 mt-4'>
                <Button variant='outline' size='sm' onClick={cancelDelete} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={confirmDelete}
                  disabled={loading}
                  className='bg-red-600 hover:bg-red-700 focus:ring-red-500'
                >
                  {loading ? (
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
    </>
  );
};

export default BulkOperations;
