import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, Car, Gauge, Hash, Wrench } from "lucide-react-native";
import { useRouter } from "expo-router";
import LocalStore from "@/utils/storage";

type RepairOrderCardProps = {
  numOr: string;
  marque: string;
  model: string;
  matricule: string;
  kilometrage: number;
  dateLivraison: string;
};

export default function RepairOrderCard({
  numOr,
  marque,
  model,
  matricule,
  kilometrage,
  dateLivraison,
}: RepairOrderCardProps) {
  const router = useRouter();
  const data = {
    numOr,
    marque,
    model,
    matricule,
    kilometrage,
    dateLivraison,
  };
  const [key, setKey] = useState(0);

  const handlNavigate = async () => {
    await LocalStore.set("or", data);

    setKey((prev) => prev + 1);
    router.push(
      `/(tabs)/pointage/operations?or=${encodeURIComponent(
        JSON.stringify(data)
      )}`
    );
  };

  return (
    <View style={styles.card} key={key}>
      <TouchableOpacity onPress={handlNavigate}>
        <View style={styles.header}>
          <Wrench color="#4F46E5" size={24} />
          <Text style={styles.headerText}>OR {numOr}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Car color="#6B7280" size={20} />
            </View>
            <View>
              <Text style={styles.label}>Véhicule</Text>
              <Text style={styles.value}>
                {marque} {model}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Hash color="#6B7280" size={20} />
            </View>
            <View>
              <Text style={styles.label}>Matricule</Text>
              <Text style={styles.value}>{matricule}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Gauge color="#6B7280" size={20} />
            </View>
            <View>
              <Text style={styles.label}>Kilométrage</Text>
              <Text style={styles.value}>
                {kilometrage.toLocaleString()} km
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.iconContainer}>
              <Calendar color="#6B7280" size={20} />
            </View>
            <View>
              <Text style={styles.label}>Date de livraison</Text>
              <Text style={styles.value}>{dateLivraison}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 16,
  },
  content: {
    gap: 16,
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
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
});
