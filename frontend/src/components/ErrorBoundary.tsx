/**
 * ErrorBoundary component
 * Catches JavaScript errors anywhere in the child component tree
 */

import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className='min-h-[200px] flex items-center justify-center'>
          <div className='text-center'>
            <ExclamationTriangleIcon className='mx-auto h-12 w-12 text-red-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>Something went wrong</h3>
            <p className='mt-1 text-sm text-gray-500'>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className='mt-6'>
              <button
                type='button'
                className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
