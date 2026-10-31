import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import ProfileHeader from "@/components/headers/ProfileHeader";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  Gauge,
  Hash,
} from "lucide-react-native";
import { getOperationListData } from "@/services/api";
import LocalStore from "@/utils/storage";
import OperationCard from "./card";

export default function Operations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const [orData, setOrData] = useState({
    numOr: "",
    marque: "",
    model: "",
    matricule: "",
    kilometrage: 0,
    dateLivraison: "",
  });

  const getOrData = async () => {
    try {
      const orFromStore = await LocalStore.get("or");
      setOrData(orFromStore);
    } catch (error) {
      console.error("Error parsing orData:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const numOr = (await LocalStore.get("or"))?.numOr;
      const data = await getOperationListData(parseInt(numOr));
      setData(data);
    } catch (err) {
      setError("Échec du chargement des données. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reset state ONLY when screen refocuses (not remount)
  useFocusEffect(
    useCallback(() => {
      getOrData();
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openHeader = () => {
    setShowHeader(!showHeader);

    Animated.timing(animation, {
      toValue: showHeader ? 0 : 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
      <ProfileHeader
        backTo="/(tabs)/pointage"
        title={`Opérations : OR ${orData?.numOr}`}
      >
        <Animated.View
          style={[
            styles.containerOr,
            {
              opacity: animation,
              height: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 100],
              }),
            },
          ]}
        >
          <View style={styles.item}>
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Car color="#6B7280" size={20} />
              </View>
              <View>
                <Text style={styles.label}>Véhicule</Text>
                <Text style={styles.value}>
                  {orData?.marque} {orData?.model}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.item}>
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Hash color="#6B7280" size={20} />
              </View>
              <View>
                <Text style={styles.label}>Matricule</Text>
                <Text style={styles.value}>{orData?.matricule}</Text>
              </View>
            </View>
          </View>
          <View style={styles.item}>
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Gauge color="#6B7280" size={20} />
              </View>
              <View>
                <Text style={styles.label}>Kilométrage</Text>
                <Text style={styles.value}>
                  {orData?.kilometrage
                    ? `${orData?.kilometrage?.toLocaleString()} km`
                    : "Aucun"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.item}>
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Calendar color="#6B7280" size={20} />
              </View>
              <View>
                <Text style={styles.label}>Date de livraison</Text>
                <Text style={styles.value}>{orData?.dateLivraison}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        <TouchableOpacity onPress={openHeader} style={styles.buttonShow}>
          {showHeader ? (
            <ChevronUp color="#fff" size={20} />
          ) : (
            <ChevronDown color="#fff" size={20} />
          )}
        </TouchableOpacity>
      </ProfileHeader>

      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
          ) : data?.length > 0 ? (
            data.map((operation, index) => (
              <OperationCard key={index} operation={operation} or={orData} />
            ))
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Aucun Order de réparation</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    paddingVertical: 16,
  },
  header: {
    width: "100%",
    height: 100,
    backgroundColor: "#ff5500",
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
    color: "black",
    textAlign: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  containerOr: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: {
    width: "48%", // Two columns per row
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  buttonShow: {
    // width: 40,
    // height: 40,
    // backgroundColor: "#F3F4F6",
    // borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    // marginRight: 12,
  },
  label: {
    fontSize: 14,
    color: "black",
    marginBottom: 2,
  },
  value: {
    fontWeight: "bold",
    color: "#fff",
  },
  valueIcon: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
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
