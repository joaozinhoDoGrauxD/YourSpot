import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Animated as RNAnimated,
  Dimensions,
  Modal,
  ActivityIndicator,
  PanResponder,
  Text as RNText,
} from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import AsyncStorage from "@react-native-async-storage/async-storage";

// REANIMATED (Importação consolidada)
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { GestureHandlerRootView, Gesture } from "react-native-gesture-handler";

import { useSession } from "@/services/auth/session";
import { useLocation } from "@/src/hooks/useLocation";
import { useSpots } from "@/hooks/useSpots";

import LeafletMap from "@/src/components/custom/LeafletMap";
import OcorrenciasPanel from "@/src/components/custom/OcorrenciasPanel";
import CreateSpotModal from "@/components/custom/CreateSpotModal";
import EditSpotModal from "@/components/custom/EditSpotModal";
import CreateContactModal from "@/components/custom/CreateContactModal";
import FloatingMenu from "@/components/custom/FloatingMenu";

import { createContact } from "@/services/apis/yourspot/contacts"; // assume existe

const windowWidth = Dimensions.get("window").width;
const CARD_WIDTH = Math.min(windowWidth * 0.85, 340);
const HIDDEN_X = CARD_WIDTH - 24;

const iosSmoothCurve = Easing.bezier(0.16, 1, 0.3, 1);

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return "";
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  if (d < 1) return `${(d * 1000).toFixed(0)}m`;
  return `${d.toFixed(1)}km`;
}

export default function App() {
  const { signOut } = useSession();
  const { region, setRegion, errorMsg, loading } = useLocation();
  const { spots, fetchSpots, addSpot, updateSpot, deleteSpot } = useSpots();

  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const router = useRouter();

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showCreateContactModal, setShowCreateContactModal] = useState<boolean>(false);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  const translateX = useSharedValue(HIDDEN_X);
  const contextX = useSharedValue(0);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  const spotsList = useMemo(() => {
    return (spots || []).map((spot: any) => ({
      id: spot.id?.toString() || Math.random().toString(),
      titulo: spot.name || spot.title || "Spot",
      categoria: spot.category || "Geral",
      distancia:
        region && spot.latitude && spot.longitude
          ? getDistance(
              region.latitude,
              region.longitude,
              spot.latitude,
              spot.longitude
            )
          : "Próximo",
      tempo: spot.createdAt ? new Date(spot.createdAt).toLocaleDateString() : "Recente",
      descricao: spot.description || "Sem descrição informada.",
      // mantém campos originais para edição
      ...spot,
    }));
  }, [spots, region]);

  const toggleCard = () => {
    if (isCardOpen) {
      translateX.value = withTiming(HIDDEN_X, { duration: 350, easing: iosSmoothCurve });
      setIsCardOpen(false);
    } else {
      translateX.value = withTiming(0, { duration: 400, easing: iosSmoothCurve });
      setIsCardOpen(true);
    }
  };

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          contextX.value = translateX.value;
        })
        .onUpdate((event) => {
          let newX = contextX.value + event.translationX;
          if (newX < 0) newX = 0;
          if (newX > HIDDEN_X) newX = HIDDEN_X;
          translateX.value = newX;
        })
        .onEnd((event) => {
          if (event.velocityX < -500 || translateX.value < HIDDEN_X / 2) {
            translateX.value = withTiming(0, { duration: 300, easing: iosSmoothCurve });
            runOnJS(setIsCardOpen)(true);
          } else {
            translateX.value = withTiming(HIDDEN_X, { duration: 300, easing: iosSmoothCurve });
            runOnJS(setIsCardOpen)(false);
          }
        }),
    [translateX, contextX]
  );

  // placeholders para compatibilidade (OcorrenciasPanel não usa draggable agora)
  const BUTTON_SIZE = 52;
  const MARGIN = 16;
  const panSettings = useRef(new RNAnimated.ValueXY({ x: windowWidth - 70, y: 480 })).current;
  const panCamera = useRef(new RNAnimated.ValueXY({ x: windowWidth - 70, y: 550 })).current;

  const responderSettings = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panSettings.setOffset({ x: (panSettings.x as any)._value, y: (panSettings.y as any)._value });
        panSettings.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, state) => {
        const windowHeight = Dimensions.get("window").height;
        const absX = state.dx + (panSettings.x as any)._offset;
        const absY = state.dy + (panSettings.y as any)._offset;
        const clX = Math.min(Math.max(MARGIN, absX), windowWidth - BUTTON_SIZE - MARGIN);
        const clY = Math.min(Math.max(MARGIN + 40, absY), windowHeight - BUTTON_SIZE - MARGIN - 100);
        panSettings.x.setValue(clX - (panSettings.x as any)._offset);
        panSettings.y.setValue(clY - (panSettings.y as any)._offset);
      },
      onPanResponderRelease: () => {
        panSettings.flattenOffset();
      },
    })
  ).current;

  const responderCamera = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        panCamera.setOffset({ x: (panCamera.x as any)._value, y: (panCamera.y as any)._value });
        panCamera.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, state) => {
        const windowHeight = Dimensions.get("window").height;
        const absX = state.dx + (panCamera.x as any)._offset;
        const absY = state.dy + (panCamera.y as any)._offset;
        const clX = Math.min(Math.max(MARGIN, absX), windowWidth - BUTTON_SIZE - MARGIN);
        const clY = Math.min(Math.max(MARGIN + 40, absY), windowHeight - BUTTON_SIZE - MARGIN - 100);
        panCamera.x.setValue(clX - (panCamera.x as any)._offset);
        panCamera.y.setValue(clY - (panCamera.y as any)._offset);
      },
      onPanResponderRelease: () => {
        panCamera.flattenOffset();
      },
    })
  ).current;

  if (loading || !region) {
    return (
      <View className="flex-1 bg-[#F9F9F6] justify-center items-center">
        <ActivityIndicator size="large" color="#1C1C1E" />
        <Text className="mt-3 font-semibold text-zinc-600">Buscando sua localização...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-[#F9F9F6]">
        <LeafletMap
          latitude={region.latitude}
          longitude={region.longitude}
          onLocationChanged={(lat, lng) =>
            setRegion((prev) => (prev ? { ...prev, latitude: lat, longitude: lng } : null))
          }
        />

        <OcorrenciasPanel
          isCardOpen={isCardOpen}
          toggleCard={toggleCard}
          errorMsg={errorMsg}
          latitude={region.latitude}
          longitude={region.longitude}
          denuncias={spotsList}
          panGesture={panGesture}
          translateX={translateX}
          onNewDenuncia={() => setShowCreateModal(true)}
        />

        {/* Floating menu (replaces draggable buttons) */}
        <FloatingMenu
          onOpenSpotModal={() => setShowCreateModal(true)}
          onOpenContactModal={() => setShowCreateContactModal(true)}
        />

        {/* Create Spot Modal */}
        <CreateSpotModal
          showModal={showCreateModal}
          setShowModal={setShowCreateModal}
          addSpot={async (payload: any) => {
            try {
              await addSpot(payload);
            } catch (err) {
              console.warn("Erro ao criar spot:", err);
              throw err;
            }
          }}
        />

        {/* Create Contact Modal */}
        <CreateContactModal
          showModal={showCreateContactModal}
          setShowModal={setShowCreateContactModal}
          addContact={async (payload: any) => {
            try {
              // chama o serviço de API para criar contato
              const res = await createContact(payload);
              return res;
            } catch (err) {
              console.warn("Erro ao criar contato:", err);
              throw err;
            }
          }}
        />

        {/* Edit Spot Modal (abre ao selecionar um spot na lista) */}
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
    </GestureHandlerRootView>
  );
}
