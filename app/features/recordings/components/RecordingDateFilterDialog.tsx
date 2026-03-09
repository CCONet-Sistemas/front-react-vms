import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { DateRangePicker, type DateRange } from '~/components/ui/date-picker';

interface RecordingDateFilterDialogProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  container?: HTMLElement | null;
}

export function RecordingDateFilterDialog({ value, onChange }: RecordingDateFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [localRange, setLocalRange] = useState<DateRange>(value);

  const hasActiveFilter = !!(value.startDate || value.endDate);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocalRange(value);
    }
    setOpen(isOpen);
  };

  const handleApply = () => {
    onChange(localRange);
    setOpen(false);
  };

  const handleClear = () => {
    const emptyRange: DateRange = { startDate: undefined, endDate: undefined };
    setLocalRange(emptyRange);
    onChange(emptyRange);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8"
        onClick={() => handleOpen(true)}
      >
        <Calendar className="h-4 w-4" />
        {hasActiveFilter && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
        )}
      </Button>

      <DialogContent className="sm:max-w-md bg-modal">
        <DialogHeader>
          <DialogTitle>Filtrar por período</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <DateRangePicker value={localRange} onChange={setLocalRange} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Limpar
          </Button>
          <Button onClick={handleApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
