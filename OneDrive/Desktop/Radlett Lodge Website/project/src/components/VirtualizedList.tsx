import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactElement;
  className?: string;
  overscanCount?: number;
}

function VirtualizedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  className = '',
  overscanCount = 5
}: VirtualizedListProps<T>) {
  const itemData = useMemo(() => items, [items]);

  const ItemRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    return renderItem({ index, style, data: itemData });
  };

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-neutral-500">No items to display</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={overscanCount}
      >
        {ItemRenderer}
      </List>
    </div>
  );
}

export default VirtualizedList;