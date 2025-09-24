// src/components/InputModal.tsx
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

export default function InputModal({
  visible,
  title,
  placeholder,
  initialValue,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  title?: string;
  placeholder?: string;
  initialValue?: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    if (visible) setValue(initialValue ?? "");
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title ?? "Enter value"}</Text>
          <TextInput
            placeholder={placeholder ?? ""}
            value={value}
            onChangeText={setValue}
            style={styles.input}
            keyboardType="decimal-pad"
            autoFocus
          />
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "#ccc" }]} onPress={onCancel}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "#0b6efd" }]} onPress={() => onSubmit(value)}>
              <Text style={{ color: "#fff" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { width: "90%", backgroundColor: "#fff", padding: 16, borderRadius: 10 },
  title: { fontWeight: "800", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#eee", padding: 10, borderRadius: 8, marginBottom: 12 },
  actions: { flexDirection: "row", justifyContent: "flex-end" },
  btn: { padding: 10, borderRadius: 8, marginLeft: 8, minWidth: 80, alignItems: "center" },
});
