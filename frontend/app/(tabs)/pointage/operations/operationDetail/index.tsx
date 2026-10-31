import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Animated,
  RefreshControl,
} from "react-native";
import ProfileHeader from "@/components/headers/ProfileHeader";
import {
  finishOperation,
  getOperationData,
  startOperation,
  stopOperation,
} from "@/services/api";
import LocalStore from "@/utils/storage";
import { useFocusEffect } from "expo-router";
import {
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  Clock,
  Gauge,
  Hash,
  MessageSquareText,
  Pause,
  Play,
  Square,
  TimerOff,
  Settings,
  AlertCircle,
} from "lucide-react-native";
import { formatTime } from "@/utils/dateTime";
import getStatusDetails from "@/utils/status";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import MotifModal from "@/components/modals/MotifModal";
import { FloatingAction } from "react-native-floating-action";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";

type MotifItem = {
  label: string;
  value: string;
};

type ListMotif = {
  loading: boolean;
  refresh: boolean;
  error: string;
  data: MotifItem[]; // Ensure 'data' is an array of items
  visible: boolean;
};

type RouteParams = {
  operation: string;
  or: string;
};

export default function OperationDetails() {
  const route = useRoute();
  //Data states
  const [listMotif, setListMotif] = useState<ListMotif>({
    loading: false,
    refresh: false,
    error: "",
    data: [], // ✅ Always starts as an empty array
    visible: false,
  });
  const [orData, setOrData] = useState({
    numOr: "",
    marque: "",
    model: "",
    matricule: "",
    kilometrage: 0,
    dateLivraison: "",
  });
  const [operationData, setOperationData] = useState({
    id: "",
    title: "",
    status: "",
    startDate: "",
    endDate: "",
    passeTime: 0, // 15 hours in seconds
    pauseTime: 0, // 3 hours in seconds
    totalTime: 0, // 18 hours in seconds
    affectedComment: "",
    motifPause: "",
    motifPauseComment: "",
  });
  const [operationId, setOperationId] = useState<Number | null>(null);
  const [showHeader, setShowHeader] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);
  const [animation] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper to update the state partially
  const updateListMotif = (updates: Partial<ListMotif>) => {
    setListMotif((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    // Destructure query parameters from the route
    const { operation: operationJson, or: orJson } =
      route.params as RouteParams;

    // Parse the query string values as JSON
    if (operationJson && orJson) {
      setOperationId(JSON.parse(operationJson));
      setOrData(JSON.parse(orJson));
    }
    fetchData(JSON.parse(operationJson));
  }, [route]);

  const fetchData = async (id = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOperationData(parseInt(id || operationId));
      setOperationData({ ...data });
    } catch (err) {
      setError("Échec du chargement des données. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // Fetch data function with error handling and state updates
  const fetchListMotifData = async () => {
    try {
      const data = await LocalStore.get("motifs");
      updateListMotif({ data: JSON.parse(JSON.stringify(data)) });
    } catch (error) {
      updateListMotif({
        error: "Échec du chargement des données. Veuillez réessayer.",
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      setShowHeader(false);
      fetchListMotifData();
    }, [])
  );

  //Crono
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (operationData?.status === "inprogress") {
      interval = setInterval(() => {
        setOperationData((prev) => ({
          ...prev,
          passeTime: parseInt(prev.passeTime) + 1,
        }));
      }, 1000);
    } else if (operationData?.status === "paused") {
      interval = setInterval(() => {
        setOperationData((prev) => ({
          ...prev,
          pauseTime: parseInt(prev.pauseTime) + 1,
        }));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [operationData?.status, pauseStartTime]);

  //Buttons crono
  const confirmStart = async () => {
    if (
      operationData?.status === "initial" ||
      operationData?.status === "paused"
    ) {
      const result = await startOperation(operationData?.id || 1);
      if (result) {
        if (operationData?.status === "initial") {
          const date = new Date();
          setOperationData((prev) => ({
            ...prev,
            startDate: date,
          }));
        } else if (operationData?.status === "paused") {
          setPauseStartTime(null);
        }
        setOperationData((prev) => ({
          ...prev,
          status: "inprogress",
        }));
      }
    }
  };

  const openHeader = () => {
    setShowHeader(!showHeader);

    Animated.timing(animation, {
      toValue: showHeader ? 0 : 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleStart = () => {
    Alert.alert("Confirmation", "Êtes-vous sûr de commencer l'opération ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Confirmer",
        onPress: () => confirmStart(),
        style: "destructive",
      },
    ]);
  };

  const confirmEnd = async () => {
    const result = await finishOperation(operationData?.id || 1);
    if (result) {
      setOperationData((prev) => ({
        ...prev,
        status: "end",
        endDate: new Date(),
      }));
    }
  };

  const handleEnd = () => {
    Alert.alert("Confirmation", "Êtes-vous sûr de terminer l'opération ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Confirmer",
        onPress: () => confirmEnd(),
        style: "destructive",
      },
    ]);
  };

  const pauseOperation = async (
    motif: number,
    motifName: string,
    comment: string
  ) => {
    const result = await stopOperation(operationData?.id || 1, motif, comment);
    if (result) {
      setPauseStartTime(new Date());
      setOperationData((prev) => ({
        ...prev,
        motifPause: motifName,
        motifPauseComment: comment,
        status: "paused",
      }));
      setListMotif((prev) => ({
        ...prev,
        visible: false,
      }));
    }
  };

  const confirmStop = (motifid: number, motif: string, comment: string) => {
    Alert.alert("Confirmation", "Êtes-vous sûr d'arrêter l'opération ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Confirmer",
        onPress: () => pauseOperation(motifid, motif, comment),
        style: "destructive",
      },
    ]);
  };

  const handleStop = () => {
    if (operationData?.status === "inprogress") {
      setListMotif((prev) => ({
        ...prev,
        visible: true,
      }));
    }
  };

  const actions = [
    {
      text: "Début",
      icon: <Play color="green" size={25} />,
      name: "bt_start",
      position: 1,
      color: "white",
    },
    {
      text: "Arrêt",
      icon: <Pause color="orange" size={25} />,
      name: "bt_stop",
      position: 2,
      color: "white",
    },
    {
      text: "Fin",
      icon: <Square color="gray" size={25} />,
      name: "bt_end",
      position: 3,
      color: "white",
    },
  ];
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  return (
    <View style={styles.container}>
      <ProfileHeader
        backTo="/(tabs)/pointage/operations"
        title="Suivi d'opération"
      >
        <Text style={styles.title}>{operationData?.title}</Text>
        <Text style={styles.subTitle}>OR {orData?.numOr}</Text>
        {/* {showHeader && ( */}
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
          <View style={styles.itemOr}>
            <View style={styles.rowOr}>
              <View style={styles.iconContainer}>
                <Car color="#6B7280" size={20} />
              </View>
              <View>
                <Text style={styles.labelOr}>Véhicule</Text>
                <Text style={styles.valueOr}>
                  {orData?.marque} {orData?.model}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.itemOr}>
            <View style={styles.rowOr}>
              <View style={styles.iconContainer}>
                <Hash color="#6B7280" size={20} />
              </View>
              <View>
                <Text style={styles.labelOr}>Matricule</Text>
                <Text style={styles.valueOr}>{orData?.matricule}</Text>
              </View>
            </View>
          </View>
          <View style={styles.itemOr}>
            <View style={styles.rowOr}>
              <View style={styles.iconContainer}>
                <Gauge color="#6B7280" size={20} />
              </View>
              <View>
                <Text style={styles.labelOr}>Kilométrage</Text>
                <Text style={styles.valueOr}>
                  {orData?.kilometrage
                    ? `${orData?.kilometrage?.toLocaleString()} km`
                    : "Aucun"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.itemOr}>
            <View style={styles.rowOr}>
              <View style={styles.iconContainer}>
                <Calendar color="#6B7280" size={20} />
              </View>
              <View>
                <Text style={styles.labelOr}>Date de livraison</Text>
                <Text style={styles.valueOr}>{orData?.dateLivraison}</Text>
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
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={{ ...styles.statCard, ...styles.cronoStartColor }}>
                <Text style={styles.cronoLabel}>Temps Passé</Text>
                <Text style={styles.cronoValue}>
                  {formatTime(parseInt(operationData.passeTime || 0))}
                </Text>
              </View>
              <View style={{ ...styles.statCard, ...styles.cronoStopColor }}>
                <Text style={styles.cronoLabel}>Temps Pause</Text>
                <Text style={styles.cronoValue}>
                  {formatTime(parseInt(operationData.pauseTime || 0))}
                </Text>
              </View>
              <View style={{ ...styles.statCard, ...styles.cronoEndColor }}>
                <Text style={styles.cronoLabel}>Temps Total</Text>
                <Text style={styles.cronoValue}>
                  {formatTime(
                    parseInt(operationData.passeTime) +
                      parseInt(operationData.pauseTime)
                  )}
                </Text>
              </View>
              {operationData?.status !== "end" && (
                <View style={{ ...styles.statCardFunctions }}>
                  <TouchableOpacity
                    style={[
                      (operationData?.status === "end" ||
                        operationData?.status === "inprogress") &&
                        styles.disabledButton,
                    ]}
                    onPress={handleStart}
                    disabled={
                      operationData?.status === "end" ||
                      operationData?.status === "inprogress"
                    }
                  >
                    <Play color="green" size={35} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      operationData?.status !== "inprogress" &&
                        styles.disabledButton,
                    ]}
                    onPress={handleStop}
                    disabled={operationData?.status !== "inprogress"}
                  >
                    <Pause color="orange" size={35} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      (operationData?.status === "end" ||
                        operationData?.status === "initial") &&
                        styles.disabledButton,
                    ]}
                    onPress={handleEnd}
                    disabled={
                      operationData?.status === "end" ||
                      operationData?.status === "initial"
                    }
                  >
                    <Square color="red" size={35} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.detailsCard}>
              <View
                style={[
                  styles.detailsStatusBadge,
                  {
                    backgroundColor: getStatusDetails(operationData?.status)
                      ?.color,
                  },
                ]}
              >
                <Text style={styles.detailsStatusText}>
                  {getStatusDetails(operationData?.status)?.text}
                </Text>
              </View>
              <View style={{ ...styles.detailsItem, marginTop: 0 }}>
                <View style={styles.rowOr}>
                  <View style={styles.iconContainer}>
                    <Clock color="#6B7280" size={20} />
                  </View>
                  <View>
                    <Text style={styles.detailsLabelOr}>Date de début</Text>
                    <Text style={styles.detailsValueOr}>
                      {operationData?.startDate
                        ? format(
                            operationData?.startDate,
                            "EEEE d MMMM yyyy 'à' HH:mm:ss",
                            { locale: fr }
                          )
                        : "- - - - -"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailsItem}>
                <View style={styles.rowOr}>
                  <View style={styles.iconContainer}>
                    <Clock color="#6B7280" size={20} />
                  </View>
                  <View>
                    <Text style={styles.detailsLabelOr}>Date de fin</Text>
                    <Text style={styles.detailsValueOr}>
                      {operationData?.endDate
                        ? format(
                            operationData?.endDate,
                            "EEEE d MMMM yyyy 'à' HH:mm:ss",
                            { locale: fr }
                          )
                        : "- - - - -"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailsItem}>
                <View style={styles.rowOr}>
                  <View style={styles.iconContainer}>
                    <MessageSquareText color="#6B7280" size={20} />
                  </View>
                  <View>
                    <Text style={styles.detailsLabelOr}>
                      Commentaire d'Affectation
                    </Text>
                    <Text style={styles.detailsValueOr}>
                      {/* {operationData?.affectedComment || "- - - - -"} */}
                      Lorem Ipsum is simply dummy text of the printing and
                      typesetting industry. Lorem Ipsum has been the industry's
                      standard dummy text ever since the 1500s.
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailsItem}>
                <View style={styles.rowOr}>
                  <View style={styles.iconContainer}>
                    <TimerOff color="#6B7280" size={20} />
                  </View>
                  <View>
                    <Text style={styles.detailsLabelOr}>Motif de pause</Text>
                    <Text style={styles.detailsValueOr}>
                      {operationData?.motifPause || "- - - - -"}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailsItem}>
                <View style={styles.rowOr}>
                  <View style={styles.iconContainer}>
                    <MessageSquareText color="#6B7280" size={20} />
                  </View>
                  <View>
                    <Text style={styles.detailsLabelOr}>
                      Commentaire de pause
                    </Text>
                    <Text style={styles.detailsValueOr}>
                      {operationData?.motifPauseComment || "- - - - -"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      <MotifModal
        key={listMotif?.visible.toString()}
        visible={listMotif?.visible}
        onClose={() =>
          setListMotif((prev) => ({
            ...prev,
            visible: false,
          }))
        }
        onConfirm={confirmStop}
        listMotif={listMotif}
      />
      <View
        style={{
          padding: 0,
          backgroundColor: "black",
        }}
      >
        {/* <Text style={styles.example}>Floating Action example</Text> */}
        <FloatingAction
          actions={actions}
          onPressItem={(name) => {
            console.log(`selected button: ${name}`);
            switch (name) {
              case "bt_start":
                handleStart();
                break;
              case "bt_stop":
                handleStop();
                break;
              case "bt_end":
                handleEnd();
                break;
              default:
                break;
            }
          }}
          floatingIcon={<Settings color="#fff" size={30} />}
          actionsPaddingTopBottom={1}
          showBackground={false}
          // buttonSize={100}
          // color={"white"}
          distanceToEdge={10}
          // overrideWithAction={true}
          visible={operationData?.status !== "end"}
        />
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 3,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  statCardFunctions: {
    flex: 1,
    // borderRadius: 12,
    // gap: 0,
    // padding: 0,
    // marginHorizontal: 4,
    marginRight: 10,
    marginLeft: 5,
    // backgroundColor:'black',
    alignItems: "center",
    justifyContent: "center",
  },

  container: { backgroundColor: "#fff", flex: 1 },
  scrollContent: {
    paddingVertical: 16,
  },
  title: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  subTitle: {
    color: "#B3B3B3",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 15,
  },
  containerOr: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemOr: {
    width: "48%",
    marginTop: 10,
  },
  rowOr: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  labelOr: {
    fontSize: 14,
    color: "black",
    marginBottom: 2,
  },
  valueOr: {
    fontWeight: "bold",
    color: "#fff",
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
  valueIcon: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  buttonShow: {
    justifyContent: "center",
    alignItems: "center",
  },
  cronoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    height: 100,
    width: "100%",
    padding: 8,
    paddingTop: 0,
    gap: 2,
  },
  cronoCard: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cronoLabel: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 13,
  },
  cronoValue: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  cronoStartColor: {
    backgroundColor: "#0BCC18",
  },
  cronoStopColor: {
    backgroundColor: "#E7C247",
  },
  cronoEndColor: {
    backgroundColor: "#8B8B8B",
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailsStatusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailsStatusText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  detailsLabelOr: {
    fontSize: 14,
    color: "black",
    marginBottom: 2,
  },
  detailsValueOr: {
    fontWeight: "bold",
    color: "#000",
    textAlign: "justify",
  },
  detailsItem: {
    width: "85%",
    marginTop: 20,
  },

  //button
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    // padding: 15,
    borderRadius: 10,
    // minWidth: 100,
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "transparent",
  },
  stopButton: {
    backgroundColor: "#FFA000",
  },
  endButton: {
    backgroundColor: "transparent",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
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
