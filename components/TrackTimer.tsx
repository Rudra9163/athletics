// src/components/TrackTimer.tsx
import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { LaneAssignment, Athlete } from "./types";

export default function TrackTimer({
  lanes = 6,
  initialAthletes = [] as Athlete[],
  onFinalize,
}: {
  lanes?: number;
  initialAthletes?: Athlete[];
  onFinalize?: (results: LaneAssignment[]) => void;
}) {
  const [running, setRunning] = useState(false);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef<number | null>(null);

  const [lanesState, setLanesState] = useState<LaneAssignment[]>(
    Array.from({ length: lanes }).map((_, i) => ({
      lane: i + 1,
      athlete: initialAthletes[i] ?? { id: uuidv4(), name: `Athlete ${i + 1}` },
      timeMs: null,
      status: "OK",
    }))
  );

  // formatting
  const fmt = (ms?: number | null) => {
    if (ms == null) return "--";
    const s = Math.floor(ms / 1000);
    const msRem = ms % 1000;
    return `${s}.${String(msRem).padStart(3, "0")}`;
  };

  const start = () => {
    if (running) return;
    const now = Date.now();
    setStartTs(now);
    setRunning(true);
    tickRef.current = setInterval(() => {
      setElapsed(Date.now() - now);
    }, 50) as any;
    setElapsed(0);
  };

  const stop = () => {
    if (!running) return;
    const final = Date.now() - (startTs ?? Date.now());
    setRunning(false);
    if (tickRef.current) clearInterval(tickRef.current as any);
    setElapsed(final);
    setStartTs(null);
  };

  const recordForLane = (index: number) => {
    const current = running ? Date.now() - (startTs ?? Date.now()) : elapsed;
    setLanesState((prev) => {
      const copy = prev.slice();
      copy[index] = { ...copy[index], timeMs: Math.round(current) };
      return copy;
    });
  };

  const clearLane = (index: number) => {
    setLanesState((prev) => prev.map((l, i) => (i === index ? { ...l, timeMs: null } : l)));
  };

  const setAthleteName = (index: number, name: string) => {
    setLanesState((prev) => {
      const copy = prev.slice();
      copy[index] = { ...copy[index], athlete: { ...(copy[index].athlete ?? { id: uuidv4(), name }), name } };
      return copy;
    });
  };

  const finalize = () => {
    const sorted = lanesState.slice().sort((a, b) => (a.timeMs ?? Infinity) - (b.timeMs ?? Infinity));
    onFinalize?.(sorted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Track Timer</Text>

      <View style={styles.timerRow}>
        <Text style={styles.timerText}>{fmt(running ? Date.now() - (startTs ?? Date.now()) : elapsed)}</Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={start} style={[styles.btn, { backgroundColor: "#2e8b57" }]}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={stop} style={[styles.btn, { backgroundColor: "#d83a4a" }]}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={lanesState}
        keyExtractor={(it) => String(it.lane)}
        renderItem={({ item, index }) => (
          <View style={styles.laneRow}>
            <Text style={{ width: 48, fontWeight: "800" }}>Lane {item.lane}</Text>
            <TextInput
              value={item.athlete?.name}
              onChangeText={(t) => setAthleteName(index, t)}
              style={styles.input}
            />
            <Text style={{ width: 100, textAlign: "center" }}>{fmt(item.timeMs)}</Text>
            <TouchableOpacity onPress={() => recordForLane(index)} style={[styles.smallBtn, { backgroundColor: "#0b6efd" }]}>
              <Text style={{ color: "#fff" }}>Record</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => clearLane(index)} style={[styles.smallBtn, { backgroundColor: "#888", marginLeft: 8 }]}>
              <Text style={{ color: "#fff" }}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity onPress={finalize} style={[styles.btn, { backgroundColor: "#0b6efd" }]}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Finalize Heat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: "#fff", borderRadius: 8 },
  title: { fontWeight: "900", fontSize: 18, marginBottom: 8 },
  timerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  timerText: { fontSize: 28, fontWeight: "900" },
  btn: { padding: 10, borderRadius: 8, marginLeft: 8, alignItems: "center", justifyContent: "center" },
  laneRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f2f2f2" },
  input: { borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 8, flex: 1, marginHorizontal: 8, minHeight: 36 },
  smallBtn: { padding: 8, borderRadius: 6 },
});
