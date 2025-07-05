/**
 * ConfirmationDialog component
 * A reusable confirmation dialog with customizable content and actions
 */

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Dialog } from './Dialog';
import { Button } from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive';
  loading?: boolean;
  'data-testid'?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'destructive',
  loading = false,
  'data-testid': dataTestId = 'confirmation-dialog',
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size='sm'
      closeOnOverlayClick={!loading}
      data-testid={dataTestId}
    >
      <div className='flex items-start space-x-4'>
        <div className='flex-shrink-0'>
          <ExclamationTriangleIcon className='h-6 w-6 text-red-600' />
        </div>
        <div className='flex-1'>
          <p className='text-sm text-gray-700' data-testid='dialog-message'>
            {message}
          </p>
        </div>
      </div>

      <div className='mt-6 flex justify-end space-x-3'>
        <Button
          variant='outline'
          size='sm'
          onClick={onClose}
          disabled={loading}
          data-testid='cancel-button'
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          size='sm'
          onClick={handleConfirm}
          disabled={loading}
          data-testid='confirm-button'
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </div>
    </Dialog>
  );
};
