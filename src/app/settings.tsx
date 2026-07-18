import React from "react";
import { View, TouchableOpacity, Platform } from "react-native"; // MUDANÇA: Importado View e TouchableOpacity para controle total do layout flutuante
import { useRouter } from "expo-router"; // MUDANÇA: Roteador importado para voltar para a Home e ir para o About
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading"; // MUDANÇA: Adicionado o Heading do Gluestack para títulos consistentes
import { Icon, InfoIcon } from "@/components/ui/icon"; // MUDANÇA: Importado o InfoIcon para a opção do "About"
import Container from "@/components/custom/Container";

export default function SettingsPage() {
  const router = useRouter(); // MUDANÇA: Instanciando o roteador do Expo Router

  return (
    // MUDANÇA: Forçando a tela a ter o fundo Off-White nativo e espaçamento elegante
    <View className="flex-1 bg-[#F9F9F6] p-6" style={{ paddingTop: Platform.OS === "ios" ? 60 : 40 }}>
      
      {/* BOTÃO VOLTAR (Minimalista com seta) */}
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={() => router.back()} 
        className="mb-8 p-2 -ml-2 self-start"
      >
        <Text className="text-[#1C1C1E] font-medium text-base">← Voltar</Text>
      </TouchableOpacity>

      {/* TÍTULO DA TELA */}
      <Heading className="text-[#1C1C1E] font-bold mb-6" size="2xl">
        Configurações
      </Heading>

      {/* CARD PRINCIPAL EM OFF-WHITE */}
      <Card className="w-full p-4 rounded-[24px] bg-white border border-[#E5E5DE] shadow-sm mb-4">
        <Text className="text-[#666666] font-medium mb-3 px-1" size="xs">
          GERAL
        </Text>

        {/* ──────────────────────────────────────────────────────────────
            MUDANÇA: BOTÃO DO ABOUT ENCAPSULADO DENTRO DAS SETTINGS
            ────────────────────────────────────────────────────────────── */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push("/about")} // MUDANÇA: Empilha a tela do About ao clicar
          className="flex-row items-center bg-[#F4F4F0] p-4 rounded-[16px] border border-transparent active:border-[#E5E5DE]"
        >
          {/* ÍCONE DE INFORMAÇÃO */}
          <View className="mr-3 bg-white p-2 rounded-xl border border-[#E5E5DE]">
            <Icon color="#1C1C1E" as={InfoIcon} size="md" />
          </View>
          
          {/* TEXTOS DO ABOUT */}
          <View className="flex-1">
            <Text className="font-semibold text-[#1C1C1E]" size="sm">
              Sobre o Aplicativo (About)
            </Text>
            <Text className="text-[#9A9A9A]" size="xs">
              Notas de versão e informações do projeto
            </Text>
          </View>

          {/* INDICADOR DE CLIQUE (Seta para a direita) */}
          <Text className="text-[#9A9A9A] font-bold text-sm" style={{ marginRight: 4 }}>
            →
          </Text>
        </TouchableOpacity>
      </Card>

      {/* TEXTO INFORMATIVO DE RODAPÉ (Tirando aquele amarelo-300 antigo sem contraste) */}
      <Text className="text-[#9A9A9A] text-center mt-4" size="xs">
        YourSpot App • Versão 1.0.0
      </Text>

    </View>
  );
}