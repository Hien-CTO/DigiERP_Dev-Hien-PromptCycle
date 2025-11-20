'use client';

import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width = 400,
  height = 200,
  color = '#3b82f6'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 60) / data.length - 10;
  const barSpacing = 10;

  return (
    <div className="w-full">
      <svg width={width} height={height} className="border rounded-lg bg-white">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <g key={index}>
            <line
              x1="50"
              y1={20 + ratio * (height - 60)}
              x2={width - 20}
              y2={20 + ratio * (height - 60)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x="40"
              y={20 + ratio * (height - 60) + 4}
              fontSize="12"
              fill="#6b7280"
              textAnchor="end"
            >
              {Math.round(maxValue * ratio).toLocaleString()}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * (height - 60);
          const x = 50 + index * (barWidth + barSpacing);
          const y = height - 40 - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="2"
              />
              <text
                x={x + barWidth / 2}
                y={height - 20}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {point.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fontSize="10"
                fill="#374151"
                textAnchor="middle"
              >
                {point.value.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
