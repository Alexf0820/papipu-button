import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import { formatWorldCount } from "@/lib/supabase/formatCount";

export async function getWorldCount(): Promise<number> {
  const config = getSupabasePublicConfig();
  if (!isSupabaseConfigured(config)) {
    return 0;
  }

  const supabase = createClient(config.url, config.anonKey);
  const { data, error } = await supabase
    .from("button_counter")
    .select("count")
    .eq("id", 1)
    .maybeSingle();

  if (error || data?.count == null) {
    return 0;
  }

  const count = Number(data.count);
  return Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
}

export async function getFormattedWorldCount(): Promise<string> {
  return formatWorldCount(await getWorldCount());
}
