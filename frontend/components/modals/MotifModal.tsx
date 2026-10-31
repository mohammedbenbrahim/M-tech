import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { X, RefreshCw } from "lucide-react-native";

type MotifItem = {
  label: string;
  value: string;
};

type ListMotif = {
  loading: boolean;
  refresh: boolean;
  error: string;
  data: MotifItem[];
  visible: boolean;
};

type MotifModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (motif: string, comment: string) => void;
  listMotif: ListMotif;
  onRefresh: () => void;
};

export default function MotifModal({
  visible,
  onClose,
  onConfirm,
  listMotif,
  onRefresh,
}: MotifModalProps) {
  const [selectedMotif, setSelectedMotif] = useState("");
  const [comment, setComment] = useState("");

  const handleConfirm = async () => {
    await onConfirm(selectedMotif,
      listMotif?.data?.find((item) => item?.value === selectedMotif)?.label,
      comment
    );
  };
  const handleRefresh = async () => {
    setSelectedMotif("");
    setComment("");
    await onRefresh();
  };
  const handleClose = () => {
    setSelectedMotif("");
    setComment("");
    onClose();
  };

  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Sélectionner un Motif</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={listMotif.refresh}
                onRefresh={handleRefresh}
                tintColor="#007AFF"
                colors={["#007AFF"]}
              />
            }
          >
            {listMotif.loading ? (
              <ActivityIndicator
                size="large"
                color="#007AFF"
                style={styles.loader}
              />
            ) : listMotif.error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{listMotif.error}</Text>
                <TouchableOpacity
                  onPress={handleRefresh}
                  style={styles.refreshButton}
                >
                  <RefreshCw size={20} color="#007AFF" />
                  <Text style={styles.refreshText}>Actualiser</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.pickerContainer}>
                  <RNPickerSelect
                    onValueChange={(value) => setSelectedMotif(value)}
                    items={listMotif.data}
                    value={selectedMotif}
                    style={pickerSelectStyles}
                    placeholder={{
                      label: "Sélectionnez un motif...",
                      value: null,
                    }}
                  />
                </View>

                <Text style={styles.label}>Commentaire</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  placeholder="Entrez votre commentaire ici..."
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                (!selectedMotif || !comment) && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedMotif || !comment}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  pickerContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    minHeight: 100,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButtonText: {
    color: "white",
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 10,
    textAlign: "center",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  refreshText: {
    color: "#007AFF",
    marginLeft: 5,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: "#333",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#333",
  },
});
