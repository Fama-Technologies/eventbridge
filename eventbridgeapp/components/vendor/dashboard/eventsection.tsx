'use client'

import { Calendar, Clock, AlertCircle, MessageCircle, DollarSign, TrendingUp, Users } from "lucide-react"

interface Booking {
  id: number;
  eventName: string;
  eventDate: string;
  status: string;
  amount: number;
  createdAt: string;
  clientName?: string;
}

interface Activity {
  id: string;
  type: 'new_request' | 'booking_confirmed' | 'status_update';
  message: string;
  timestamp: string;
}

interface EventSectionProps {
  recentBookings?: Booking[];
  recentActivity?: Activity[];
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: string | Date) => string;
  formatRelativeTime?: (date: string | Date) => string;
}

// RecentMessages Component
function RecentMessages({
  recentActivity = [],
  formatRelativeTime,
}: {
  recentActivity?: Activity[];
  formatRelativeTime?: (date: string | Date) => string;
}) {
  const defaultFormatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const relativeTimeFormatter = formatRelativeTime || defaultFormatRelativeTime;

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'new_request':
        return <AlertCircle className="w-4 h-4 text-blue-500" />
      case 'booking_confirmed':
        return <Calendar className="w-4 h-4 text-green-500" />
      case 'status_update':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'new_request':
        return 'bg-blue-50 border-blue-100'
      case 'booking_confirmed':
        return 'bg-green-50 border-green-100'
      case 'status_update':
        return 'bg-yellow-50 border-yellow-100'
      default:
        return 'bg-gray-50 border-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-primary-01" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        {recentActivity.length > 0 && (
          <button className="text-sm text-primary-01 hover:text-primary-02 font-medium">
            View All →
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {recentActivity.length > 0 ? (
          recentActivity.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-4 p-4 border rounded-lg ${getActivityColor(activity.type)} transition-colors hover:shadow-sm`}
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm leading-relaxed">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {relativeTimeFormatter(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">
              Activity will appear here when you receive bookings
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// QuickSection Component
function QuickSection({
  recentBookings = [],
  formatCurrency,
  formatDate,
}: {
  recentBookings?: Booking[];
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: string | Date) => string;
}) {
  const defaultFormatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const defaultFormatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const currencyFormatter = formatCurrency || defaultFormatCurrency;
  const dateFormatter = formatDate || defaultFormatDate;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const relevantBookings = recentBookings
    .slice(0, 3)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-primary-01" />
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Overview
          </h2>
        </div>
        <button className="text-sm text-primary-01 hover:text-primary-02 font-medium">
          View Calendar →
        </button>
      </div>
      
      <div className="space-y-4">
        {relevantBookings.length > 0 ? (
          relevantBookings.map((booking) => (
            <div
              key={booking.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900">
                      {booking.eventName || "Untitled Event"}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateFormatter(booking.eventDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {currencyFormatter(booking.amount)}
                    </span>
                  </div>
                  {booking.clientName && (
                    <p className="text-sm text-gray-500 mt-2">
                      Client: {booking.clientName}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No recent bookings</p>
            <p className="text-sm text-gray-500 mt-1">
              Your recent bookings will appear here
            </p>
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {recentBookings.filter(b => b.status === 'pending').length}
            </p>
            <p className="text-xs text-blue-700">Pending</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {recentBookings.filter(b => b.status === 'confirmed').length}
            </p>
            <p className="text-xs text-green-700">Confirmed</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// BookTrackerRecent Component
function BookTrackerRecent({
  recentBookings = [],
  formatCurrency,
}: {
  recentBookings?: Booking[];
  formatCurrency?: (amount: number) => string;
}) {
  const defaultFormatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const currencyFormatter = formatCurrency || defaultFormatCurrency;

  // Calculate statistics
  const totalRevenue = recentBookings.reduce((sum, booking) => sum + booking.amount, 0);
  const confirmedBookings = recentBookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = recentBookings.filter(b => b.status === 'pending').length;
  
  // Get latest bookings (last 3)
  const latestBookings = recentBookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary-01" />
          <h2 className="text-lg font-semibold text-gray-900">
            Bookings Tracker
          </h2>
        </div>
        <button className="text-sm text-primary-01 hover:text-primary-02 font-medium">
          Details →
        </button>
      </div>
      
      {/* Stats Overview */}
      <div className="space-y-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {currencyFormatter(totalRevenue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{confirmedBookings}</p>
            <p className="text-xs text-blue-700">Confirmed</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{pendingBookings}</p>
            <p className="text-xs text-yellow-700">Pending</p>
          </div>
        </div>
      </div>
      
      {/* Latest Bookings */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Latest Bookings
        </h3>
        <div className="space-y-3">
          {latestBookings.length > 0 ? (
            latestBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 truncate max-w-[120px]">
                    {booking.eventName || "Event"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currencyFormatter(booking.amount)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status?.charAt(0).toUpperCase()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No bookings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main EventSection Component
export default function EventSection({
  recentBookings = [],
  recentActivity = [],
  formatCurrency,
  formatDate,
  formatRelativeTime,
}: EventSectionProps) {
  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-6 gap-6" aria-label="Vendor events and recent activity">
      <div className="col-span-1 lg:col-span-4">
        <RecentMessages 
          recentActivity={recentActivity}
          formatRelativeTime={formatRelativeTime}
        />
        
        <QuickSection 
          recentBookings={recentBookings}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </div>
      <aside className="col-span-1 lg:col-span-2">
        <BookTrackerRecent 
          recentBookings={recentBookings}
          formatCurrency={formatCurrency}
        />
      </aside>
    </section>
  )
}