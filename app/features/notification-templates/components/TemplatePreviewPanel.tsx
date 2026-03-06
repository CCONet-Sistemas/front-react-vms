import { useState } from 'react';

function renderTemplate(body: string, variables: Record<string, string>): string {
  return body.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const trimmed = key.trim();
    return trimmed in variables ? variables[trimmed] : `{{${trimmed}}}`;
  });
}

function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

interface TemplatePreviewPanelProps {
  body: string;
  variables: Record<string, string>;
}

export function TemplatePreviewPanel({ body, variables }: TemplatePreviewPanelProps) {
  const rendered = renderTemplate(body, variables);
  const hasHtml = isHtml(rendered);
  const [mode, setMode] = useState<'preview' | 'source'>('preview');

  return (
    <div className="rounded-md border bg-muted/30 p-3 min-h-[120px]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">Preview renderizado</p>
        {hasHtml && (
          <div className="flex text-xs border rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`px-2 py-0.5 transition-colors ${mode === 'preview' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => setMode('source')}
              className={`px-2 py-0.5 transition-colors ${mode === 'source' ? 'bg-muted font-medium' : 'hover:bg-muted/50'}`}
            >
              Código
            </button>
          </div>
        )}
      </div>

      {!rendered ? (
        <p className="text-sm text-muted-foreground italic">Nenhum conteúdo</p>
      ) : hasHtml && mode === 'preview' ? (
        <div
          className="text-sm overflow-auto max-h-full prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      ) : (
        <pre className="whitespace-pre-wrap break-words text-sm font-mono text-foreground overflow-auto max-h-full">
          {rendered}
        </pre>
      )}
    </div>
  );
}
