export type ExperienceType = "VR" | "FIFA";

export type RegistrationStatus =
  | "waiting"
  | "ready"
  | "playing"
  | "completed"
  | "no_show";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  invited_at: string | null;
  created_at: string;
};

export type ImmersionKioskRegistration = {
  id: string;
  queue_number: number;
  name: string;
  email: string;
  phone: string;
  experience: ExperienceType;
  status: RegistrationStatus;
  event_name: string;
  play_count: number;
  checked_in_by_team_member_id: string | null;
  checked_in_by_name: string | null;
  disclaimer_accepted_at: string | null;
  acknowledgment_sent_at: string | null;
  ready_email_sent_at: string | null;
  thank_you_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
  played_at: string | null;
};

export type CreateRegistrationInput = {
  name: string;
  email: string;
  phone: string;
  experience: ExperienceType;
  event_name: string;
  disclaimer_accepted: boolean;
  checked_in_by_team_member_id?: string | null;
};

export type UpdateRegistrationStatusInput = {
  id: string;
  status: RegistrationStatus;
  played_at?: string | null;
  checked_in_by_team_member_id?: string | null;
};

export type CreateTeamMemberInput = {
  name: string;
  email: string;
  role: string;
};
