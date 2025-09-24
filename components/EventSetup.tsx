// src/screens/EventSetup.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, Alert } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { Athlete, SportEvent, EventKind, Phase } from "./types";

const TRACK_SPRINTS = ["60m","100m","200m","400m"];
const TRACK_MIDDLE = ["800m","1500m","3000m","5000m","10000m"];
const HURDLES = ["100mH","110mH","400mH"];
const RELAYS = ["4x100","4x400"];
const FIELD_HORIZONTAL = ["Long Jump","Triple Jump"];
const FIELD_VERTICAL = ["High Jump","Pole Vault"];
const THROWS = ["Shot Put","Discus","Hammer","Javelin"];
const COMBINED = ["Heptathlon","Decathlon"];
const WALK_MARATHON = ["20km Walk","Marathon"];

export default function EventSetup({ onCreate, onCancel }: {
  onCreate: (ev: SportEvent) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<EventKind>("track");
  const [discipline, setDiscipline] = useState<string>("100m");
  const [lanes, setLanes] = useState<string>("6");
  const [attempts, setAttempts] = useState<string>("6");
  const [windLimit, setWindLimit] = useState<string>("2.0");
  const [byPlace, setByPlace] = useState<string>("3");
  const [participants, setParticipants] = useState<Athlete[]>([]);

  const addParticipant = () => {
    const id = uuidv4();
    const next: Athlete = { id, name: `Athlete ${participants.length + 1}` };
    setParticipants((p) => [...p, next]);
  };

  const removeParticipant = (id: string) => {
    setParticipants((p) => p.filter((x) => x.id !== id));
  };

  const presetListForKind = (k: EventKind) => {
    if (k === "track") return [...TRACK_SPRINTS, ...TRACK_MIDDLE, ...HURDLES, ...RELAYS];
    if (k === "field") return [...FIELD_HORIZONTAL, ...FIELD_VERTICAL, ...THROWS];
    if (k === "combined") return COMBINED;
    if (k === "walk" || k === "marathon") return WALK_MARATHON;
    return [];
  };

  const createEvent = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please provide a name for the event (e.g. 'Men 100m Final').");
      return;
    }
    const ev: SportEvent = {
      id: uuidv4(),
      name: name.trim(),
      kind,
      discipline,
      phase: "Single",
      lanes: kind === "track" ? Math.max(2, parseInt(lanes || "6")) : undefined,
      attemptsPerAthlete: kind === "field" ? Math.max(1, parseInt(attempts || "3")) : undefined,
      windLegalLimit: windLimit ? parseFloat(windLimit) : null,
      qualification: { byPlace: byPlace ? Math.max(0, parseInt(byPlace)) : undefined, byTime: null },
      participants,
    };
    onCreate(ev);
  };

  return (
    <ScrollView style={{ padding: 12 }}>
      <Text style={styles.label}>Event Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Men 100m Final" value={name} onChangeText={setName} />

      <Text style={styles.label}>Kind</Text>
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        {(["track","field","combined","walk","marathon"] as EventKind[]).map((k) => (
          <TouchableOpacity key={k} onPress={() => { setKind(k); const presets = presetListForKind(k); setDiscipline(presets[0] ?? ""); }} style={[styles.tag, kind === k && styles.tagActive]}>
            <Text style={kind === k ? { color: "#fff" } : undefined}>{k}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Discipline</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {presetListForKind(kind).map((d) => (
          <TouchableOpacity key={d} onPress={() => setDiscipline(d)} style={[styles.tag, discipline === d && styles.tagActive]}>
            <Text style={discipline === d ? { color: "#fff" } : undefined}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {kind === "track" && (
        <>
          <Text style={styles.label}>Lanes</Text>
          <TextInput style={styles.input} keyboardType="number-pad" value={lanes} onChangeText={setLanes} />
        </>
      )}

      {kind === "field" && (
        <>
          <Text style={styles.label}>Attempts / athlete</Text>
          <TextInput style={styles.input} keyboardType="number-pad" value={attempts} onChangeText={setAttempts} />
        </>
      )}

      <Text style={styles.label}>Wind legal limit (m/s) — optional</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={windLimit} onChangeText={setWindLimit} />

      <Text style={[styles.label, { marginTop: 12 }]}>Qualification — by place (optional)</Text>
      <TextInput style={styles.input} keyboardType="number-pad" value={byPlace} onChangeText={setByPlace} />

      <View style={{ marginTop: 14 }}>
        <Text style={styles.label}>Participants ({participants.length})</Text>
        <FlatList
          data={participants}
          keyExtractor={(it) => it.id}
          renderItem={({ item, index }) => (
            <View style={styles.partRow}>
              <Text style={{ flex: 1 }}>{item.name}</Text>
              <TouchableOpacity onPress={() => removeParticipant(item.id)} style={[styles.smallBtn, { backgroundColor: "#d83a4a" }]}>
                <Text style={{ color: "#fff" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: "#666" }}>No participants yet — add some</Text>}
        />
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <TouchableOpacity onPress={addParticipant} style={[styles.smallBtn, { backgroundColor: "#0b6efd" }]}>
            <Text style={{ color: "#fff" }}>Add Participant</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            // quick add 6 demo participants
            const more = Array.from({ length: 6 }).map((_, i) => ({ id: uuidv4(), name: `Athlete ${participants.length + i + 1}` }));
            setParticipants((p) => [...p, ...more]);
          }} style={[styles.smallBtn, { backgroundColor: "#2e8b57", marginLeft: 8 }]}>
            <Text style={{ color: "#fff" }}>Add 6 demo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 18 }} />

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={onCancel} style={[styles.btn, { backgroundColor: "#ccc" }]}>
          <Text>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={createEvent} style={[styles.btn, { backgroundColor: "#0b6efd" }]}>
          <Text style={{ color: "#fff" }}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#eee", padding: 8, borderRadius: 8, marginBottom: 10 },
  tag: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#f2f2f2", borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagActive: { backgroundColor: "#0b6efd" },
  partRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#fafafa" },
  smallBtn: { padding: 8, borderRadius: 8 },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }
});
