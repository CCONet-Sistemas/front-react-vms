import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectOption } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { Switch } from '~/components/ui/switch';
import type { Configuration, CreateConfigDto, UpdateConfigDto } from '~/types';

interface ConfigFormDialogProps {
  config?: Configuration | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConfigDto | UpdateConfigDto) => void;
  isSubmitting?: boolean;
}

type ConfigType = 'string' | 'number' | 'boolean' | 'json';

interface FormData {
  key: string;
  type: ConfigType;
  value: string;
  description: string;
  metadata: string;
}

interface FormErrors {
  key?: string;
  value?: string;
  metadata?: string;
}

const initialFormData: FormData = {
  key: '',
  type: 'string',
  value: '',
  description: '',
  metadata: '',
};

function getDefaultValue(type: ConfigType): string {
  switch (type) {
    case 'boolean':
      return 'false';
    case 'number':
      return '0';
    case 'json':
      return '{}';
    default:
      return '';
  }
}

export function ConfigFormDialog({
  config,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ConfigFormDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditing = !!config;

  useEffect(() => {
    if (isOpen) {
      if (config) {
        setFormData({
          key: config.key.value,
          type: config.value.type,
          value:
            typeof config.value.rawValue === 'string'
              ? config.value.rawValue
              : JSON.stringify(config.value.rawValue, null, 2),
          description: config.description || '',
          metadata:
            config.metadata && Object.keys(config.metadata).length > 0
              ? JSON.stringify(config.metadata, null, 2)
              : '',
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, config]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.key.trim()) {
      newErrors.key = 'Chave é obrigatória';
    }

    if (!formData.value.trim() && formData.type !== 'boolean') {
      newErrors.value = 'Valor é obrigatório';
    }

    if (formData.type === 'number' && isNaN(Number(formData.value))) {
      newErrors.value = 'Valor deve ser um número válido';
    }

    if (formData.type === 'json' && formData.value.trim()) {
      try {
        JSON.parse(formData.value);
      } catch {
        newErrors.value = 'JSON inválido';
      }
    }

    if (formData.metadata.trim()) {
      try {
        JSON.parse(formData.metadata);
      } catch {
        newErrors.metadata = 'Metadata deve ser um JSON válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload: CreateConfigDto = {
      key: formData.key,
      value: formData.value,
      type: formData.type,
      description: formData.description || undefined,
      metadata: formData.metadata.trim() ? JSON.parse(formData.metadata) : undefined,
    };

    if (isEditing) {
      const { key: _key, ...updateData } = payload;
      onSubmit(updateData as UpdateConfigDto);
    } else {
      onSubmit(payload);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTypeChange = (newType: ConfigType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      value: getDefaultValue(newType),
    }));
    setErrors((prev) => ({ ...prev, value: undefined }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Configuração' : 'Nova Configuração'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Atualize os valores da configuração abaixo.'
              : 'Preencha as informações para criar uma nova configuração.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key" required>
              Chave
            </Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) => handleChange('key', e.target.value)}
              placeholder="ex: site_name"
              disabled={isEditing}
              error={!!errors.key}
            />
            {errors.key && <p className="text-sm text-destructive">{errors.key}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" required>
              Tipo
            </Label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as ConfigType)}
            >
              <SelectOption value="string">Texto</SelectOption>
              <SelectOption value="number">Número</SelectOption>
              <SelectOption value="boolean">Booleano</SelectOption>
              <SelectOption value="json">JSON</SelectOption>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value" required={formData.type !== 'boolean'}>
              Valor
            </Label>
            {formData.type === 'boolean' ? (
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  id="value"
                  checked={formData.value === 'true'}
                  onCheckedChange={(checked) => handleChange('value', String(checked))}
                />
                <span className="text-sm text-muted-foreground">
                  {formData.value === 'true' ? 'Verdadeiro' : 'Falso'}
                </span>
              </div>
            ) : formData.type === 'json' ? (
              <>
                <Textarea
                  id="value"
                  value={JSON.parse(JSON.parse(formData.value)) || ''}
                  onChange={(e) => handleChange('value', e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={4}
                  className="font-mono text-sm"
                  error={!!errors.value}
                />
              </>
            ) : formData.type === 'number' ? (
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="0"
                error={!!errors.value}
              />
            ) : (
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                placeholder="Valor da configuração"
                error={!!errors.value}
              />
            )}
            {errors.value && <p className="text-sm text-destructive">{errors.value}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição da configuração (opcional)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON)</Label>
            <Textarea
              id="metadata"
              value={formData.metadata}
              onChange={(e) => handleChange('metadata', e.target.value)}
              placeholder='{"environment": "production"}'
              rows={2}
              className="font-mono text-sm"
              error={!!errors.metadata}
            />
            {errors.metadata && <p className="text-sm text-destructive">{errors.metadata}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
