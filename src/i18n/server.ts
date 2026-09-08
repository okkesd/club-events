import {getLocale, getTranslations} from 'next-intl/server';
import {createTranslator} from './translator';
import {localeTags, type Locale} from './config';

export async function getUI() {
  const [language, messages] = await Promise.all([getLocale(), getTranslations()]);
  return {t: createTranslator((key) => messages.raw(key)), locale: localeTags[language as Locale]};
}
