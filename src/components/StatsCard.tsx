import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    totalHashRate: string;
    totalMiners: string;
    activeMiners: string;
    totalHashRateExistMiners: string;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Hash Rate */}
      <Card className="bg-gray-800/50 border-l-4 border-l-blue-500 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="text-gray-400 text-sm font-medium mb-1">Total Hash Rate</div>
          <div className="text-blue-400 text-2xl font-bold">{stats.totalHashRate}</div>
        </CardContent>
      </Card>

      {/* Total Miners */}
      <Card className="bg-gray-800/50 border-l-4 border-l-orange-500 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="text-gray-400 text-sm font-medium mb-1">Total Miners</div>
          <div className="text-orange-400 text-2xl font-bold">{stats.totalMiners}</div>
        </CardContent>
      </Card>

      {/* Total Hash Rate of Active Miners */}
      <Card className="bg-gray-800/50 border-l-4 border-l-purple-500 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="text-gray-400 text-sm font-medium mb-1">Total Hash Rate of Active Miners</div>
          <div className="text-purple-400 text-2xl font-bold">{stats.totalHashRateExistMiners}</div>
        </CardContent>
      </Card>

      {/* Active Miners */}
      <Card className="bg-gray-800/50 border-l-4 border-l-green-500 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="text-gray-400 text-sm font-medium mb-1">Active Miners</div>
          <div className="text-green-400 text-2xl font-bold">{stats.activeMiners}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;