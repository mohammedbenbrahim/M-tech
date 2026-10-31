import { Stack } from "expo-router";
import React from "react";

export default function PointageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index" >
      {/* Main Pointage screen */}
      <Stack.Screen name="index" />
      {/* Hidden screens, accessible only through navigation */}
      <Stack.Screen name="operations" />
    </Stack>
  );
}
