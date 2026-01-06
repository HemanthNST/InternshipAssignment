export interface Site {
  id: string;
  name: string;
  location: string;
}

export interface SitePerformance {
  ticketsIssued: number;
  collection: number;
  activeParking: number;
  totalTickets: number;
  totalCollection: number;
}

export const PARKING_SITES: Site[] = [
  { id: "1", name: "Inorbit Mall", location: "Kukatpally, Hyderabad" },
  { id: "2", name: "Phoenix Courtyard", location: "Necklace Road, Hyderabad" },
  { id: "3", name: "Prestige Tech Park", location: "HITEC City, Hyderabad" },
  { id: "4", name: "Forum Bengaluru", location: "Koramangala, Bangalore" },
];

export const SITE_PERFORMANCE_DATA: Record<string, SitePerformance> = {
  "1": {
    ticketsIssued: 24,
    collection: 585.5,
    activeParking: 18,
    totalTickets: 156,
    totalCollection: 3850.75,
  },
  "2": {
    ticketsIssued: 18,
    collection: 425.5,
    activeParking: 14,
    totalTickets: 127,
    totalCollection: 3250.5,
  },
  "3": {
    ticketsIssued: 32,
    collection: 765.25,
    activeParking: 28,
    totalTickets: 198,
    totalCollection: 4920.0,
  },
  "4": {
    ticketsIssued: 15,
    collection: 350.0,
    activeParking: 10,
    totalTickets: 95,
    totalCollection: 2400.25,
  },
};
