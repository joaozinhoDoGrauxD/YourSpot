import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Icon, InfoIcon } from "@/components/ui/icon";
import { LogOut } from "lucide-react-native";
import Copyright from "@/src/components/custom/auth/Copyright";
import { useSession, getSessionExpiry } from "@/services/auth/session";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { signOut, session } = useSession();
  const [expiry, setExpiry] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("Calculando...");

  useEffect(() => {
    async function fetchExpiry() {
      const exp = await getSessionExpiry();
      setExpiry(exp);
    }
    fetchExpiry();
  }, []);

  useEffect(() => {
    if (!expiry) {
      setTimeRemaining("Não configurado");
      return;
    }
    const interval = setInterval(() => {
      const now = Date.now();
      let normExpiry = expiry;
      if (normExpiry < 10000000000) {
        normExpiry = normExpiry * 1000;
      }
      const diff = normExpiry - now;
      if (diff <= 0) {
        setTimeRemaining("Sessão expirada");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s restantes`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View className="flex-1 bg-[#F9F9F6] p-6 pt-12">
      {/* BOTÃO VOLTAR */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")}
        className="mb-8 p-2 -ml-2 self-start"
      >
        <Text className="text-[#1C1C1E] font-medium text-base">← Voltar</Text>
      </TouchableOpacity>

      {/* TÍTULO DA TELA */}
      <Heading className="text-[#1C1C1E] font-bold mb-6" size="2xl">
        Configurações
      </Heading>

      {/* CARD PRINCIPAL */}
      <Card className="w-full p-4 rounded-[24px] bg-white border border-[#E5E5DE] shadow-sm mb-4">
        <Text className="text-[#666666] font-medium mb-3 px-1" size="xs">
          GERAL
        </Text>

        {/* BOTÃO DO ABOUT ENCAPSULADO */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("About")}
          className="flex-row items-center bg-[#F4F4F0] p-4 rounded-[16px] border border-transparent active:border-[#E5E5DE] mb-3"
        >
          <View className="mr-3 bg-white p-2 rounded-xl border border-[#E5E5DE]">
            <Icon color="#1C1C1E" as={InfoIcon} size="md" />
          </View>

          <View className="flex-1">
            <Text className="font-semibold text-[#1C1C1E]" size="sm">
              Sobre o Aplicativo (About)
            </Text>
            <Text className="text-[#9A9A9A]" size="xs">
              Notas de versão e informações do projeto
            </Text>
          </View>

          <Text className="text-[#9A9A9A] font-bold text-sm mr-1">
            →
          </Text>
        </TouchableOpacity>

        {/* BOTÃO LOGOUT */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSignOut}
          className="flex-row items-center bg-red-50 p-4 rounded-[16px] border border-transparent active:border-red-200"
        >
          <View className="mr-3 bg-white p-2 rounded-xl border border-red-200">
            <Icon color="#DC2626" as={LogOut} size="md" />
          </View>

          <View className="flex-1">
            <Text className="font-semibold text-[#DC2626]" size="sm">
              Sair da Conta
            </Text>
            <Text className="text-red-400" size="xs">
              Encerrar sua sessão atual com segurança
            </Text>
          </View>
        </TouchableOpacity>
      </Card>

      {session && (
        <Card className="w-full p-4 rounded-[24px] bg-white border border-[#E5E5DE] shadow-sm mb-4">
          <Text className="text-[#666666] font-medium mb-1 px-1" size="xs">
            SESSÃO ATIVA
          </Text>
          <Text className="text-[#4A4A4A] font-mono text-xs px-1 mb-2">
            Token: {session.substring(0, 20)}...
          </Text>
          <Text className="text-[#666666] font-medium mb-1 px-1 mt-2" size="xs">
            TEMPO EXPIRAÇÃO
          </Text>
          <Text className="text-[#1C1C1E] font-semibold text-sm px-1">
            {timeRemaining}
          </Text>
        </Card>
      )}

     <Copyright/> 

     </View>
  );
}
