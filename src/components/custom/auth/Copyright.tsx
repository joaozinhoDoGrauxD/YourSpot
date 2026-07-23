import React from "react";
import { Text } from "@/components/ui/text";
import  Constants  from "expo-constants";

export default function Copyright() {
  const appConfig = {
    version:  Constants?.expoConfig?.version,
    name: Constants?.expoConfig?.name
  }
  return (
    <Text className="text-zinc-500 text-[11px] mt-7 z-10 font-semibold tracking-wida text-center">
      {appConfig.name} • v{appConfig.version}
    </Text>
  );
}
