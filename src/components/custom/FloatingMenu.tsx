import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { BlurView } from "expo-blur";
import { Icon } from "@/components/ui/icon";
import { Camera, Plus } from "lucide-react-native";

interface FloatingMenuProps {
  onOpenSpotModal: () => void;
  onOpenContactModal: () => void;
}

export default function FloatingMenu({ onOpenSpotModal, onOpenContactModal }: FloatingMenuProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View style={{ position: "absolute", bottom: 30, right: 30, zIndex: 60 }}>
      {showOptions && (
        <View style={{ marginBottom: 10, alignItems: "flex-end" }}>
          <TouchableOpacity
            className="bg-secondary p-2 rounded-full mb-2"
            onPress={() => {
              setShowOptions(false);
              onOpenSpotModal();
            }}
            style={{
              backgroundColor: "#F4F4F0",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: "#E5E5DE",
              marginBottom: 8,
            }}
          >
            <Text className="text-foreground text-center" style={{ color: "#1C1C1E", fontWeight: "600" }}>Criar Spot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-secondary p-2 rounded-full mb-2"
            onPress={() => {
              setShowOptions(false);
              onOpenContactModal();
            }}
            style={{
              backgroundColor: "#F4F4F0",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: "#E5E5DE",
            }}
          >
            <Text className="text-foreground text-center" style={{ color: "#1C1C1E", fontWeight: "600" }}>Criar Contato</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: "#f5c518",
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Text style={{ fontSize: 30, color: "#fff" }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
