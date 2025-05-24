import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MinerItem, { Miner } from './MinerItem';

interface MinersListProps {
  miners: Miner[];
}

const MinersList: React.FC<MinersListProps> = ({ miners }) => {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-xl font-semibold">Active Miners</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {miners.map((miner, idx) => (
          <MinerItem key={miner.name + idx} miner={miner} />
        ))}
      </CardContent>
    </Card>
  );
};

export default MinersList;