import * as React from 'react';
import { cn } from '~/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

const WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/3', 'w-4/5', 'w-3/5', 'w-2/5', 'w-1/2'];

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 8, columns = 5, className }: TableSkeletonProps) {
  return (
    <div className={cn('rounded-lg border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <div
                    className={cn(
                      'h-4 animate-pulse rounded bg-muted',
                      WIDTHS[(rowIdx * columns + colIdx) % WIDTHS.length]
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
