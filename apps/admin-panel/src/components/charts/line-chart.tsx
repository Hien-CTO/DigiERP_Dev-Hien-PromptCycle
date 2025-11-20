'use client';

import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
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
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * (width - 40) + 20;
    const y = height - 20 - ((point.value - minValue) / range) * (height - 40);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <svg width={width} height={height} className="border rounded-lg bg-white">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <g key={index}>
            <line
              x1="20"
              y1={20 + ratio * (height - 40)}
              x2={width - 20}
              y2={20 + ratio * (height - 40)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x="10"
              y={20 + ratio * (height - 40) + 4}
              fontSize="12"
              fill="#6b7280"
              textAnchor="middle"
            >
              {Math.round(maxValue - ratio * range).toLocaleString()}
            </text>
          </g>
        ))}

        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * (width - 40) + 20;
          const y = height - 20 - ((point.value - minValue) / range) * (height - 40);
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={x}
                y={height - 5}
                fontSize="12"
                fill="#6b7280"
                textAnchor="middle"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
