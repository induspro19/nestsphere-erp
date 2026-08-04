import { useState, useEffect } from 'react';

/**
 * Enterprise Form Draft Preservation Hook
 * Automatically persists form state to sessionStorage so user input is retained
 * if navigating accidentally between modules.
 */
export function useFormDraft<T extends Record<string, any>>(formKey: string, initialValues: T) {
  const storageKey = `society_erp_draft_${formKey}`;

  const [values, setValues] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        return { ...initialValues, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to initial values on storage read error
    }
    return initialValues;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      // Ignore storage write errors
    }
  }, [storageKey, values]);

  const handleChange = (field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const clearDraft = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
    setValues(initialValues);
  };

  return { values, setValues, handleChange, clearDraft };
}
