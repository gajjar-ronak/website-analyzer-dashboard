/**
 * AddURLDialog component
 * Dialog wrapper for adding URLs with proper state management and API integration
 */

import React from 'react';
import { Dialog } from '../../../components/Dialog';
import { AddURLForm } from './AddURLForm';
import { useCreateURL } from '../hooks';
import type { CreateURLRequest } from '../types';

interface AddURLDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddURLDialog: React.FC<AddURLDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createURLMutation = useCreateURL();

  const handleSubmit = async (data: CreateURLRequest) => {
    try {
      await createURLMutation.mutateAsync(data);
      
      // Close dialog on success
      onClose();
      
      // Call success callback if provided
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation (toast notification)
      // Keep dialog open so user can try again
      console.error('Failed to create URL:', error);
    }
  };

  const handleClose = () => {
    // Reset mutation state when closing
    createURLMutation.reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New URL"
      description="Enter a website URL to start monitoring and analysis"
      size="md"
      closeOnOverlayClick={!createURLMutation.isPending}
    >
      <AddURLForm
        onSubmit={handleSubmit}
        onCancel={handleClose}
        loading={createURLMutation.isPending}
        submitText="Add URL"
      />
      
      {/* Error state display */}
      {createURLMutation.isError && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Failed to add URL
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {createURLMutation.error instanceof Error
                    ? createURLMutation.error.message
                    : 'An unexpected error occurred. Please try again.'}
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="text-sm font-medium text-red-800 hover:text-red-700"
                  onClick={() => createURLMutation.reset()}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
