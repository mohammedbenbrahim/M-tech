import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { Clock, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import LocalStore from "@/utils/storage"
import getStatusDetails from "@/utils/status";

// interface OperationCardProps {
//   title: string;
//   status: Status;
//   startDate: Date;
//   endDate: Date;
//   username: string;
// }
type Operation = {
  title: string;
  status: Status;
  startDate: Date;
  endDate: Date;
  username: string;
};

type OR = {
  numOr: string;
  marque: string;
  model: string;
  matricule: string;
  kilometrage: number;
  dateLivraison: string;
};

type OperationCardProps = {
  operation: Operation;
  or: OR;
};

export default function OperationCard({ operation, or }: OperationCardProps) {
  const router = useRouter();

  const handleNavigate = async () => {
    const query = {
      operation: JSON.stringify(operation),
      or: JSON.stringify(or),
    };
    const queryString = new URLSearchParams(query).toString();
    await LocalStore.set("operation", operation || null);
    await LocalStore.set("or", or || null);
    // router.push(`/operationDetails?${queryString}`);
    router.push(`/(tabs)/pointage/operations/operationDetail?${queryString}`);
  };
  
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handleNavigate}>
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusDetails(operation?.status).color },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusDetails(operation?.status).text}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {operation?.title}
        </Text>

        {/* Dates */}
        <View style={styles.dateContainer}>
          <Clock size={16} color="#64748B" />
          <Text style={styles.dateText}>
            {operation?.startDate ? format(operation?.startDate, "MMM d, yyyy") : "../../.... "} - 
            {operation?.startDate ? format(operation?.endDate, "MMM d, yyyy") : "  ../../...."}
          </Text>
        </View>

        {/* Username */}
        {/* <View style={styles.userContainer}>
          <User size={16} color="#64748B" />
          <Text style={styles.username}>{operation?.username}</Text>
        </View> */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
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
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    marginLeft: 8,
    color: "#64748B",
    fontSize: 14,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    marginLeft: 8,
    color: "#64748B",
    fontSize: 14,
  },
});
