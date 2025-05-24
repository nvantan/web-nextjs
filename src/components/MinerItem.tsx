import React from 'react';

export interface Miner {
  name: string;
  hashRate: number;
  status?: string;
}

interface MinerItemProps {
  miner: Miner;
}

const MinerItem: React.FC<MinerItemProps> = ({ miner }) => {
  return (
    <div className="bg-gray-900/50 border-l-4 border-l-blue-500 p-4 rounded-lg hover:bg-gray-900/70 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-mono text-sm group-hover:text-blue-300 transition-colors">
              {miner.name}
            </span>
          </div>
        </div>
        <div className="text-orange-400 font-bold text-sm">
          {miner.hashRate}
        </div>
      </div>
    </div>
  );
};

export default MinerItem;