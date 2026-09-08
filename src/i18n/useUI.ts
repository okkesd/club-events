"use client";

import {useMemo} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {createTranslator, isInterfaceMessage} from './translator';
import {localeTags, type Locale} from './config';

export function useUI() {
  const language = useLocale() as Locale;
  const messages = useTranslations();
  const t = useMemo(() => createTranslator((key) => messages.raw(key)), [messages]);
  const errorText = (source: string) => t(isInterfaceMessage(source) ? source : "Something went wrong. Please try again.");
  return {t, errorText, locale: localeTags[language], language};
}
