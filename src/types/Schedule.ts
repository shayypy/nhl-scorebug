import { Team } from './Team';

export interface Schedule {
  copyright: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalMatches: number;
  metaData?: { timeStamp: string };
  wait: number;
  dates: {
    date: string;
    totalItems: number;
    totalEvents: number;
    totalGames: number;
    totalMatches: number;
    games: {
      gamePk: number;
      link: string;
      gameType: string;
      season: string;
      gameDate: string;
      status: {
        abstractGameState: string;
        codedGameState: string;
        detailedState: string;
        statusCode: string;
        startTimeTBD: boolean;
      };
      teams: {
        away: TeamScheduleInfo;
        home: TeamScheduleInfo;
      };
      venue: {
        name: string;
        link: string;
      };
      content: { link: string };
    }[];
  }[];
  events: Array<unknown>;
  matches: Array<unknown>;
}

interface TeamScheduleInfo {
  leagueRecord: {
    wins: number;
    losses: number;
    ot: number;
    type: string;
  };
  score: number;
  team: Team; // Assuming hydrate=team
}
