// src/screens/EventDashboard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import TrackTimer from "./TrackTimer";
import FieldEventRecorder from "./FieldEventRecorder";
import { SportEvent } from "./types";

export default function EventDashboard({ event, onBack, onExport }: {
  event: SportEvent;
  onBack: () => void;
  onExport?: (data: any) => void;
}) {
  const [liveStarted, setLiveStarted] = useState(false);

  const handleFinalize = (results: any) => {
    Alert.alert("Finalize Results", "Results finalized — you can export JSON.", [{ text: "OK" }]);
    onExport?.({ event, results });
  };

  return (
    <ScrollView style={{ padding: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <TouchableOpacity onPress={onBack} style={[styles.smallBtn, { backgroundColor: "#ccc" }]}><Text>Back</Text></TouchableOpacity>
        <Text style={{ fontWeight: "800", fontSize: 16 }}>{event.name}</Text>
        <View style={{ width: 64 }} />
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Discipline</Text>
        <Text>{event.discipline} — {event.kind}</Text>

        {event.lanes ? (
          <>
            <Text style={[styles.label, { marginTop: 8 }]}>Lanes</Text>
            <Text>{event.lanes}</Text>
          </>
        ) : null}

        {event.attemptsPerAthlete ? (
          <>
            <Text style={[styles.label, { marginTop: 8 }]}>Attempts / athlete</Text>
            <Text>{event.attemptsPerAthlete}</Text>
          </>
        ) : null}

        {event.windLegalLimit != null ? (
          <>
            <Text style={[styles.label, { marginTop: 8 }]}>Wind legal limit (m/s)</Text>
            <Text>{event.windLegalLimit}</Text>
          </>
        ) : null}

        <Text style={[styles.label, { marginTop: 8 }]}>Participants</Text>
        <View style={{ marginBottom: 8 }}>
          {event.participants.map((p, i) => (
            <Text key={p.id}>{i+1}. {p.name}</Text>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity onPress={() => setLiveStarted((s) => !s)} style={[styles.actionBtn, { backgroundColor: liveStarted ? "#d83a4a" : "#2e8b57" }]}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>{liveStarted ? "Stop Live" : "Start Live"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onExport?.({ event })} style={[styles.actionBtn, { backgroundColor: "#0b6efd", marginLeft: 8 }]}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Export JSON</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 12 }} />

      {liveStarted ? (
        <>
          {event.kind === "track" ? (
            <TrackTimer
              lanes={event.lanes ?? 6}
              initialAthletes={event.participants.slice(0, event.lanes ?? 6)}
              onFinalize={(results) => handleFinalize(results)}
            />
          ) : event.kind === "field" ? (
            <FieldEventRecorder
              athletes={event.participants}
              attemptsPerAthlete={event.attemptsPerAthlete ?? 3}
              onFinalize={(results) => handleFinalize(results)}
            />
          ) : (
            <View style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 8 }}>
              <Text style={{ fontWeight: "700" }}>No specialized recorder for this kind yet.</Text>
              <Text style={{ marginTop: 8 }}>You can still export participants or manage manually.</Text>
            </View>
          )}
        </>
      ) : (
        <View style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 8 }}>
          <Text style={{ color: "#666" }}>Start the live session to open recorder & controls.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "800", marginTop: 8 },
  smallBtn: { padding: 8, borderRadius: 8 },
  actionBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }
});
