export type Country =
  | "USA"
  | "UK"
  | "Canada"
  | "Australia"
  | "South Africa"
  | "France"
  | "Other";

export type TargetArea =
  | "Tel Aviv"
  | "Jerusalem"
  | "Ra'anana/Herzliya"
  | "Modi'in"
  | "Beer Sheva"
  | "Haifa"
  | "Other";

export type Timeline =
  | "0-6 months"
  | "6-12 months"
  | "1-2 years"
  | "Just exploring";

export type FamilyType =
  | "Single"
  | "Couple"
  | "Couple with children"
  | "Retiree/s";

export type Career =
  | "Remote worker"
  | "Need Israeli employment"
  | "Self-employed"
  | "Student"
  | "Retired";

export type SpouseCareer =
  | "N/A"
  | "Remote"
  | "Needs Israeli job"
  | "Professional license transfer"
  | "Other";

export type Concern =
  | "Bureaucracy"
  | "Housing"
  | "Healthcare"
  | "Schools"
  | "Employment"
  | "Hebrew"
  | "Finance"
  | "Community";

export type FormData = {
  country: Country;
  targetArea: TargetArea;
  timeline: Timeline;
  familyType: FamilyType;
  career: Career;
  spouseCareer: SpouseCareer;
  concerns: Concern[];
  firstName: string;
  email: string;
  gdprConsent: boolean;
};

export type GenerationStatus = "pending" | "generating" | "completed" | "failed";

export type StatusResponse = {
  status: GenerationStatus;
  pdfUrl?: string;
  readinessScore?: number;
  error?: string;
};
