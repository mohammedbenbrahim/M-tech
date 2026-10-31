import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Button,
  Platform,
} from "react-native";
import ProfileHeader from "@/components/headers/ProfileHeader";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react-native";
import { getOperationHistorique } from "@/services/api";
import LocalStore from "@/utils/storage";
import OperationCard from "./card";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Operations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const params = useLocalSearchParams();
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
      // if (params.or && typeof params.or === "string") {
      //   setOrData(JSON.parse(decodeURIComponent(params.or)));
      // } else if (orFromStore) {
      //   setOrData(JSON.parse(orFromStore));
      // }
    } catch (error) {
      console.error("Error parsing orData:", error);
    }
  };

  // Reset state ONLY when screen refocuses (not remount)
  useFocusEffect(
    useCallback(() => {
      getOrData();
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOperationHistorique();
      setData(data);
    } catch (err) {
      setError("Échec du chargement des données. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const [startDate, setStartDate] = useState((new Date()).setMinutes(-2880));
  const [endDate, setEndDate] = useState((new Date()).setMinutes(-1440));
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  
  const handleStartDateChange = (event, selectedDate) => {
    setShowStart(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate > endDate) setEndDate(selectedDate); // Ensure end date is after start
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEnd(Platform.OS === "ios");
    if (selectedDate) {
      if (selectedDate < startDate) {
        alert("End date must be after the start date!");
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ProfileHeader title={`Historique des Opérations`}>
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
          <View style={{ padding: 20 }}>
            {/* Start Date Button */}
            <Button
              title="Select Start Date"
              onPress={() => setShowStart(true)}
            />
            <Text>Start Date: {startDate.toLocaleString()}</Text>

            {/* End Date Button */}
            <Button title="Select End Date" onPress={() => setShowEnd(true)} />
            <Text>End Date: {endDate.toLocaleString()}</Text>

            {/* Start Date Picker */}
            {showStart && (
              <DateTimePicker
                value={new Date(startDate)}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
                maximumDate={(new Date()).setMinutes(-1440)}
                firstDayOfWeek={1}
                design="material"
              />
            )}

            {/* End Date Picker */}
            {showEnd && (
              <DateTimePicker
                value={new Date(endDate)}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
              />
            )}
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
              <Text style={styles.loadingText}>Aucune opération</Text>
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
