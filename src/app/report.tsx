import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { AlertCircle, MapPin, FileText, Camera, Trash2 } from "lucide-react-native";
import { useSpots } from "@/hooks/useSpots";
import { useLocation } from "@/src/hooks/useLocation";

export default function ReportScreen() {
  const router = useRouter();
  const { addSpot } = useSpots();
  const { region } = useLocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permissão negada", "Precisamos de permissão para acessar sua galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Atenção", "Preencha o título e a descrição da ocorrência.");
      return;
    }

    try {
      setLoading(true);
      await addSpot({
        title,
        description,
        location: locationName.trim() || "Localização informada",
        latitude: region?.latitude || -15.7801,
        longitude: region?.longitude || -47.9292,
        imageBase64: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
      });

      Alert.alert("Sucesso", "Ocorrência registrada com sucesso!");
      router.back();
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível registrar a ocorrência.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F9F9F6] p-6 pt-12">
      {/* BOTÃO VOLTAR */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/(drawer)/(tabs)"))}
        className="mb-6 p-2 -ml-2 self-start"
      >
        <Text className="text-[#1C1C1E] font-medium text-base">← Voltar</Text>
      </TouchableOpacity>

      {/* TÍTULO DA TELA */}
      <Heading className="text-[#1C1C1E] font-bold mb-6" size="2xl">
        Nova Ocorrência
      </Heading>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* CARD DO FORMULÁRIO */}
        <Card className="w-full p-5 rounded-[24px] bg-white border border-[#E5E5DE] shadow-sm mb-4">
          <Text className="text-[#666666] font-medium mb-4 px-1" size="xs">
            DETALHES DO PROBLEMA
          </Text>

          {/* CAMPO TÍTULO */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1.5 px-1">
              <Icon color="#1C1C1E" as={AlertCircle} size="sm" />
              <Text className="font-semibold text-[#1C1C1E] ml-2" size="sm">
                Título da Ocorrência *
              </Text>
            </View>
            <TextInput
              className="bg-[#F4F4F0] border border-[#E5E5DE] p-4 rounded-[16px] text-[#1C1C1E] text-sm"
              placeholder="Ex: Buraco profundo na via"
              placeholderTextColor="#9A9A9A"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* CAMPO LOCALIZAÇÃO / ENDEREÇO */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1.5 px-1">
              <Icon color="#1C1C1E" as={MapPin} size="sm" />
              <Text className="font-semibold text-[#1C1C1E] ml-2" size="sm">
                Local / Referência
              </Text>
            </View>
            <TextInput
              className="bg-[#F4F4F0] border border-[#E5E5DE] p-4 rounded-[16px] text-[#1C1C1E] text-sm"
              placeholder="Ex: Próximo à praça central"
              placeholderTextColor="#9A9A9A"
              value={locationName}
              onChangeText={setLocationName}
            />
          </View>

          {/* CAMPO UPLOAD DE IMAGEM */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1.5 px-1">
              <Icon color="#1C1C1E" as={Camera} size="sm" />
              <Text className="font-semibold text-[#1C1C1E] ml-2" size="sm">
                Foto do Problema
              </Text>
            </View>

            {imageBase64 ? (
              <View className="relative mt-2 rounded-[16px] overflow-hidden border border-[#E5E5DE]">
                <Image
                  source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
                  className="w-full h-48 rounded-[16px]"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setImageBase64(null)}
                  className="absolute top-3 right-3 bg-red-500 p-2 rounded-full shadow-md flex-row items-center justify-center"
                >
                  <Icon color="#ffffff" as={Trash2} size="sm" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickImage}
                className="bg-[#F4F4F0] border border-dashed border-[#CCCCCC] p-6 rounded-[16px] items-center justify-center mt-1"
              >
                <Icon color="#666666" as={Camera} size="lg" />
                <Text className="text-[#666666] font-medium text-xs mt-2">
                  Toque para selecionar uma foto da galeria
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* CAMPO DESCRIÇÃO */}
          <View className="mb-2">
            <View className="flex-row items-center mb-1.5 px-1">
              <Icon color="#1C1C1E" as={FileText} size="sm" />
              <Text className="font-semibold text-[#1C1C1E] ml-2" size="sm">
                Descrição Detalhada *
              </Text>
            </View>
            <TextInput
              className="bg-[#F4F4F0] border border-[#E5E5DE] p-4 rounded-[16px] text-[#1C1C1E] text-sm h-32"
              placeholder="Descreva o problema com mais detalhes para facilitar a verificação..."
              placeholderTextColor="#9A9A9A"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </Card>

        {/* BOTÃO DE ENVIO */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-[#1C1C1E] p-4 rounded-[20px] items-center justify-center flex-row shadow-sm mt-2"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Enviar Denúncia</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}