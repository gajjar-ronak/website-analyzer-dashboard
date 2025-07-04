import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  size = 'md',
  showLegend = true,
  showTooltip = true,
  innerRadius,
  outerRadius,
}) => {
  const sizeConfig = {
    sm: { height: 200, inner: 40, outer: 80 },
    md: { height: 250, inner: 50, outer: 100 },
    lg: { height: 300, inner: 60, outer: 120 },
  };

  const config = sizeConfig[size];
  const finalInnerRadius = innerRadius ?? config.inner;
  const finalOuterRadius = outerRadius ?? config.outer;

  // Filter out zero values for better visualization
  const filteredData = data.filter(item => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className='flex items-center justify-center' style={{ height: config.height }}>
        <div className='text-center'>
          <div className='text-gray-400 text-sm'>No data available</div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className='bg-white p-2 border border-gray-200 rounded shadow-lg'>
          <p className='text-sm font-medium'>{data.name}</p>
          <p className='text-sm text-gray-600'>
            {data.value} ({((data.value / filteredData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className='flex flex-wrap justify-center gap-4 mt-2'>
        {payload.map((entry: any, index: number) => (
          <div key={index} className='flex items-center gap-1'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: entry.color }}
            />
            <span className='text-xs text-gray-600'>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='w-full'>
      {title && (
        <h4 className='text-sm font-medium text-gray-900 mb-2 text-center'>{title}</h4>
      )}
      <ResponsiveContainer width='100%' height={config.height}>
        <PieChart>
          <Pie
            data={filteredData}
            cx='50%'
            cy='50%'
            innerRadius={finalInnerRadius}
            outerRadius={finalOuterRadius}
            paddingAngle={2}
            dataKey='value'
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;
