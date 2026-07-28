import i18n from 'i18next';

export const createErrorTranslator = (namespace: string) => {
  return (
    message: string | undefined,
    params?: Record<string, unknown>,
  ): string | undefined => {
    if (!message) return undefined;
    return i18n.t(message, { ns: namespace, ...params });
  };
};
