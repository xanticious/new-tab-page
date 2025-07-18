'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  bgColor = 'bg-blue-50',
  textColor = 'text-blue-600',
  borderColor = 'border-blue-200',
}) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className={`text-2xl font-semibold ${textColor}`}>{value}</div>
      <div className={`${textColor.replace('600', '700')}`}>{title}</div>
    </div>
  );
};
