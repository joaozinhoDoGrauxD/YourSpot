import React from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F6", padding: 24, paddingTop: Platform.OS === "ios" ? 60 : 40 }}>
      {/* Botão de Voltar */}
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => router.back()} 
        style={{ marginBottom: 32, paddingVertical: 8 }}
      >
        <Text style={{ color: "#1C1C1E", fontWeight: "500" }}>← Voltar</Text>
      </TouchableOpacity>

      <Heading style={{ color: "#1C1C1E", marginBottom: 24 }} size="2xl">
        Sobre o App
      </Heading>

      <Card style={{ padding: 20, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E5DE" }}>
        <Text style={{ color: "#1C1C1E", lineHeight: 22 }}>
          Este aplicativo foi totalmente remodelado para uma experiência minimalista e fluida, utilizando o conceito Liquid Glass e paleta de cores Off-White.
        </Text>
      </Card>
    </View>
  );
}