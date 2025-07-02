import React from 'react';
import {
  ChartBarIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useURLs } from '../features/urlManagement/hooks';

// Mock data for charts
const responseTimeData = [
  { name: 'Mon', responseTime: 245 },
  { name: 'Tue', responseTime: 312 },
  { name: 'Wed', responseTime: 189 },
  { name: 'Thu', responseTime: 278 },
  { name: 'Fri', responseTime: 156 },
  { name: 'Sat', responseTime: 203 },
  { name: 'Sun', responseTime: 234 },
];

const uptimeData = [
  { name: 'Week 1', uptime: 99.2 },
  { name: 'Week 2', uptime: 98.8 },
  { name: 'Week 3', uptime: 99.9 },
  { name: 'Week 4', uptime: 97.5 },
];

const Dashboard: React.FC = () => {
  const { data: urlsData, isLoading } = useURLs();

  // Calculate stats
  const totalURLs = urlsData?.total || 0;
  const activeURLs = urlsData?.urls.filter(url => url.status === 'active').length || 0;
  const inactiveURLs = urlsData?.urls.filter(url => url.status === 'inactive').length || 0;
  const avgResponseTime = urlsData?.urls.reduce((acc, url) => {
    return acc + (url.responseTime || 0);
  }, 0) / (urlsData?.urls.length || 1) || 0;

  const stats = [
    {
      name: 'Total URLs',
      value: totalURLs,
      icon: GlobeAltIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active URLs',
      value: activeURLs,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Inactive URLs',
      value: inactiveURLs,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      name: 'Avg Response Time',
      value: `${Math.round(avgResponseTime)}ms`,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-200 rounded" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your website monitoring
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Response Time Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Average Response Time (Last 7 Days)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}ms`, 'Response Time']} />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Uptime Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Uptime Percentage (Last 4 Weeks)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uptimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[95, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Uptime']} />
                  <Bar dataKey="uptime" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent URLs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Recent URLs
          </h3>
          {urlsData?.urls.length ? (
            <div className="space-y-3">
              {urlsData.urls.slice(0, 5).map((url) => (
                <div key={url.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded-full ${
                      url.status === 'active' ? 'bg-green-100' : 
                      url.status === 'inactive' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {url.status === 'active' ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                      ) : url.status === 'inactive' ? (
                        <XCircleIcon className="h-4 w-4 text-red-600" />
                      ) : (
                        <ChartBarIcon className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{url.title}</p>
                      <p className="text-xs text-gray-500">{url.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {url.responseTime ? `${url.responseTime}ms` : '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {url.statusCode || '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No URLs added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
