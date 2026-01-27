'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type DashboardStats = {
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingsGrowth: number;
  pendingRequests: number;
  responseRate: number;
};

type RecentBooking = {
  id: number;
  eventName: string;
  eventDate: string;
  status: string;
  amount: number;
  createdAt: string;
  clientName: string;
};

type RecentActivity = {
  id: string;
  type: 'new_request' | 'booking_confirmed';
  message: string;
  timestamp: string;
};

type DashboardData = {
  stats: DashboardStats;
  profileCompletion: number;
  recentBookings: RecentBooking[];
  recentActivity: RecentActivity[];
};

type DashboardDataContextValue = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
};

const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(
  undefined
);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      try {
        setLoading(true);
        const response = await fetch('/api/vendor');
        if (!response.ok) {
          throw new Error('Failed to load dashboard data');
        }
        const payload = await response.json();

        if (isMounted) {
          setData({
            stats: payload.stats,
            profileCompletion: payload.profileCompletion,
            recentBookings: payload.recentBookings || [],
            recentActivity: payload.recentActivity || [],
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({ data, loading, error }),
    [data, loading, error]
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return context;
}
