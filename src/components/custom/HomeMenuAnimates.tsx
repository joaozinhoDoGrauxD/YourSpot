import React, { memo, useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tabsConstants } from "@/src/constants/RouterLayouts";
import { HomeMenuAnimatedProps } from "@/src/types/HomeButton.types";
import HomeButton from "./HomeButtons";
const iosSmoothCurve = Easing.bezier(0.16, 1, 0.3, 1);



const HomeMenuAnimated = memo(({
  visible,
  onClose,
  onSignOut,
  onNavigate
}: HomeMenuAnimatedProps) => {
  const insets = useSafeAreaInsets();
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

const handleOptionPress = (_optionName?: string, route?: string) => {
        onClose();
        if (route) {
          setTimeout(() => onNavigate(route), 100);
        }
    };


  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    pointerEvents: opacity.value < 0.1 ? "none" : "auto",
  }));

  if (!isRendering) return null;

  const MyOut = () => {
      onClose()
      onSignOut()
  }

  return (
    <Animated.View
      style={[animatedStyle, { bottom: 95 + insets.bottom }]}
      className="absolute w-[220px] align-center items-center z-50 self-center"
    >
      <BlurView intensity={100} tint="light" className="w-full rounded-2xl border-1.5 border-white/70 shadow-lg overflow-hidden bg-white/75">

        {tabsConstants.map((tabs, index) => (
          <HomeButton key={index} text={tabs.text} close={tabs.close} name={tabs.name} icon={tabs.icon} route={tabs.route} func={!tabs.close ? handleOptionPress : MyOut }/>
        )
        )}

        
      </BlurView>

      <View
        className="w-0 h-0 border-solid border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/75 -mt-[1px]"
      />
    </Animated.View>
  );
});

export default HomeMenuAnimated;
