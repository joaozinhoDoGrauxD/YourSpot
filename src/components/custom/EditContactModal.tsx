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
} from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function EditContactModal({
  selectedContact,
  setSelectedContact,
  updateContact,
  deleteContact,
}: {
  selectedContact: any;
  setSelectedContact: (contact: any) => void;
  updateContact: (contact: any) => Promise<any>;
  deleteContact: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedContact) return;
    setName(selectedContact.name ?? "");
    setEmail(selectedContact.email ?? "");
  }, [selectedContact]);

  if (!selectedContact) return null;

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Por favor, preencha nome e e-mail.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...selectedContact, name: name.trim(), email: email.trim() };
      await updateContact(payload);
    } catch (err) {
      console.warn("Erro ao atualizar contato:", err);
      alert("Erro ao atualizar contato.");
    } finally {
      setLoading(false);
      setSelectedContact(null);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteContact(selectedContact.id);
    } catch (err) {
      console.warn("Erro ao deletar contato:", err);
      alert("Erro ao deletar contato.");
    } finally {
      setLoading(false);
      setSelectedContact(null);
    }
  };

  return (
    <Modal visible={!!selectedContact} transparent animationType="fade" onRequestClose={() => setSelectedContact(null)}>
      <TouchableHighlight
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
        activeOpacity={1}
        underlayColor="rgba(0,0,0,0.5)"
        onPressOut={() => setSelectedContact(null)}
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
                Editar Contato
              </Heading>

              <Text style={{ fontSize: 12, color: "#666666", marginBottom: 6 }}>Nome</Text>
              <TextInput
                placeholder="Nome"
                value={name}
                onChangeText={setName}
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

              <Text style={{ fontSize: 12, color: "#666666", marginBottom: 6 }}>E-mail</Text>
              <TextInput
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E5DE",
                  padding: 12,
                  marginBottom: 12,
                  borderRadius: 10,
                  backgroundColor: "#F9F9F6",
                  color: "#1C1C1E",
                }}
                returnKeyType="done"
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
                <Text style={{ color: "#fff", fontWeight: "600" }}>{loading ? "Salvando..." : "Salvar Contato"}</Text>
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
                <Text style={{ color: "#DC2626", fontWeight: "600" }}>Deletar Contato</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableHighlight>
    </Modal>
  );
}
