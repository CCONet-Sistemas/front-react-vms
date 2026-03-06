import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';

interface VariableEntry {
  name: string;
  description: string;
}

interface VariableCategory {
  label: string;
  variables: VariableEntry[];
}

const VARIABLE_CATEGORIES: VariableCategory[] = [
  {
    label: 'Evento',
    variables: [
      { name: 'event.id', description: 'ID único do evento' },
      { name: 'event.type', description: 'Tipo do evento (motion, intrusion, etc.)' },
      { name: 'event.detectedAt', description: 'Data/hora de detecção' },
      { name: 'event.confidence', description: 'Nível de confiança da detecção (%)' },
      { name: 'event.severity', description: 'Severidade (low, medium, high)' },
    ],
  },
  {
    label: 'Câmera',
    variables: [
      { name: 'camera.id', description: 'ID da câmera' },
      { name: 'camera.name', description: 'Nome da câmera' },
      { name: 'camera.location', description: 'Localização da câmera' },
      { name: 'camera.streamUrl', description: 'URL do stream da câmera' },
    ],
  },
  {
    label: 'Sistema',
    variables: [
      { name: 'system.name', description: 'Nome do sistema VMS' },
      { name: 'system.url', description: 'URL de acesso ao sistema' },
      { name: 'system.timestamp', description: 'Timestamp atual do servidor' },
    ],
  },
];

interface TemplateVariablesPanelProps {
  onInsert?: (variable: string) => void;
}

export function TemplateVariablesPanel({ onInsert }: TemplateVariablesPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Evento: true,
    Câmera: false,
    Sistema: false,
  });

  const handleCopy = (name: string) => {
    const snippet = `{{${name}}}`;
    navigator.clipboard.writeText(snippet).then(() => {
      toast.success(`Copiado: ${snippet}`);
    });
    onInsert?.(snippet);
  };

  return (
    <div className="rounded-md border bg-muted/20 p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Variáveis disponíveis</p>
      {VARIABLE_CATEGORIES.map((cat) => (
        <div key={cat.label} className="space-y-1">
          <button
            type="button"
            onClick={() => setExpanded((prev) => ({ ...prev, [cat.label]: !prev[cat.label] }))}
            className="flex items-center gap-1 text-xs font-medium text-foreground w-full text-left hover:text-primary transition-colors"
          >
            {expanded[cat.label] ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {cat.label}
          </button>
          {expanded[cat.label] && (
            <div className="space-y-0.5 pl-4">
              {cat.variables.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between gap-2 py-0.5 group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-mono text-amber-600 dark:text-amber-400">
                      {`{{${v.name}}}`}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5">{v.description}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={() => handleCopy(v.name)}
                    tooltip
                    tooltipText="Copiar variável"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
