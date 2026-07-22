import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { getSession } from "@/services/auth/session";
import { Buffer } from "buffer";
import nestApi from "@/services/apis/nest/nest";
import { useSpots } from "@/hooks/useSpots";
import EditSpotModal from "@/components/custom/EditSpotModal";

async function getImageUrl(spotId: number): Promise<string | null> {
  const token = (await getSession()) || "";
  try {
    const res = await nestApi.get(`/spots/${spotId}/image`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(res.data);
    const base64 = buffer.toString("base64");
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

function SpotItemWithImage({
  spot,
  onPress,
}: {
  spot: any;
  onPress: (spot: any) => void;
}) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getImageUrl(spot.id)
      .then((uri) => {
        if (isMounted) setImageUri(uri);
      })
      .finally(() => {
        if (isMounted) setLoadingImg(false);
      });
    return () => {
      isMounted = false;
    };
  }, [spot.id]);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onPress(spot)}>
      <Card className="w-full p-4 rounded-[24px] bg-white border border-[#E5E5DE] shadow-sm mb-4 flex-row items-center">
        {loadingImg ? (
          <View className="w-20 h-20 mr-3 justify-center items-center">
            <ActivityIndicator size="small" color="#666" />
          </View>
        ) : imageUri ? (
          <Image source={{ uri: imageUri }} className="w-20 h-20 mr-3 rounded-xl" />
        ) : (
          <View className="w-20 h-20 mr-3 rounded-xl bg-[#E5E5DE] justify-center items-center">
            <Text className="text-[#666] text-[10px]">Sem foto</Text>
          </View>
        )}

        <View className="flex-1">
          <Heading size="md" className="text-[#1C1C1E] font-semibold">
            {spot.title || spot.name || "Spot"}
          </Heading>
          <Text size="sm" className="mt-1 text-[#666]" numberOfLines={2}>
            {spot.description}
          </Text>
          <Text size="xs" className="mt-2 text-[#9A9A9A]">
            {spot.location || "Localização informada"}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function MyReportsScreen() {
  const router = useRouter();
  const { spots, loading, error, fetchSpots, updateSpot, deleteSpot } = useSpots();
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

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

      {/* TÍTULO */}
      <Heading className="text-[#1C1C1E] font-bold mb-6" size="2xl">
        Meus Spots
      </Heading>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {loading && <ActivityIndicator size="large" color="#000" className="mt-6" />}
        {error && <Text className="text-red-500">{error}</Text>}

        {!loading && spots.length === 0 && (
          <Text className="text-center mt-6 text-[#9A9A9A]">Nenhum spot registrado por você.</Text>
        )}

        {spots.map((spot) => (
          <SpotItemWithImage key={spot.id} spot={spot} onPress={(s) => setSelectedSpot(s)} />
        ))}
      </ScrollView>

      {/* Edit Spot Modal */}
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
    </View>
  );
}
