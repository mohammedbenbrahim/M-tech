import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { User, LogOut, XCircle } from "lucide-react-native";
import { useAuth } from "@/context/AuthContex";
import EmptyHeader from "@/components/headers/EmptyHeader";

export default function MenuScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", onPress: () => logout(), style: "destructive" },
    ]);
  };

  const handleExit = () => {
    Alert.alert("Quitter l'application", "Voulez-vous vraiment quitter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Quitter", onPress: () => BackHandler.exitApp(), style: "destructive" },
    ]);
  };

  const menuItems = [
    {
      icon: <User size={24} color="#5e72e4" />,
      title: "Mon profil",
      description: "Afficher et modifier votre profil",
      onPress: () => router.push("/(tabs)/menu/profile"),
    },
  ];

  return (
    <View style={styles.container}>
      <EmptyHeader backgroundColor="#fff" />

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
          }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Nouressaid Ahmed</Text>
          <Text style={styles.profileEmail}>a.nouressaid@autohall.ma</Text>
        </View>
      </View>

      {/* Scrollable Menu */}
      <ScrollView contentContainerStyle={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemIcon}>{item.icon}</View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fixed Buttons (Logout & Exit) */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <LogOut size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Déconnexion</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.exitButton]} onPress={handleExit}>
          <XCircle size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Quitter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fe",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  menuList: {
    flexGrow: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  menuItemDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginTop: 2,
  },
  bottomButtons: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButton: {
    backgroundColor: "#f5365c",
  },
  exitButton: {
    backgroundColor: "#333",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});

