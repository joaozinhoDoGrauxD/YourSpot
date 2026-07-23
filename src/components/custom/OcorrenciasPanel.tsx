import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ChevronLeft, ChevronRight, AlertTriangle, Clock } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { Button, ButtonText } from "@/components/ui/button";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";

interface Ocorrencia {
  id: string;
  titulo: string;
  categoria: string;
  distancia: string;
  tempo: string;
  descricao: string;
}

interface OcorrenciasPanelProps {
  isCardOpen: boolean;
  toggleCard: () => void;
  errorMsg: string | null;
  latitude: number;
  longitude: number;
  denuncias: Ocorrencia[];
  onNewDenuncia: () => void;
  panGesture: any;
  translateX: any;
}

export default function OcorrenciasPanel({
  isCardOpen,
  toggleCard,
  errorMsg,
  latitude,
  longitude,
  denuncias,
  onNewDenuncia,
  panGesture,
  translateX
}: OcorrenciasPanelProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={animatedStyle}
        className="absolute top-[18%] right-0 w-[340px] flex-row items-center z-40"
      >
        {/* Gatilho lateral */}
        <TouchableOpacity activeOpacity={0.85} onPress={toggleCard}>
          <BlurView intensity={70} tint="light" className="w-8 h-14 rounded-l-2xl justify-center items-center border border-r-0 border-white/60 overflow-hidden bg-white/60">
            <Icon as={isCardOpen ? ChevronRight : ChevronLeft} size="md" className="text-zinc-900" />
          </BlurView>
        </TouchableOpacity>

        {/* Painel do conteúdo */}
        <BlurView intensity={70} tint="light" className="flex-1 p-4 rounded-bl-3xl border border-white/60 shadow-xl overflow-hidden bg-white/65">
          <View className="flex-row justify-between items-center mb-2.5">
            <View>
              <Heading className="text-zinc-900 font-bold" size="md">Ocorrências</Heading>
              <Text className="text-[10px] text-zinc-600 font-semibold">
                {errorMsg ? errorMsg : `Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`}
              </Text>
            </View>

            <View className="bg-red-500/10 px-2 py-1 rounded-xl flex-row items-center border border-red-500/20">
              <Icon as={AlertTriangle} size="xs" className="text-red-600 mr-1" />
              <Text className="text-[11px] font-bold text-red-600">
                {denuncias.length} perto
              </Text>
            </View>
          </View>

          <ScrollView className="max-h-[220px]" showsVerticalScrollIndicator={false}>
            {denuncias.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                className="bg-white/55 rounded-xl p-2.5 mb-2 border border-white/80 shadow-sm"
                onPress={() => alert(`Denúncia: ${item.titulo}`)}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-bold text-zinc-900 flex-1">{item.titulo}</Text>
                  <Text className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md">
                    {item.distancia}
                  </Text>
                </View>

                <Text className="text-[11px] text-zinc-600 mb-1.5" numberOfLines={2}>
                  {item.descricao}
                </Text>

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Icon as={Clock} size="xs" className="text-zinc-500 mr-1" />
                    <Text className="text-[10px] text-zinc-500">{item.tempo}</Text>
                  </View>
                  <Text className="text-[10px] font-semibold text-zinc-700">{item.categoria}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
}
