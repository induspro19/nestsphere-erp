export interface CurrencyConfig {
  currencyName: string;
  symbol: string;
  code: string;
  decimalPlaces: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
  locale: string;
}

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  currencyName: 'Indian Rupee',
  symbol: '₹',
  code: 'INR',
  decimalPlaces: 2,
  symbolPosition: 'before',
  thousandsSeparator: ',',
  decimalSeparator: '.',
  locale: 'en-IN',
};

// Global active currency configuration state (persisted in localStorage if configured)
const getInitialCurrencyConfig = (): CurrencyConfig => {
  try {
    const saved = localStorage.getItem('society_erp_currency_config');
    if (saved) {
      return { ...DEFAULT_CURRENCY_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_CURRENCY_CONFIG;
};

let activeCurrencyConfig: CurrencyConfig = getInitialCurrencyConfig();

export const setGlobalCurrencyConfig = (newConfig: Partial<CurrencyConfig>) => {
  activeCurrencyConfig = { ...activeCurrencyConfig, ...newConfig };
  try {
    localStorage.setItem('society_erp_currency_config', JSON.stringify(activeCurrencyConfig));
  } catch {
    // fallback
  }
};

export const getGlobalCurrencyConfig = (): CurrencyConfig => {
  return activeCurrencyConfig;
};

/**
 * Centralized Global Currency Formatter
 * Formats numbers into Indian Numbering System (Lakhs/Crores: ₹ 1,23,45,678.90) for INR
 * and configurable formats for other global currencies.
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  overrideOptions?: Partial<CurrencyConfig>,
): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    amount = 0;
  }

  const numVal = typeof amount === 'string' ? parseFloat(amount) : amount;
  const config = { ...activeCurrencyConfig, ...overrideOptions };

  let formattedNum = '';

  try {
    // Intl.NumberFormat with 'en-IN' locale produces Indian grouping (1,23,45,678.90)
    const formatter = new Intl.NumberFormat(config.locale || 'en-IN', {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    });
    formattedNum = formatter.format(numVal);
  } catch {
    formattedNum = numVal.toFixed(config.decimalPlaces);
  }

  if (config.symbolPosition === 'after') {
    return `${formattedNum} ${config.symbol}`.trim();
  }

  const symbolPrefix = config.symbol ? `${config.symbol} ` : '';
  return `${symbolPrefix}${formattedNum}`.trim();
};
