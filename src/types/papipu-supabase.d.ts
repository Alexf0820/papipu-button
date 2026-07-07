export {};

declare global {
  interface Window {
    __PapipuSupabaseConfig?: {
      url: string;
      anonKey: string;
    };
  }
}
