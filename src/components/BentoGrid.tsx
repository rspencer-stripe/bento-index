'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BentoTile as BentoTileType } from '@/lib/types';
import { BentoTile } from './BentoTile';

interface BentoGridProps {
  tiles: BentoTileType[];
  onTileExpand?: (tile: BentoTileType) => void;
}

export function BentoGrid({ tiles, onTileExpand }: BentoGridProps) {
  return (
    <motion.div 
      className="bento-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {tiles.map((tile, index) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              delay: index * 0.05,
            }}
          >
            <BentoTile 
              tile={tile} 
              onExpand={onTileExpand}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
