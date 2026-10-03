export type Platform = 'Steam' | 'Riot' | 'Epic' | 'EA' | 'LinuxNative';
export type InstallationFilter = 'all' | 'installed' | 'uninstalled';

export interface Game {
  id: string;
  name: string;
  platform: Platform;
  installPath: string;
  launchUri: string | null;
  coverImageUrl: string | null;
  backgroundImageUrl: string | null;
  associatedAccountIds: string[];
  platformGameId: string;
  isInstalled: boolean;
}

export interface Account {
  id: string;
  displayName: string;
  platform: Platform;
  platformUserId: string;
  isActive: boolean;
  sessionBackupPath: string | null;
  lastLogin: string | null;
}

export interface LaunchRequest {
  gameId: string;
  accountId?: string;
}

export interface LaunchResult {
  success: boolean;
  message: string;
  accountSwapped: boolean;
}

export interface ConflictInfo {
  gameId: string;
  gameName: string;
  availableAccounts: Account[];
}

export interface PreflightResponse {
  hasConflict: boolean;
  conflict?: ConflictInfo;
}

export interface SystemInfo {
  os: string;
  isWindows: boolean;
  isLinux: boolean;
  machineName: string;
  framework: string;
  architecture: string;
}

export type ViewMode = 'grid' | 'list';
export type GridDensity = 'compact' | 'standard' | 'spacious';
export type SortOption = 'name-asc' | 'name-desc' | 'platform';
