import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  RefreshControl,
  Text,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "@/context/AuthContex";
import { CircleAlert as AlertCircle } from "lucide-react-native";
import { getListMotifs, getOrData } from "@/services/api";
import ProfileHeader from "@/components/headers/ProfileHeader";
import RepairOrderCard from "./card";
import LocalStore from "@/utils/storage"
import { useFocusEffect } from "expo-router";

export default function PointageScreen() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

    const fetchListMotifData = async () => {
      setLoading(true);
  
      try {
        const data = await getListMotifs();
        console.log("Motifs : ",data)
        await LocalStore.set("motifs", data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrData();
      console.log("Ordres de réparation : ",data)

      setData(data);
    } catch (err) {
      setError("Échec du chargement des données. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
    useFocusEffect(
      useCallback(() => {
        fetchData();
        fetchListMotifData();
      }, [])
    );
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <ProfileHeader title="Les ordres de réparation"/>
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={24} color="#d32f2f" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des données...</Text>
          </View>
        ) : data?.length > 0 ? data.map((or, index) => <RepairOrderCard key={index} {...or} />) :           <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Aucun Order de réparation</Text>
      </View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    height: "100%",
  },
  list: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    textAlign:"center"
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#ffebee",
    borderRadius: 12,
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#d32f2f",
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#5e72e4",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    color: "#666",
  },
});
