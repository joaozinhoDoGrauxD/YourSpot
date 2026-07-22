import React, { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  TouchableHighlight,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { SpotPayload } from "@/services/apis/yourspot/spots";
import { Buffer } from "buffer";

export default function CreateSpotModal({
  showModal,
  setShowModal,
  addSpot,
}: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  addSpot: (payload: SpotPayload) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Converte uma URI local para base64 usando fetch + arrayBuffer
  async function uriToBase64(uri: string): Promise<string | null> {
    try {
      const res = await fetch(uri);
      const buffer = await res.arrayBuffer();
      return Buffer.from(buffer).toString("base64");
    } catch (err) {
      console.warn("Erro ao converter URI para base64:", err);
      return null;
    }
  }

  async function pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permissão para acessar a galeria negada.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
        allowsEditing: true,
      });

      if (result.canceled) return;

      const asset = result.assets && result.assets[0];
      if (!asset) return;

      // previewUri para exibir a imagem no app
      if (asset.uri) setPreviewUri(asset.uri);

      // Se o ImagePicker já retornou base64, usamos direto.
      if (asset.base64) {
        // NÃO incluir prefixo data:image/... no payload; API espera base64 puro.
        setImageBase64(asset.base64);
        return;
      }

      // Caso o base64 não venha (algumas plataformas/versões), convertemos a URI para base64
      if (asset.uri) {
        const b64 = await uriToBase64(asset.uri);
        setImageBase64(b64);
      }
    } catch (err) {
      console.warn("Erro ao selecionar imagem:", err);
      alert("Não foi possível selecionar a imagem.");
    }
  }

  async function getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permissão de localização negada");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
    } catch (err) {
      console.warn("Erro ao obter localização:", err);
      alert("Não foi possível obter a localização.");
    }
  }

  async function saveSpot() {
    if (!title.trim()) {
      alert("Por favor, informe um título.");
      return;
    }

    setLoading(true);

    const payload: SpotPayload = {
      title: title.trim(),
      description: description.trim(),
      // enviar imageBase64 somente se existir (API espera base64 puro ou ausência do campo)
      ...(imageBase64 ? { imageBase64 } : {}),
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      location: "Local atual",
    };

    try {
      await addSpot(payload);
      // resetar campos após sucesso
      setTitle("");
      setDescription("");
      setImageBase64(null);
      setPreviewUri(null);
      setLatitude(null);
      setLongitude(null);
      setShowModal(false);
    } catch (err: any) {
      console.warn("Erro ao criar spot:", err);
      alert(err?.message ?? "Erro ao criar ocorrência.");
    } finally {
      setLoading(false);
    }
  }

  // Fecha modal ao tocar fora
  if (!showModal) return null;

  return (
    <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
      <TouchableHighlight
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
        activeOpacity={1}
        underlayColor="rgba(0,0,0,0.5)"
        onPressOut={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", alignItems: "center" }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                width: "92%",
                borderRadius: 16,
                padding: 18,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E5E5DE",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <Heading size="lg" style={{ marginBottom: 12 }}>
                Novo Spot
              </Heading>

              <Text style={{ fontSize: 12, color: "#666666", marginBottom: 6 }}>Título</Text>
              <TextInput
                placeholder="Título"
                value={title}
                onChangeText={setTitle}
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E5DE",
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: 10,
                  backgroundColor: "#F9F9F6",
                  color: "#1C1C1E",
                }}
                returnKeyType="next"
              />

              <Text style={{ fontSize: 12, color: "#666666", marginBottom: 6 }}>Descrição</Text>
              <TextInput
                placeholder="Descrição"
                value={description}
                onChangeText={setDescription}
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E5DE",
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: 10,
                  backgroundColor: "#F9F9F6",
                  color: "#1C1C1E",
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
                multiline
                numberOfLines={4}
              />

              <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                <TouchableOpacity
                  onPress={pickImage}
                  style={{
                    flex: 1,
                    backgroundColor: "#F4F4F0",
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#E5E5DE",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Selecionar Imagem</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={getLocation}
                  style={{
                    width: 120,
                    backgroundColor: "#F4F4F0",
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#E5E5DE",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>Obter Local</Text>
                </TouchableOpacity>
              </View>

              {previewUri ? (
                <Image
                  source={{ uri: previewUri }}
                  style={{ width: "100%", height: 180, borderRadius: 12, marginBottom: 12 }}
                  resizeMode="cover"
                />
              ) : null}

              <TouchableOpacity
                onPress={saveSpot}
                style={{
                  marginTop: 6,
                  backgroundColor: "#1C1C1E",
                  padding: 14,
                  borderRadius: 12,
                  alignItems: "center",
                }}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Salvar Spot</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{
                  marginTop: 10,
                  backgroundColor: "#FFFFFF",
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#E5E5DE",
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#1C1C1E" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableHighlight>
    </Modal>
  );
}
