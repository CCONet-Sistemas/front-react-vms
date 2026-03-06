import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';

// Extend Prism to highlight {{handlebars}} variables inside HTML
Prism.hooks.add('after-tokenize', (env) => {
  if (env.language !== 'markup') return;
  env.tokens = env.tokens.map((token: Prism.Token | string) => {
    if (typeof token !== 'string') return token;
    return token.replace(/(\{\{[^}]+\}\})/g, (match) =>
      `<span class="handlebars-var">${match}</span>`
    );
  });
});

function highlight(code: string): string {
  return Prism.highlight(code, Prism.languages.markup, 'markup');
}

interface HandlebarsEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  rows?: number;
}

export function HandlebarsEditor({
  value,
  onChange,
  label,
  error,
  helperText,
  placeholder = 'Escreva o corpo do template usando {{variavel}} para variáveis Handlebars...',
  rows = 12,
}: HandlebarsEditorProps) {
  const lineHeight = 21;
  const minHeight = rows * lineHeight;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium leading-none">{label}</label>
      )}
      <div
        className={`handlebars-editor-wrap rounded-md border bg-background font-mono text-sm overflow-auto ${
          error ? 'border-destructive' : 'border-input'
        } focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0`}
        style={{ minHeight }}
      >
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlight}
          placeholder={placeholder}
          padding={8}
          style={{
            minHeight,
            fontFamily: 'ui-monospace, monospace',
            fontSize: 14,
            lineHeight: '21px',
            background: 'transparent',
          }}
          textareaClassName="outline-none"
        />
      </div>
      {helperText && (
        <p className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}
