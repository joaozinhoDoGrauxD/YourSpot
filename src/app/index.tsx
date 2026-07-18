import React, { useState, useRef, useEffect, memo } from "react";
import { 
  View, 
  TouchableOpacity, 
  Animated as RNAnimated, 
  Platform, 
  StyleSheet, 
  Dimensions, 
  Modal, 
  ActivityIndicator, 
  PanResponder
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import { Button, ButtonText } from "@/components/ui/button";

// ÍCONES COM GLUESTACK + LUCIDE NATIVO
import { Icon } from "@/components/ui/icon";
import { Settings, Home, Camera, MapPin, Info, ChevronLeft, ChevronRight } from "lucide-react-native"; 

// REANIMATED CONFIGURADO PARA ALTA FLUIDEZ (120HZ STYLE)
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming, runOnJS, FadeInDown, FadeOutDown } from "react-native-reanimated";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";

import * as ImagePicker from "expo-image-picker";

// Import condicional nativo
let Location: any = null;
let WebViewComponent: any = null;

if (Platform.OS !== "web") {
  Location = require("expo-location");
  WebViewComponent = require("react-native-webview").WebView;
}

const windowWidth = Dimensions.get("window").width;
const CARD_WIDTH = Math.min(windowWidth * 0.85, 340);
const HIDDEN_X = CARD_WIDTH - 24; 

const iosSmoothCurve = Easing.bezier(0.16, 1, 0.3, 1);

// --- COMPONENTE ANIMADO DO MENU ---
const HomeMenuAnimated = memo(({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsRendering(true);
      opacity.value = withTiming(1, { duration: 350, easing: iosSmoothCurve });
      translateY.value = withTiming(0, { duration: 400, easing: iosSmoothCurve });
    } else {
      opacity.value = withTiming(0, { duration: 250, easing: Easing.linear });
      translateY.value = withTiming(15, { duration: 300, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) runOnJS(setIsRendering)(false);
      });
    }
  }, [visible]);

  const handleOptionPress = (optionName: string) => {
    onClose();
    setTimeout(() => alert(optionName), 100); 
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    pointerEvents: opacity.value < 0.1 ? "none" : "auto",
  }));

  if (!isRendering) return null;

  return (
    <Animated.View style={[styles.homeMenuContainer, animatedStyle]}>
      <View style={styles.iosPremiumMenu}>
        <TouchableOpacity activeOpacity={0.6} style={styles.iosMenuItem} onPress={() => handleOptionPress('📍 Meus Locais')}>
          <Icon as={MapPin} size="md" style={styles.iosMenuIcon} />
          <Text style={styles.iosMenuItemText}>Meus Locais</Text>
        </TouchableOpacity>
        
        <View style={styles.iosMenuDivider} />
        
        <TouchableOpacity activeOpacity={0.6} style={styles.iosMenuItem} onPress={() => handleOptionPress('ℹ️ Sobre o App')}>
          <Icon as={Info} size="md" style={styles.iosMenuIcon} />
          <Text style={styles.iosMenuItemText}>Sobre o App</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.iosMenuArrow} />
    </Animated.View>
  );
});

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHomeMenu, setShowHomeMenu] = useState<boolean>(false); 
  const [showCameraPopup, setShowCameraPopup] = useState<boolean>(false); 
  const [isCardOpen, setIsCardOpen] = useState<boolean>(false);
  const router = useRouter();

  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  const webViewRef = useRef<any>(null);

  const translateX = useSharedValue(HIDDEN_X);
  const contextX = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => { setRegion({ latitude: position.coords.latitude, longitude: position.coords.longitude, latitudeDelta: 0.00922, longitudeDelta: 0.00421 }); },
          () => { setErrorMsg("Permissão de localização negada."); setRegion({ latitude: -15.7801, longitude: -47.9292, latitudeDelta: 0.09, longitudeDelta: 0.09 }); }
        );
      }
      return;
    }

    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("A permissão de acesso ao GPS foi negada.");
          setRegion({ latitude: -15.7801, longitude: -47.9292, latitudeDelta: 0.09, longitudeDelta: 0.09 });
          return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setRegion({ latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude, latitudeDelta: 0.00922, longitudeDelta: 0.00421 });
      } catch (err) {
        setErrorMsg("Erro ao buscar GPS nativo.");
        setRegion({ latitude: -15.7801, longitude: -47.9292, latitudeDelta: 0.09, longitudeDelta: 0.09 });
      }
    }
    getCurrentLocation();
  }, []);

  const toggleCard = () => {
    if (isCardOpen) {
      translateX.value = withTiming(HIDDEN_X, { duration: 350, easing: iosSmoothCurve });
      setIsCardOpen(false);
    } else {
      translateX.value = withTiming(0, { duration: 400, easing: iosSmoothCurve });
      setIsCardOpen(true);
    }
  };

  const panGesture = Gesture.Pan()
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
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Tamanhos de referência para bolinhas flutuantes e colisão
  const BUTTON_SIZE = 52;
  const MARGIN = 16;
  const panSettings = useRef(new RNAnimated.ValueXY({ x: Dimensions.get("window").width - 70, y: 480 })).current;
  const panCamera = useRef(new RNAnimated.ValueXY({ x: Dimensions.get("window").width - 70, y: 550 })).current;

  const checkAndResolveCollision = (movedButton: 'settings' | 'camera') => {
    const xS = (panSettings.x as any)._value;
    const yS = (panSettings.y as any)._value;
    const xC = (panCamera.x as any)._value;
    const yC = (panCamera.y as any)._value;
    const distance = Math.sqrt(Math.pow(xS - xC, 2) + Math.pow(yS - yC, 2));

    if (distance < BUTTON_SIZE + 5) {
      const window = Dimensions.get("window");
      if (movedButton === 'settings') {
        let newX = xS - 60 < MARGIN ? xS + 60 : xS - 60;
        let newY = yS - 30 < MARGIN + 40 ? yS + 60 : yS - 30;
        RNAnimated.spring(panSettings, { toValue: { x: newX, y: newY }, useNativeDriver: false, bounciness: 12 }).start();
      } else {
        let newX = xC - 60 < MARGIN ? xC + 60 : xC - 60;
        let newY = yC + 60 > window.height - BUTTON_SIZE - MARGIN - 100 ? yC - 60 : yC + 60;
        RNAnimated.spring(panCamera, { toValue: { x: newX, y: newY }, useNativeDriver: false, bounciness: 12 }).start();
      }
    }
  };

  const isDraggingSettings = useRef(false);
  const isDraggingCamera = useRef(false);

  // Criando os PanResponders Oficiais do React Native (Livre de erros de tipo)
  const responderSettings = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDraggingSettings.current = false;
        panSettings.setOffset({ x: (panSettings.x as any)._value, y: (panSettings.y as any)._value });
        panSettings.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, state) => {
        isDraggingSettings.current = true;
        const window = Dimensions.get("window");
        const absX = state.dx + (panSettings.x as any)._offset;
        const absY = state.dy + (panSettings.y as any)._offset;
        const clX = Math.min(Math.max(MARGIN, absX), window.width - BUTTON_SIZE - MARGIN);
        const clY = Math.min(Math.max(MARGIN + 40, absY), window.height - BUTTON_SIZE - MARGIN - 100);
        panSettings.x.setValue(clX - (panSettings.x as any)._offset);
        panSettings.y.setValue(clY - (panSettings.y as any)._offset);
      },
      onPanResponderRelease: () => {
        panSettings.flattenOffset();
        checkAndResolveCollision('settings');
        setTimeout(() => { isDraggingSettings.current = false; }, 100);
      }
    })
  ).current;

  const responderCamera = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDraggingCamera.current = false;
        panCamera.setOffset({ x: (panCamera.x as any)._value, y: (panCamera.y as any)._value });
        panCamera.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, state) => {
        isDraggingCamera.current = true;
        const window = Dimensions.get("window");
        const absX = state.dx + (panCamera.x as any)._offset;
        const absY = state.dy + (panCamera.y as any)._offset;
        const clX = Math.min(Math.max(MARGIN, absX), window.width - BUTTON_SIZE - MARGIN);
        const clY = Math.min(Math.max(MARGIN + 40, absY), window.height - BUTTON_SIZE - MARGIN - 100);
        panCamera.x.setValue(clX - (panCamera.x as any)._offset);
        panCamera.y.setValue(clY - (panCamera.y as any)._offset);
      },
      onPanResponderRelease: () => {
        panCamera.flattenOffset();
        checkAndResolveCollision('camera');
        setTimeout(() => { isDraggingCamera.current = false; }, 100);
      }
    })
  ).current;

  const openNativeCamera = async () => {
    setShowCameraPopup(false); 
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) { alert("Você recusou o acesso à câmera!"); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) { alert("Foto capturada com sucesso!"); }
  };

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "LOCATION_CHANGED") { setRegion(prev => prev ? { ...prev, latitude: data.latitude, longitude: data.longitude } : null); }
    } catch (e) {}
  };

  if (!region) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#1C1C1E" />
        <Text style={{ marginTop: 12, fontWeight: "600", color: "#4A4A4A" }}>Buscando sua localização...</Text>
      </View>
    );
  }

  const mapMobileHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background-color: #E5E5DE; }
        .leaflet-control-geocoder {
          position: fixed !important; top: 35px !important; left: 50% !important; transform: translateX(-50%) !important;
          width: 88% !important; max-width: 440px !important; margin: 0 !important; border-radius: 16px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; border: 1px solid rgba(0,0,0,0.06) !important;
          overflow: hidden; background: #FFFFFF !important; z-index: 99999 !important;
        }
        .leaflet-control-geocoder-form { width: 100% !important; display: flex !important; }
        .leaflet-control-geocoder-form input {
          font-size: 16px !important; padding: 14px 16px !important; width: 100% !important; border: none !important; outline: none !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .leaflet-control-geocoder-icon { display: none !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${region.latitude}, ${region.longitude}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        var marker = L.marker([${region.latitude}, ${region.longitude}]).addTo(map);
        
        L.Control.geocoder({ 
          defaultMarkGeocode: false, 
          placeholder: "📍 Buscar localização...",
          collapsed: false
        }).on('markgeocode', function(e) { 
          var center = e.geocode.center; map.flyTo(center, 16, { animate: true, duration: 1.5 }); marker.setLatLng(center); 
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOCATION_CHANGED', latitude: center.lat, longitude: center.lng })); 
        }).addTo(map);
      </script>
    </body>
    </html>
  `;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* MAPA */}
        <View style={styles.mapContainer}>
          {Platform.OS === "web" ? (
            <iframe width="100%" height="100%" style={{ border: 0 }} src={`https://maps.google.com/maps?q=${region.latitude},${region.longitude}&z=15&output=embed`} />
          ) : (
            WebViewComponent && (
              <WebViewComponent ref={webViewRef} originWhitelist={['*']} source={{ html: mapMobileHTML }} style={{ flex: 1 }} domStorageEnabled={true} javaScriptEnabled={true} onMessage={handleMapMessage} />
            )
          )}
        </View>

        {/* PAINEL LATERAL RETRÁTIL */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.sidePanelContainer, animatedCardStyle]}>
            
            {/* ABA DA SETINHA */}
            <TouchableOpacity activeOpacity={0.9} style={styles.tabTrigger} onPress={toggleCard}>
              <Icon as={isCardOpen ? ChevronRight : ChevronLeft} size="md" style={{ color: "#1C1C1E" }} />
            </TouchableOpacity>

            {/* CONTEÚDO DO CARD */}
            <View style={styles.liquidGlassCard}>
              <Heading style={styles.cardHeading} size="md">Informações</Heading>
              <Text style={styles.cardSubtext} size="xs">
                {errorMsg ? errorMsg : `GPS: Lat ${region.latitude.toFixed(4)}, Lon ${region.longitude.toFixed(4)}`}
              </Text>
              
              <Center style={{ marginTop: 16 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  style={styles.actionButton} 
                  onPress={() => router.push("/sua-nova-rota")}
                >
                  {/* Corrigido: Removido size="xs" incompatível do ButtonText */}
                  <ButtonText style={{ color: "#1C1C1E", fontWeight: "600", fontSize: 12 }}>Clique aqui</ButtonText>
                </Button>
              </Center>
            </View>

          </Animated.View>
        </GestureDetector>

        {/* MENU DA CASINHA ANIMADO */}
        <HomeMenuAnimated visible={showHomeMenu} onClose={() => setShowHomeMenu(false)} />

        {/* POP-UP MODAL AMBIENTAL */}
        <Modal visible={showCameraPopup} transparent={true} animationType="none">
          <View style={styles.modalOverlay}>
            {showCameraPopup && (
              <Animated.View entering={FadeInDown.duration(350).easing(iosSmoothCurve)} exiting={FadeOutDown.duration(220)} style={styles.liquidGlassModal}>
                <Heading style={styles.modalHeading} size="md">Denúncia Ambiental</Heading>
                <Text style={styles.modalText}>Tire foto de algum problema ambiental e envie para nos!</Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: "rgba(0,0,0,0.05)" }]} onPress={() => setShowCameraPopup(false)}><Text style={[styles.modalButtonText, { color: "#666" }]}>Cancelar</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#1C1C1E" }]} onPress={openNativeCamera}><Text style={[styles.modalButtonText, { color: "#FFF" }]}>Abrir Câmera</Text></TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </Modal>

        {/* BOTÃO HOME */}
        <TouchableOpacity activeOpacity={0.8} style={[styles.homeButton, showHomeMenu && styles.homeButtonActive]} onPress={() => setShowHomeMenu(!showHomeMenu)}>
          <Icon as={Home} size="xl" style={{ color: "#1C1C1E" }} />
        </TouchableOpacity>

        {/* BOTÃO ENGRENAGEM MÓVEL CORRIGIDO COM PANRESPONDER NATIVO */}
        <RNAnimated.View 
          {...responderSettings.panHandlers}
          style={[panSettings.getLayout(), styles.draggable]}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={() => { if (!isDraggingSettings.current) router.push("/settings"); }} style={styles.settingsButton}>
            <Icon as={Settings} size="md" style={{ color: "#1C1C1E" }} />
          </TouchableOpacity>
        </RNAnimated.View>

        {/* BOTÃO DA CÂMERA FLUTUANTE MÓVEL CORRIGIDO COM PANRESPONDER NATIVO */}
        <RNAnimated.View 
          {...responderCamera.panHandlers}
          style={[panCamera.getLayout(), styles.draggable]}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={() => { if (!isDraggingCamera.current) setShowCameraPopup(true); }} style={styles.cameraButton}>
            <Icon as={Camera} size="md" style={{ color: "#FFFFFF" }} />
          </TouchableOpacity>
        </RNAnimated.View>

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F6" },
  mapContainer: { ...StyleSheet.absoluteFill },
  draggable: { position: "absolute", zIndex: 999 },
  
  sidePanelContainer: {
    position: "absolute", top: "18%", right: 0, width: CARD_WIDTH, flexDirection: "row", alignItems: "center", zIndex: 90
  },
  tabTrigger: {
    width: 32, height: 56, backgroundColor: "#FFFFFF", borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
    justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)", borderRightWidth: 0,
    shadowColor: "#000", shadowOffset: { width: -4, height: 4 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3
  },
  liquidGlassCard: {
    flex: 1, padding: 18, backgroundColor: "#FFFFFF", borderTopLeftRadius: 0, borderBottomLeftRadius: 20,
    borderTopRightRadius: 0, borderBottomRightRadius: 0, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: "#000", shadowOffset: { width: -8, height: 12 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8,
  },
  cardHeading: { color: "#1C1C1E", marginBottom: 4, fontWeight: "700" },
  cardSubtext: { color: "#666666", marginBottom: 6, fontWeight: "500" },
  actionButton: { width: "100%", borderColor: "#1C1C1E", borderRadius: 10, backgroundColor: "#FFFFFF", borderWidth: 1.5, height: 38 },
  
  homeMenuContainer: { position: "absolute", bottom: 120, width: 220, alignSelf: "center", alignItems: "center", zIndex: 99 },
  iosPremiumMenu: {
    width: "100%", borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6, overflow: "hidden"
  },
  iosMenuItem: { paddingVertical: 14, paddingHorizontal: 20, width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" },
  iosMenuIcon: { color: "#1C1C1E", marginRight: 12 },
  iosMenuItemText: { fontSize: 15, fontWeight: "600", color: "#1C1C1E", letterSpacing: -0.2 },
  iosMenuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(0, 0, 0, 0.1)", marginHorizontal: 12 },
  iosMenuArrow: { width: 0, height: 0, backgroundColor: "transparent", borderStyle: "solid", borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 8, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#FFFFFF", marginTop: -1 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center" },
  liquidGlassModal: {
    width: "85%", maxWidth: 320, padding: 24, borderRadius: 24, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)", shadowColor: "#000", shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10
  },
  modalHeading: { textAlign: "center", color: "#1C1C1E", marginBottom: 12, fontWeight: "700" },
  modalText: { textAlign: "center", color: "#333", fontSize: 14, lineHeight: 20, marginBottom: 20, fontWeight: "500" },
  modalButtonContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", marginHorizontal: 6 },
  modalButtonText: { fontSize: 14, fontWeight: "600" },

  homeButton: { position: "absolute", bottom: 40, left: (Dimensions.get("window").width / 2) - 32, width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, zIndex: 100 },
  homeButtonActive: { transform: [{ scale: 0.95 }], backgroundColor: "#F4F4F0" },
  settingsButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
  cameraButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#1C1C1E", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 }
});