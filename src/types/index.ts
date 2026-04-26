export interface User {
  id: number;
  name: string;
  email: string;
}

export interface QuinielaGroup {
  id: number;
  name: string;
  users: number;
}

export interface Match {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  gameStatus: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'AET' | 'PEN';
  gameStatusLabel: string;
  matchScore: MatchScore | null;
  homeTeamLogo: string;
  awayTeamLogo: string;
}

export interface MatchScore {
  homeGoals: number | null;
  awayGoals: number | null;
}

export interface ScorePrediction {
  id?: number;
  user: User;
  userPredictedScore: MatchScore | null;
  match: Match;
}

export interface LeaderboardUser {
  name: string;
  points: number;
  rank: number;
}

export interface GroupPrediction {
  userId: number;
  userName: string;
  matchId: number;
  predictedScore1: number;
  predictedScore2: number;
}