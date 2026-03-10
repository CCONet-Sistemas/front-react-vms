import { cn } from '~/lib/utils';

// Exemplo de teste unitário: testa função pura sem dependências externas
describe('cn (classnames utility)', () => {
  it('combina classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('remove classes conflitantes do Tailwind (última vence)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('ignora valores falsy', () => {
    expect(cn('foo', false, null, undefined, '')).toBe('foo');
  });

  it('suporta classes condicionais com &&', () => {
    const active = true;
    const disabled = false;
    expect(cn('btn', active && 'btn-active', disabled && 'btn-disabled')).toBe(
      'btn btn-active'
    );
  });

  it('suporta objetos com chaves condicionais', () => {
    expect(cn({ 'font-bold': true, 'font-normal': false, 'text-lg': true })).toBe(
      'font-bold text-lg'
    );
  });

  it('retorna string vazia sem argumentos', () => {
    expect(cn()).toBe('');
  });
});
