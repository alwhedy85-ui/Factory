import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.alwhedy.flexduct",
  appName: "خط الفليكسيبل",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
};

export default config;
