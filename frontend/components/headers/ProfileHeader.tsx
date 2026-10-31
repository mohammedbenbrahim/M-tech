import { Colors } from "@/constants/Colors";
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { ArrowLeft, Bell, List } from "lucide-react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContex";
import { HelloWave } from "../HelloWave";

interface ProfileHeaderProps {
  backgroundColor?: string;
  backTo?: string;
  title?: string;
  children?: React.ReactNode; // Add children prop
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  backgroundColor = Colors.light.headerBackground,
  backTo = null,
  title = null,
  children, // Destructure children
}) => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor }]} />
      <View
        style={[
          styles.headerProfile,
          {
            backgroundColor,
            borderBottomLeftRadius: children ? 0 : 20,
            borderBottomRightRadius: children ? 0 : 20,
          },
        ]}
      >
        {/* Left: Profile Image & Text */}
        <View style={styles.leftContainer}>
          {backTo ? (
            <Link push href={backTo} asChild style={styles.backTo}>
              <ArrowLeft size={24} color="#fff" />
            </Link>
          ) : (
            // <TouchableOpacity
            //   style={styles.backTo}
            //   onPress={() => router.push(backTo)}
            // >
            //   <ArrowLeft size={24} color="#fff" />
            // </TouchableOpacity>
            <TouchableOpacity
              style={styles.backTo}
              onPress={() => router.push("/(tabs)/menu")}
            >
              <List size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={styles.greeting}>
            {title ? title : `Bonjour, ${user?.fullName || "Ahmed"}`}
          </Text>
        </View>

        {/* Right: Notification Icon */}
        {/* <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => console.log("Notifications clicked")}
        >
          <Bell size={24} color="#fff" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity> */}
      </View>
      {children && (
        <View style={[styles.child, { backgroundColor }]}>{children}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginBottom: 10,
    height: "auto", // Adjust height for better visibility
    minHeight: 30,
    width: "100%",
    backgroundColor: "transparent",
  },
  header: {
    height: "auto", // Adjust height for better visibility
    minHeight: 30,
    width: "100%",
  },
  headerProfile: {
    height: 60, // Adjust height for better visibility
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },
  child: {
    height: "auto", // Adjust height for better visibility
    width: "100%",
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 5,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circular shape
    marginRight: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Medium",
  },
  notificationButton: {
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  backTo: {
    marginRight: 10,
  },
});

export default ProfileHeader;
