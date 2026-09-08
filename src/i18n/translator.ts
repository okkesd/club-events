import messageKeys from './keys.json';

const keys: Record<string, string> = messageKeys;
export type Translate = (source: string, values?: Record<string, string | number>) => string;

// Only explicitly marked interface text goes through this function.
// Event titles, descriptions, club names and other user content must stay untouched.
export function createTranslator(read: (key: string) => unknown): Translate {
  return (source, values) => {
    const key = Object.prototype.hasOwnProperty.call(keys, source) ? keys[source] : undefined;
    const translated = key ? read(key) : source;
    const text = typeof translated === 'string' ? translated : source;
    return values ? text.replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match)) : text;
  };
}

export function isInterfaceMessage(source: string): boolean {
  return Object.prototype.hasOwnProperty.call(keys, source);
}
