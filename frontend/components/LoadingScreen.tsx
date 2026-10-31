import { ActivityIndicator, Image, StyleSheet, View, Animated } from "react-native";
import { useEffect, useRef } from "react";

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* <Animated.Image
        source={require("../assets/images/splash.jpg")}
        style={[styles.logo, { opacity: fadeAnim }]}
      /> */}
      <ActivityIndicator size="large" color="#007BFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "gray",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
});
