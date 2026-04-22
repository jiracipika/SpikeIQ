import type { AppUser, UserSettings } from "@/types/domain";

export const mockUser: AppUser = {
  id: "user_001",
  email: "player@valorlab.gg",
  displayName: "AimTheory",
  tagline: "#NA1",
  region: "NA",
  accountLinked: false,
};

export const mockSettings: UserSettings = {
  preferredRole: "initiator",
  preferredAgents: ["Sova", "Skye", "KAY/O"],
  profileVisibility: "public",
  emailUpdates: true,
};
