import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ChevronLeft, ChevronRight, AlertTriangle, Clock } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { Button, ButtonText } from "@/components/ui/button";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import CreateSpotModal from "@/components/custom/CreateSpotModal";
import EditSpotModal from "@/components/custom/EditSpotModal";
import { useSpots } from "@/hooks/useSpots";

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
}: any) {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addSpot, updateSpot, deleteSpot } = useSpots();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX?.value || 0 }],
  }));

  return (
    <>
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
                <Heading className="text-zinc-900 font-bold" size="md">Spots</Heading>
                <Text className="text-[10px] text-zinc-600 font-semibold">
                  {errorMsg 
                    ? errorMsg 
                    : (latitude !== null && longitude !== null)
                    ? `Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`
                    : "Buscando localização..."}
                </Text>
              </View>

              <View className="bg-red-500/10 px-2 py-1 rounded-xl flex-row items-center border border-red-500/20">
                <Icon as={AlertTriangle} size="xs" className="text-red-600 mr-1" />
                <Text className="text-[11px] font-bold text-red-600">
                  {denuncias.length} spots perto
                </Text>
              </View>
            </View>

            <ScrollView className="max-h-[220px]" showsVerticalScrollIndicator={false}>
              {denuncias.length === 0 ? (
                <Text className="text-center mt-4 text-xs font-semibold text-zinc-500">
                  Nenhum spot encontrado na região.
                </Text>
              ) : (
                denuncias.map((item: any) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    className="bg-white/55 rounded-xl p-2.5 mb-2 border border-white/80 shadow-sm"
                    onPress={() => setSelectedSpot(item)}
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-xs font-bold text-zinc-900 flex-1">
                        {item.titulo || item.title}
                      </Text>
                      <Text className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md">
                        {item.distancia || "Próximo"}
                      </Text>
                    </View>

                    <Text className="text-[11px] text-zinc-600 mb-1.5" numberOfLines={2}>
                      {item.descricao || item.description}
                    </Text>

                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <Icon as={Clock} size="xs" className="text-zinc-500 mr-1" />
                        <Text className="text-[10px] text-zinc-500">{item.tempo || "Recente"}</Text>
                      </View>
                      <Text className="text-[10px] font-semibold text-zinc-700">{item.categoria || "Geral"}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View className="items-center mt-2.5">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-zinc-950 rounded-xl bg-white/80 border-1.5 h-10 active:bg-zinc-100"
                onPress={() => {
                  // abre o modal de criação de spot
                  setShowCreateModal(true);
                  // mantém compatibilidade com callback externo, se fornecido
                  if (typeof onNewDenuncia === "function") onNewDenuncia();
                }}
              >
                <ButtonText className="text-zinc-900 font-bold text-xs">+ Novo Spot</ButtonText>
              </Button>
            </View>
          </BlurView>
        </Animated.View>
      </GestureDetector>

      {/* Modal de criação de Spot */}
      <CreateSpotModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        addSpot={async (payload: any) => {
          // encaminha para o hook addSpot
          try {
            await addSpot(payload);
          } catch (err) {
            console.warn("Erro ao criar spot:", err);
            throw err;
          }
        }}
      />

      {/* Modal de edição de Spot */}
      <EditSpotModal
        selectedSpot={selectedSpot}
        setSelectedSpot={setSelectedSpot}
        updateSpot={async (payload: any) => {
          try {
            await updateSpot(payload);
          } catch (err) {
            console.warn("Erro ao atualizar spot:", err);
            throw err;
          }
        }}
        deleteSpot={async (id: number) => {
          try {
            await deleteSpot(id);
          } catch (err) {
            console.warn("Erro ao deletar spot:", err);
            throw err;
          }
        }}
      />
    </>
  );
}
