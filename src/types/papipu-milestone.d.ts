export {};

declare global {
  interface Window {
    PapipuMilestoneDebug: {
      printTable: () => void;
    };
  }
}
