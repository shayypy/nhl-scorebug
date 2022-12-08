export interface Player {
  id: number;
  fullName: string;
  link: string;
  firstName: string;
  lastName: string;
  primaryNumber: string;
  birthDate: string;
  currentAge: number;
  birthCity: string;
  birthStateProvince: string;
  birthCountry: string;
  nationality: string;
  height: string;
  weight: number;
  active: true;
  alternateCaptain: false;
  captain: false;
  rookie: true;
  shootsCatches: string;
  rosterStatus: string;
  currentTeam: {
    id: number;
    name: string;
    link: string;
    triCode: string;
  };
  primaryPosition: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
}

export interface PartialPlayer {
  id: number;
  fullName: string;
  link: string;
}

export interface Official {
  official: {
    fullName: string;
    link: string;
  };
  officialType: 'Referee' | 'Linesman';
}
