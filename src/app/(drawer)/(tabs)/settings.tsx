import React, { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Icon, InfoIcon } from "@/components/ui/icon";
import { LogOut } from "lucide-react-native";
import { useSession } from "@/services/auth/session";
import { getSessionExpiry } from "@/services/auth/session";

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function SettingsPage() {
  const router = useRouter();
  const { signOut, session } = useSession();
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    let interval: number | undefined;

    async function updateRemaining() {
      const expiryTs = await getSessionExpiry();
      if (!expiryTs) {
        setRemainingMs(null);
        return;
      }
      const msLeft = expiryTs - Date.now();
      setRemainingMs(msLeft);
    }

    updateRemaining();
    interval = setInterval(updateRemaining, 1000) as unknown as number;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 bg-[#F9F9F6] p-6 pt-12">
      {/* BOTÃO VOLTAR */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/(drawer)/(tabs)"))}
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

        {/* BOTÃO DO ABOUT */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/about")}
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

          <Text className="text-[#9A9A9A] font-bold text-sm mr-1">→</Text>
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
          <Text className="text-[#4A4A4A] font-mono text-xs px-1">
            Token: {session.substring(0, 20)}...
          </Text>

          <View className="mt-3">
            <Text className="text-[#666666] text-xs px-1">Tempo restante até expirar</Text>
            <Text className="text-[#1C1C1E] font-semibold text-lg mt-1">
              {remainingMs === null ? "Indisponível" : remainingMs <= 0 ? "Expirado" : formatRemaining(remainingMs)}
            </Text>
          </View>
        </Card>
      )}

      {/* RODAPÉ */}
      <Text className="text-[#9A9A9A] text-center mt-4" size="xs">
        YourSpot App • Versão 1.0.0
      </Text>
    </View>
  );
}
