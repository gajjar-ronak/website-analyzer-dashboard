import React, { useState, useRef } from 'react';
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<any>;
  loading?: boolean;
}

interface ImportResult {
  imported_count: number;
  error_count: number;
  errors: string[];
}

const BulkImportDialog: React.FC<BulkImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  loading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
      alert('Please select a CSV or Excel file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await onImport(selectedFile);
      // Set the import result to show success/error details
      if (result?.data) {
        setImportResult(result.data);
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        imported_count: 0,
        error_count: 1,
        errors: ['Import failed: ' + (error as Error).message],
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900'>Bulk Import URLs</h3>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600'
            disabled={loading}
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        {!importResult ? (
          <>
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <DocumentArrowUpIcon className='mx-auto h-12 w-12 text-gray-400' />
              <div className='mt-4'>
                <p className='text-sm text-gray-600'>
                  {selectedFile ? selectedFile.name : 'Drop your CSV or Excel file here, or'}
                </p>
                <button
                  type='button'
                  className='mt-2 text-sm text-blue-600 hover:text-blue-500'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  browse to upload
                </button>
              </div>
              <input
                ref={fileInputRef}
                type='file'
                className='hidden'
                accept='.csv,.xlsx,.xls'
                onChange={handleFileInputChange}
                disabled={loading}
              />
            </div>

            {/* File Requirements */}
            <div className='mt-4 text-xs text-gray-500'>
              <p className='font-medium'>File Requirements:</p>
              <ul className='mt-1 list-disc list-inside space-y-1'>
                <li>CSV or Excel format (.csv, .xlsx, .xls)</li>
                <li>Maximum file size: 10MB</li>
                <li>Required columns: "title" and "url"</li>
                <li>First row should contain column headers</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end space-x-3 mt-6'>
              <Button variant='outline' size='sm' onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant='primary'
                size='sm'
                onClick={handleImport}
                disabled={!selectedFile || loading}
              >
                {loading ? 'Importing...' : 'Import URLs'}
              </Button>
            </div>
          </>
        ) : (
          /* Import Results */
          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              {importResult.error_count === 0 ? (
                <CheckCircleIcon className='h-8 w-8 text-green-500' />
              ) : (
                <ExclamationTriangleIcon className='h-8 w-8 text-yellow-500' />
              )}
              <div>
                <p className='text-sm font-medium text-gray-900'>Import completed</p>
                <p className='text-sm text-gray-500'>
                  {importResult.imported_count} URLs imported successfully
                  {importResult.error_count > 0 && `, ${importResult.error_count} errors`}
                </p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className='bg-yellow-50 border border-yellow-200 rounded-md p-3'>
                <h4 className='text-sm font-medium text-yellow-800 mb-2'>Errors:</h4>
                <ul className='text-xs text-yellow-700 space-y-1 max-h-32 overflow-y-auto'>
                  {importResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className='flex justify-end'>
              <Button variant='primary' size='sm' onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImportDialog;
