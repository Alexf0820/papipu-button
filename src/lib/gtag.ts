export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";

export const APP_NAME = "papipu_button";

export function isGaEnabled(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}
