
export type Athlete = {
  id: string;
  name: string;
  bib?: string;
  country?: string;
};

export type LaneAssignment = {
  lane: number;
  athlete?: Athlete | null;
  timeMs?: number | null;
  status?: "OK" | "DNS" | "DNF" | "DQ";
};

export type Attempt = {
  id: string;
  attemptNumber: number;
  valueMeters?: number | null;
  foul?: boolean;
  wind?: number | null;
};

export type FieldEntry = {
  athlete: Athlete;
  attempts: Attempt[];
  best?: number | null;
  status?: "OK" | "DNS" | "DNF" | "DQ";
};


export type Phase = "Heats" | "Semifinal" | "Final" | "Qualification" | "Finals" | "Single";

export type EventKind = "track" | "field" | "combined" | "walk" | "marathon";

export type SportEvent = {
  id: string;
  name: string; // e.g. "100m Men"
  kind: EventKind;
  discipline: string; // "100m", "Long Jump", "Shot Put", "4x100"
  phase?: Phase;
  lanes?: number; // for track
  attemptsPerAthlete?: number; // for field events
  distanceMeters?: number; // optional numeric distance (for some events)
  windLegalLimit?: number | null; // m/s or null
  qualification?: { byPlace?: number; byTime?: number | null };
  participants: Athlete[];
  notes?: string;
};
