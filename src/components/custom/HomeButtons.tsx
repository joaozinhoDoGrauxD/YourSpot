import React, { ReactNode } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { HomeButtonProps } from '@/src/types/HomeButton';

export default function HomeButton({ icon, text, route, name, close, func }: HomeButtonProps): ReactNode {

    return !close ?
        (
            <View>
                <TouchableOpacity
                    activeOpacity={0.6}
                    className="py-3 px-5 w-full flex-row items-center justify-start"
                    onPress={() => func(name , route )}
                >
                    <Icon as={icon} size="md" className="text-zinc-900 mr-3" />
                    <Text className="text-[15px] font-semibold text-zinc-900 tracking-tight">{text}</Text>
                </TouchableOpacity>
                <View className="h-[1px] bg-black/10 mx-3" />
            </View>

        ) : (
            <View>
                <TouchableOpacity
                    activeOpacity={0.6}
                    className="py-3 px-5 w-full flex-row items-center justify-start bg-red-500/10"
                    onPress={() => func()}
                >
                    <Icon as={icon} size="md" className="text-red-600 mr-3" />
                    <Text className="text-[15px] font-semibold text-red-600 tracking-tight">Sair da Conta</Text>
                </TouchableOpacity>
            </View>
        )
}

