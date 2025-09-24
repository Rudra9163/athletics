// src/App.tsx
import React, { useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import EventSetup from "@//components/EventSetup";
import EventDashboard from "@//components/EventDashboard";
import { SportEvent, Athlete } from "@//components/types";
import TrackTimer from "@/components/TrackTimer";
import FieldEventRecorder from "@/components/FieldEventRecorder";

/**
 * Simple in-app "navigation" with three states:
 * - Home: list of events + create new
 * - Setup: create a SportEvent
 * - Dashboard: run the live recorder for chosen event
 */

export default function App() {
  const [screen, setScreen] = useState<"home" | "setup" | "dashboard">("home");
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);

  const createEvent = (ev: SportEvent) => {
    setEvents((s) => [...s, ev]);
    setScreen("home");
  };

  const openEvent = (ev: SportEvent) => {
    setSelectedEvent(ev);
    setScreen("dashboard");
  };

  const exportJson = (payload: any) => {
    Alert.alert("Export JSON", JSON.stringify(payload, null, 2).slice(0, 1000) + (JSON.stringify(payload).length > 1000 ? "\n\n(output truncated in alert)" : ""));
    // In real app: use Share / file system / upload APIs
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {screen === "home" && (
        <ScrollView style={{ padding: 12 }}>
          <Text style={styles.title}>Athletics — Event Manager</Text>

          <View style={{ marginTop: 12 }}>
            <Text style={{ fontWeight: "800" }}>Events</Text>
            {events.length === 0 ? <Text style={{ color: "#666", marginTop: 8 }}>No events yet — create one</Text> :
              events.map((ev) => (
                <View key={ev.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: "#fafafa", flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700" }}>{ev.name}</Text>
                    <Text style={{ color: "#666" }}>{ev.discipline} • {ev.kind} • {ev.participants.length} participants</Text>
                  </View>
                  <TouchableOpacity onPress={() => openEvent(ev)} style={[styles.smallBtn, { backgroundColor: "#0b6efd" }]}><Text style={{ color: "#fff" }}>Open</Text></TouchableOpacity>
                </View>
              ))
            }
          </View>

          <View style={{ height: 18 }} />
          <TouchableOpacity onPress={() => setScreen("setup")} style={[styles.btn, { backgroundColor: "#2e8b57" }]}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Create Event</Text>
          </TouchableOpacity>

          <View style={{ height: 18 }} />
          <Text style={{ fontWeight: "800", marginBottom: 8 }}>Quick Demos</Text>

          <TouchableOpacity onPress={() => {
            // demo track event
            const demoParticipants: Athlete[] = Array.from({ length: 6 }).map((_, i) => ({ id: `d${i+1}`, name: `Demo ${i+1}` }));
            const ev: SportEvent = {
              id: "demo-track-1",
              name: "Demo 100m",
              kind: "track",
              discipline: "100m",
              lanes: 6,
              participants: demoParticipants,
            };
            setEvents((s) => [...s, ev]);
          }} style={[styles.btn, { backgroundColor: "#0b6efd", marginBottom: 8 }]}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Add Demo 100m Event</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            const demoParticipants: Athlete[] = Array.from({ length: 5 }).map((_, i) => ({ id: `dlj${i+1}`, name: `Jumper ${i+1}` }));
            const ev: SportEvent = {
              id: "demo-lj-1",
              name: "Demo Long Jump",
              kind: "field",
              discipline: "Long Jump",
              attemptsPerAthlete: 3,
              participants: demoParticipants,
            };
            setEvents((s) => [...s, ev]);
          }} style={[styles.btn, { backgroundColor: "#d83a4a" }]}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Add Demo Long Jump</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
          <Text style={{ color: "#888" }}>Use demo events to try the live recorders. Export prints JSON to an alert (replace with Share / FS for real export).</Text>
        </ScrollView>
      )}

      {screen === "setup" && (
        <EventSetup onCreate={(ev) => createEvent(ev)} onCancel={() => setScreen("home")} />
      )}

      {screen === "dashboard" && selectedEvent && (
        <EventDashboard event={selectedEvent} onBack={() => setScreen("home")} onExport={exportJson} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: "900", fontSize: 18 },
  btn: { padding: 12, borderRadius: 8 },
  smallBtn: { padding: 8, borderRadius: 8 }
});
