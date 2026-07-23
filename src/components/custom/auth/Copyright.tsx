import React from "react";
import { Text } from "@/components/ui/text";
import  Constants  from "expo-constants";

export default function Copyright() {
  const version =  Constants?.expoVersion
  return (
    <Text className="text-zinc-500 text-[11px] mt-7 z-10 font-semibold tracking-wide">
      YourSpot App • Versão {version}
    </Text>
  );
}
