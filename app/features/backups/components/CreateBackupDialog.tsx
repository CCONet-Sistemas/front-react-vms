import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Select, SelectOption } from '~/components/ui/select';
import type { BackupType, CreateBackupDto } from '~/types/backup.types';

interface CreateBackupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateBackupDto) => void;
  isSubmitting?: boolean;
}

export function CreateBackupDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateBackupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BackupType>('MANUAL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name || undefined,
      description: description || undefined,
      type,
    });
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setType('MANUAL');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Backup</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=" "
            disabled={isSubmitting}
          />
          <Textarea
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder=" "
            disabled={isSubmitting}
          />
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as BackupType)}
            disabled={isSubmitting}
            required
          >
            <SelectOption value="FULL">Completo</SelectOption>
            <SelectOption value="INCREMENTAL">Incremental</SelectOption>
            <SelectOption value="DIFFERENTIAL">Diferencial</SelectOption>
            <SelectOption value="MANUAL">Manual</SelectOption>
            <SelectOption value="SCHEDULED">Agendado</SelectOption>
          </Select>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Backup'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
