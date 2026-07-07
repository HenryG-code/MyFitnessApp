import Constants from "expo-constants";

type Extra = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  webAppUrl: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const config: Extra = {
  supabaseUrl: extra.supabaseUrl ?? "",
  supabaseAnonKey: extra.supabaseAnonKey ?? "",
  webAppUrl: extra.webAppUrl ?? "https://fitness.weblytics.co.za",
};
