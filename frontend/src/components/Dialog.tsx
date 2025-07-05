/**
 * Dialog component
 * A reusable modal dialog with proper accessibility and animations
 */

import React, { Fragment, useEffect } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  'data-testid'?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  'data-testid': dataTestId,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog as='div' className='relative z-50' onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div
            className='fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm'
            onClick={handleOverlayClick}
          />
        </Transition.Child>

        {/* Dialog container */}
        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <HeadlessDialog.Panel
                className={cn(
                  'w-full transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all',
                  sizeClasses[size],
                  className
                )}
                data-testid={dataTestId}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
                    <div>
                      {title && (
                        <HeadlessDialog.Title
                          as='h3'
                          className='text-lg font-medium leading-6 text-gray-900'
                        >
                          {title}
                        </HeadlessDialog.Title>
                      )}
                      {description && <p className='mt-1 text-sm text-gray-500'>{description}</p>}
                    </div>
                    {showCloseButton && (
                      <button
                        type='button'
                        className='rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        onClick={onClose}
                      >
                        <span className='sr-only'>Close</span>
                        <XMarkIcon className='h-6 w-6' aria-hidden='true' />
                      </button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className={cn('px-6 py-4', !title && !showCloseButton && 'pt-6')}>
                  {children}
                </div>
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
};

/**
 * Dialog Footer component for consistent button layouts
 */
interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Dialog Content component for consistent content styling
 */
interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return <div className={cn('px-6 py-4', className)}>{children}</div>;
};
