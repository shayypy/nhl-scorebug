import { GameType } from './Game';
import { Official, PartialPlayer, Player } from './Player';
import { PartialTeam, Team } from './Team';

export interface LiveFeed {
  copyright: string;
  gamePk: number; // id
  link: string;
  metaData: {
    wait: number;
    timeStamp: string;
  };
  gameData: {
    game: {
      pk: number; // id
      season: string;
      type: GameType;
    };
    datetime: {
      dateTime: string;
    };
    status: {
      abstractGameState: string;
      codedGameState: string;
      detailedState: string;
      statusCode: string;
      startTimeTBD: false;
    };
    teams: {
      away: Team;
      home: Team;
    };
    players: Record<string, Player>;
    venue: {
      name: string;
      link: string;
    };
  };
  liveData: {
    plays: {
      allPlays: Play[];
      scoringPlays: number[];
      penaltyPlays: number[];
      playsByPeriod: {
        startIndex: number;
        plays: number[];
        endIndex: number;
      }[];
      currentPlay: Play;
    };
    linescore: LineScore;
    boxscore: {
      teams: {
        away: TeamBoxScore;
        home: TeamBoxScore;
      };
      officials: Official[];
    };
    decisions?: {
      firstStar: PartialPlayer;
      secondStar: PartialPlayer;
      thirdStar: PartialPlayer;
    };
  };
}

export interface LineScore {
  currentPeriod: PeriodNum;
  currentPeriodOrdinal: PeriodOrdinal;
  currentPeriodTimeRemaining: 'Final';
  periods: {
    periodType: 'REGULAR';
    num: 1 | 2 | 3;
    ordinalNum: PeriodOrdinal;
    home: {
      goals: number;
      shotsOnGoal: number;
    };
    away: {
      goals: number;
      shotsOnGoal: number;
    };
  }[];
  shootoutInfo: {
    away: {
      scores: number;
      attempts: number;
    };
    home: {
      scores: number;
      attempts: number;
    };
  };
  teams: {
    home: {
      team: PartialTeam;
      goals: number;
      shotsOnGoal: number;
      goaliePulled: boolean;
      numSkaters: number;
      powerPlay: boolean;
    };
    away: {
      team: PartialTeam;
      goals: number;
      shotsOnGoal: number;
      goaliePulled: boolean;
      numSkaters: number;
      powerPlay: boolean;
    };
  };
  powerPlayStrength: 'Even';
  hasShootout: boolean;
  intermissionInfo: {
    intermissionTimeRemaining: number;
    intermissionTimeElapsed: number;
    inIntermission: boolean;
  };
}

export interface Play {
  players: {
    player: PartialPlayer;
    playerType: 'Scorer' | 'Assist' | 'Goalie' | 'PenaltyOn';
    seasonTotal?: number;
  }[];
  result: {
    event: 'Goal' | 'Penalty';
    eventCode: string;
    eventTypeId: 'GOAL' | 'PENALTY';
    description: string;
    strength?: {
      code: string; // SHG
      name: string; // Short Handed
    };
    secondaryType?: 'Hooking';
    penaltySeverity?: 'Minor';
    penaltyMinutes?: number;
    gameWinningGoal?: boolean;
    emptyNet?: boolean;
  };
  about: {
    eventIdx: number;
    eventId: number;
    period: 1 | 2 | 3;
    periodType: 'REGULAR'; // | 'OVERTIME';
    ordinalNum: PeriodOrdinal;
    periodTime: string;
    periodTimeRemaining: string;
    dateTime: string;
    goals: {
      away: number;
      home: number;
    };
  };
  coordinates: unknown;
  team: {
    id: number;
    name: string;
    link: string;
    triCode: string;
  };
}

interface TeamBoxScore {
  team: PartialTeam;
  teamStats: {
    teamSkaterStats: {
      goals: number;
      pim: number;
      shots: number;
      powerPlayPercentage: string;
      powerPlayGoals: number;
      powerPlayOpportunities: number;
      faceOffWinPercentage: string;
      blocked: number;
      takeaways: number;
      giveaways: number;
      hits: number;
    };
  };
  players: Record<string, Player>;
  goalies: number[];
  skaters: number[];
  onIce: number[];
  onIcePlus: number[];
  scratches: number[];
  penaltyBox: number[];
  coaches: {
    person: {
      fullName: string;
      link: string;
    };
    position: {
      code: 'HC';
      name: 'Head Coach';
      type: 'Head Coach';
      abbreviation: 'Head Coach';
    };
  }[];
}

// 0 = not started yet
export type PeriodNum = 0 | 1 | 2 | 3 | 4 | 5;
export type PeriodOrdinal = '1st' | '2nd' | '3rd' | 'OT' | 'SO';
