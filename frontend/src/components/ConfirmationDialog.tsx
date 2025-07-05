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
    >
      <div className='flex items-start space-x-4'>
        <div className='flex-shrink-0'>
          <ExclamationTriangleIcon className='h-6 w-6 text-red-600' />
        </div>
        <div className='flex-1'>
          <p className='text-sm text-gray-700'>{message}</p>
        </div>
      </div>

      <div className='mt-6 flex justify-end space-x-3'>
        <Button variant='outline' size='sm' onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} size='sm' onClick={handleConfirm} disabled={loading}>
          {loading ? 'Processing...' : confirmText}
        </Button>
      </div>
    </Dialog>
  );
};
