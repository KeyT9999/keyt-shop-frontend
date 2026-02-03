export interface VisitStats {
  period: string;
  startDate: string;
  endDate: string;
  totalVisits: number;
  uniqueVisitors: number;
  totalSessions: number;
  deviceStats: {
    [key: string]: number;
  };
  browserStats: {
    [key: string]: number;
  };
  osStats: {
    [key: string]: number;
  };
  topPaths: Array<{
    path: string;
    count: number;
  }>;
  dailyData: Array<{
    date: string;
    count: number;
  }>;
  hourlyData: Array<{
    hour: number;
    count: number;
  }>;
  previousPeriod?: VisitStats;
  comparison?: {
    totalVisitsChange: number;
    uniqueVisitorsChange: number;
    sessionsChange: number;
  };
}
