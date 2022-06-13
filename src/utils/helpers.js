import { EN } from './languages'
import config from '../constants/config';

/**
 * If you want to enable logs from datafeed set it to `true`
 */
const isLoggingEnabled = config.LOG_VIEW;

export function logMessage(...message) {
  if (isLoggingEnabled) {
    const now = new Date();
    // tslint:disable-next-line:no-console
    console.log(`${now.toLocaleTimeString()}.${now.getMilliseconds()}> ${message}`);
  }
}

export function getErrorMessage(error) {
  if (error === undefined) {
    return '';
  }
  else if (typeof error === 'string') {
    return error;
  }
  return error.message;
}

const publicUrl = process.env.PUBLIC_URL

export const LS_KEY = 'pancakeswap_language'

export const fetchLocale = async (locale) => {
  const response = await fetch(`${publicUrl}/locales/${locale}.json`)
  const data = await response.json()
  return data
}

export const getLanguageCodeFromLS = () => {
  try {
    const codeFromStorage = localStorage.getItem(LS_KEY)

    return codeFromStorage || EN.locale
  } catch {
    return EN.locale
  }
}
