export {};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    PapipuAnalytics: {
      trackPageView: () => void;
      trackMainButtonClick: (params?: Record<string, unknown>) => void;
      trackShareClick: (params?: Record<string, unknown>) => void;
      trackSaveImageClick: (params?: Record<string, unknown>) => void;
      trackSupportClick: (params?: Record<string, unknown>) => void;
    };
  }
}
