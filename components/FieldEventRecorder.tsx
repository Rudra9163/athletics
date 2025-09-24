// src/components/FieldEventRecorder.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { v4 as uuidv4 } from "uuid";
import InputModal from "./InputModal";
import { Athlete, Attempt, FieldEntry } from "./types";

/**
 * FieldEventRecorder:
 * - props: athletes list, attemptsPerAthlete
 * - UI: horizontal attempts for each athlete, tap "Set" to open numeric input modal
 * - "Foul" toggles foul on that attempt
 */

export default function FieldEventRecorder({
  athletes,
  attemptsPerAthlete = 6,
  onFinalize,
}: {
  athletes: Athlete[];
  attemptsPerAthlete?: number;
  onFinalize?: (results: FieldEntry[]) => void;
}) {
  const initialEntries: FieldEntry[] = athletes.map((a) => ({
    athlete: a,
    attempts: Array.from({ length: attemptsPerAthlete }).map((_, i) => ({ id: uuidv4(), attemptNumber: i + 1, valueMeters: null, foul: false })),
    best: null,
    status: "OK",
  }));

  const [entries, setEntries] = useState<FieldEntry[]>(initialEntries);
  const [open, setOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{ athleteIndex: number; attemptIndex: number } | null>(null);

  const openInput = (athIndex: number, attemptIndex: number) => {
    setCurrentEdit({ athleteIndex: athIndex, attemptIndex });
    setOpen(true);
  };

  const onSubmitValue = (raw: string) => {
    setOpen(false);
    if (!currentEdit) return;
    const v = parseFloat(raw);
    setEntries((prev) => {
      const next = prev.map((e) => ({ athlete: e.athlete, attempts: e.attempts.map(a => ({ ...a })), best: e.best, status: e.status }));
      next[currentEdit.athleteIndex].attempts[currentEdit.attemptIndex].valueMeters = isNaN(v) ? null : v;
      next[currentEdit.athleteIndex].attempts[currentEdit.attemptIndex].foul = false;
      // recompute best
      const best = next[currentEdit.athleteIndex].attempts.reduce((acc, at) => {
        if (!at.foul && at.valueMeters != null) return Math.max(acc, at.valueMeters);
        return acc;
      }, 0);
      next[currentEdit.athleteIndex].best = best === 0 ? null : best;
      return next;
    });
    setCurrentEdit(null);
  };

  const toggleFoul = (athIndex: number, attemptIndex: number) => {
    setEntries((prev) => {
      const next = prev.map((e) => ({ athlete: e.athlete, attempts: e.attempts.map(a => ({ ...a })), best: e.best, status: e.status }));
      const at = next[athIndex].attempts[attemptIndex];
      at.foul = !at.foul;
      if (at.foul) at.valueMeters = null;
      // recompute best
      const best = next[athIndex].attempts.reduce((acc, a) => {
        if (!a.foul && a.valueMeters != null) return Math.max(acc, a.valueMeters);
        return acc;
      }, 0);
      next[athIndex].best = best === 0 ? null : best;
      return next;
    });
  };

  const finalize = () => {
    const sorted = entries.slice().sort((a, b) => (b.best ?? -Infinity) - (a.best ?? -Infinity));
    onFinalize?.(sorted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Field Event Recorder</Text>

      <FlatList
        data={entries}
        keyExtractor={(it) => it.athlete.id}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "800" }}>{item.athlete.name}</Text>
              <Text style={{ color: "#666" }}>Best: {item.best == null ? "-" : item.best.toFixed(2) + " m"}</Text>
            </View>

            <FlatList
              data={item.attempts}
              keyExtractor={(a) => a.id}
              horizontal
              renderItem={({ item: at, index: ati }) => (
                <View style={{ alignItems: "center", marginRight: 8 }}>
                  <Text style={{ fontWeight: "700" }}>A{at.attemptNumber}</Text>
                  <Text style={{ marginTop: 6 }}>{at.foul ? "Foul" : (at.valueMeters == null ? "-" : `${at.valueMeters.toFixed(2)} m`)}</Text>
                  <View style={{ flexDirection: "row", marginTop: 6 }}>
                    <TouchableOpacity onPress={() => openInput(index, ati)} style={[styles.smallBtn, { backgroundColor: "#2e8b57" }]}>
                      <Text style={{ color: "#fff" }}>Set</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => toggleFoul(index, ati)} style={[styles.smallBtn, { backgroundColor: at.foul ? "#ffa500" : "#d83a4a", marginLeft: 8 }]}>
                      <Text style={{ color: "#fff" }}>{at.foul ? "Unfoul" : "Foul"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      />

      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity onPress={finalize} style={[styles.btn, { backgroundColor: "#0b6efd" }]}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Finalize</Text>
        </TouchableOpacity>
      </View>

      <InputModal
        visible={open}
        title="Enter distance (meters)"
        placeholder="e.g. 7.24"
        initialValue=""
        onCancel={() => { setOpen(false); setCurrentEdit(null); }}
        onSubmit={onSubmitValue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: "#fff", borderRadius: 8 },
  title: { fontWeight: "900", fontSize: 18, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f2f2f2" },
  smallBtn: { padding: 8, borderRadius: 6 },
  btn: { padding: 10, borderRadius: 8 }
});
