import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TouchableHighlight,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import * as MailComposer from "expo-mail-composer";
import * as FileSystem from "expo-file-system";
import nestApi from "@/services/apis/nest/nest";
import { Buffer } from "buffer";
import { useContacts } from "@/hooks/useContacts";
import { getSession } from "@/services/auth/session";

export default function EditSpotModal({
  selectedSpot,
  setSelectedSpot,
  updateSpot,
  deleteSpot,
}: {
  selectedSpot: any;
  setSelectedSpot: (spot: any) => void;
  updateSpot: (spot: any) => Promise<void>;
  deleteSpot: (id: number) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // contacts
  const { contacts, loading: contactsLoading, fetchContacts } = useContacts();
  const [showContactPicker, setShowContactPicker] = useState(false);

  useEffect(() => {
    if (!selectedSpot) return;
    setTitle(selectedSpot.title ?? selectedSpot.titulo ?? "");
    setDescription(selectedSpot.description ?? selectedSpot.descricao ?? "");
  }, [selectedSpot]);

  useEffect(() => {
    if (showContactPicker) fetchContacts();
  }, [showContactPicker, fetchContacts]);

  if (!selectedSpot) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Título obrigatório.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...selectedSpot,
        title: title.trim(),
        description: description.trim(),
      };
      await updateSpot(payload);
    } catch (err) {
      console.warn("Erro ao atualizar spot:", err);
      alert("Erro ao atualizar spot.");
    } finally {
      setLoading(false);
      setSelectedSpot(null);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSpot(selectedSpot.id);
    } catch (err) {
      console.warn("Erro ao deletar spot:", err);
      alert("Erro ao deletar spot.");
    } finally {
      setLoading(false);
      setSelectedSpot(null);
    }
  };

  async function writeBase64ToFile(base64: string, filename: string) {
    const path = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
    return path.startsWith("file://") ? path : `file://${path}`;
  }

  async function fetchSpotImageBase64FromApi(spotId: number): Promise<string | null> {
    try {
      const token = (await getSession()) || "";
      const res = await nestApi.get(`/spots/${spotId}/image`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(res.data);
      return buffer.toString("base64");
    } catch (err) {
      console.warn("Erro ao buscar imagem do spot via API:", err);
      return null;
    }
  }

  async function prepareAttachments(): Promise<string[]> {
    const attachments: string[] = [];

    // Prefer imageBase64 already present on selectedSpot
    if (selectedSpot.imageBase64) {
      try {
        const filename = `spot-${selectedSpot.id ?? Date.now()}.jpg`;
        const path = await writeBase64ToFile(selectedSpot.imageBase64, filename);
        attachments.push(path);
      } catch (err) {
        console.warn("Erro ao escrever imagem localmente (selectedSpot.imageBase64):", err);
      }
    } else if (selectedSpot.id) {
      // fetch from API using nestApi
      const b64 = await fetchSpotImageBase64FromApi(selectedSpot.id);
      if (b64) {
        try {
          const filename = `spot-${selectedSpot.id}.jpg`;
          const path = await writeBase64ToFile(b64, filename);
          attachments.push(path);
        } catch (err) {
          console.warn("Erro ao salvar imagem buscada:", err);
        }
      }
    }

    return attachments;
  }

  const sendEmailTo = async (recipientEmail: string) => {
    setSendingEmail(true);
    try {
      const available = await MailComposer.isAvailableAsync();
      if (!available) {
        alert("Envio de e-mail não disponível neste dispositivo.");
        setSendingEmail(false);
        return;
      }

      const subject = title || "Spot";
      const lat = selectedSpot.latitude ?? selectedSpot.lat ?? selectedSpot.location?.latitude;
      const lng = selectedSpot.longitude ?? selectedSpot.lng ?? selectedSpot.location?.longitude;
      const mapsLink =
        lat !== undefined && lng !== undefined
          ? `http://maps.google.com/maps?z=12&t=m&q=loc${lat}+${lng}`
          : "";

      const bodyParts: string[] = [];
      if (description) bodyParts.push(description);
      if (mapsLink) bodyParts.push(`Localização: ${mapsLink}`);
      const body = bodyParts.join("\n\n");

      const attachments = await prepareAttachments();

      await MailComposer.composeAsync({
        subject,
        body,
        recipients: [recipientEmail],
        attachments: attachments.length ? attachments : undefined,
      });

      setShowContactPicker(false);
      setSelectedSpot(null);
    } catch (err) {
      console.warn("Erro ao enviar e-mail:", err);
      alert("Não foi possível abrir o composer de e-mail.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <>
      <Modal visible={!!selectedSpot} transparent animationType="fade" onRequestClose={() => setSelectedSpot(null)}>
        <TouchableHighlight
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          underlayColor="rgba(0,0,0,0.5)"
          onPressOut={() => setSelectedSpot(null)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%", alignItems: "center" }}>
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
                  Editar Spot
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

                <TouchableOpacity
                  onPress={handleSave}
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
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Salvar</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
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
                  disabled={loading}
                >
                  <Text style={{ color: "#DC2626", fontWeight: "600" }}>Deletar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowContactPicker(true)}
                  style={{
                    marginTop: 10,
                    backgroundColor: "#2563EB",
                    padding: 14,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Enviar para E-mail</Text>}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableHighlight>
      </Modal>

      {/* Contact picker modal */}
      <Modal visible={showContactPicker} transparent animationType="fade" onRequestClose={() => setShowContactPicker(false)}>
        <TouchableHighlight
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          underlayColor="rgba(0,0,0,0.5)"
          onPressOut={() => setShowContactPicker(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%", alignItems: "center" }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  width: "92%",
                  borderRadius: 16,
                  padding: 12,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E5E5DE",
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <Heading size="md" style={{ marginBottom: 10 }}>
                  Selecionar Contato
                </Heading>

                {contactsLoading ? (
                  <ActivityIndicator />
                ) : (
                  <FlatList
                    data={contacts}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => sendEmailTo(item.email)}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#F0F0F0",
                        }}
                      >
                        <Text style={{ fontWeight: "600", color: "#1C1C1E" }}>{item.name}</Text>
                        <Text style={{ color: "#666666", fontSize: 12 }}>{item.email}</Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text className="text-zinc-500">Nenhum contato encontrado.</Text>}
                    style={{ maxHeight: 320 }}
                  />
                )}

                <TouchableOpacity
                  onPress={() => setShowContactPicker(false)}
                  style={{
                    marginTop: 12,
                    backgroundColor: "#FFFFFF",
                    padding: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#E5E5DE",
                  }}
                >
                  <Text style={{ color: "#1C1C1E" }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableHighlight>
      </Modal>
    </>
  );
}
