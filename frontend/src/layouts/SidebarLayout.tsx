import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, LinkIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'URLs', href: '/url-management', icon: LinkIcon },
];

const SidebarLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const location = useLocation();

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Mobile sidebar */}
      <div className={cn('fixed inset-0 z-40 flex md:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div
          className='fixed inset-0 bg-gray-600 bg-opacity-75'
          onClick={() => setSidebarOpen(false)}
        />
        <div className='relative flex w-full max-w-xs flex-1 flex-col bg-white'>
          <div className='absolute top-0 right-0 -mr-10 pt-1'>
            <button
              type='button'
              className='ml-1 flex h-8 w-8 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className='h-5 w-5 text-white' />
            </button>
          </div>
          <div className='flex flex-1 flex-col overflow-y-auto pt-3 pb-3'>
            <div className='flex flex-shrink-0 items-center px-3'>
              <h1 className='text-base font-bold text-gray-900'>Website Analyzer</h1>
            </div>
            <nav className='mt-3 flex-1 space-y-1 bg-white px-2'>
              {navigation.map(item => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-1.5 text-xs font-medium border-l-4'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-2 h-5 w-5'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300',
          sidebarExpanded ? 'md:w-48' : 'md:w-16'
        )}
      >
        <div className='flex flex-1 flex-col min-h-0 bg-white border-r border-gray-200'>
          <div className='flex flex-1 flex-col overflow-y-auto pt-3 pb-3'>
            <div className='flex items-center flex-shrink-0 px-3 mb-2'>
              <button
                type='button'
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className='p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500'
                title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <Bars3Icon className='h-5 w-5' />
              </button>
              {sidebarExpanded && (
                <h1 className='ml-2 text-sm font-bold text-gray-900 truncate'>Website Analyzer</h1>
              )}
            </div>
            <nav className='mt-1 flex-1 space-y-1'>
              {navigation.map(item => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-1.5 text-xs font-medium border-l-4',
                      !sidebarExpanded && 'justify-center'
                    )}
                    title={!sidebarExpanded ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                        'h-5 w-5',
                        sidebarExpanded && 'mr-2'
                      )}
                    />
                    {sidebarExpanded && <span className='truncate'>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarExpanded ? 'md:pl-48' : 'md:pl-16'
        )}
      >
        <div className='sticky top-0 z-10 flex h-10 flex-shrink-0 bg-white shadow'>
          <button
            type='button'
            className='border-r border-gray-200 px-3 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden'
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className='h-5 w-5' />
          </button>
          <div className='flex flex-1 justify-between px-3'>
            <div className='flex flex-1'>{/* Search bar */}</div>
            <div className='ml-3 flex items-center md:ml-4'>{/* User menu */}</div>
          </div>
        </div>

        <main className='flex-1 overflow-y-auto'>
          <div className='py-4'>
            <div className='mx-auto max-w-7xl px-3 sm:px-4 md:px-6'>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
