import { Tabs } from "expo-router";
import React from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="pointage" // Ensure "pointage" is your initial route
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarBackground: TabBarBackground,
      }}
    >
      {/* Visible tabs */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="space-dashboard" size={30} color={color} />
          ),
          tabBarStyle: { display: "none" }, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="pointage"
        options={{
          title: "Pointage",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="car" size={30} color={color} />
          ),
          tabBarStyle: { display: "none" }, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          href: null,
          title: "Historique",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="history" size={30} color={color} />
          ),
          tabBarStyle: { display: "none" }, // Hide from tab bar
        }}
      />
      
      {/* Disable and hide the "menu" tab */}
      <Tabs.Screen
        name="menu"
        options={{
          href: null, // Prevent navigation
          tabBarStyle: { display: "none" }, // Hide from tab bar
        }}
      />
      
      {/* <Tabs.Screen name="profile" options={{ href: null }} /> */}
    </Tabs>
  );
}
