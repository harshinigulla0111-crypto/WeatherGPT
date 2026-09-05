import React from 'react';
import { InsightsCharts } from '../components/insights/InsightsCharts';

export const InsightsPage: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-300">
      <InsightsCharts />
    </div>
  );
};
