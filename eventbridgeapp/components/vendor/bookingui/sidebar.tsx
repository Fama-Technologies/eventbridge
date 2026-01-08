"use client"
import { useState } from "react"
import { format } from "date-fns"
import { RefreshCw, Ban } from "lucide-react"

interface Booking {
  id: string
  title: string
  client: string
  initials: string
  date: Date
  guests: number
  amount: string
  status: 'confirmed' | 'pending'
}

// Mock booking data matching the image
const mockUpcomingBookings: Booking[] = [
  {
    id: '1',
    title: "Sarah's Wedding",
    client: "Sarah Johnson", 
    initials: "SJ",
    date: new Date(2023, 9, 24),
    guests: 150,
    amount: "4,500,000",
    status: 'confirmed'
  },
  {
    id: '2',
    title: "Tech Corp Mixer",
    client: "Tech Corp",
    initials: "TC", 
    date: new Date(2023, 10, 2),
    guests: 50,
    amount: "10,000,000",
    status: 'pending'
  },
  {
    id: '3',
    title: "Liam's 30th",
    client: "Liam Williams",
    initials: "LW",
    date: new Date(2023, 10, 15),
    guests: 40,
    amount: "2,800,000", 
    status: 'confirmed'
  }
]

export default function BookingSidebar() {
  const [activeTab, setActiveTab] = useState('upcoming')

  const getStatusDot = (status: 'confirmed' | 'pending') => {
    return status === 'confirmed' ? 'bg-accents-discount' : 'bg-amber-400'
  }

  return (
    <div className="h-full bg-white rounded-lg border border-neutrals-03 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-neutrals-03">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'upcoming' 
              ? 'text-primary-01 border-b-2 border-primary-01 bg-primary-01/5' 
              : 'text-neutrals-06 hover:text-shades-black'
          }`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'past' 
              ? 'text-primary-01 border-b-2 border-primary-01 bg-primary-01/5' 
              : 'text-neutrals-06 hover:text-shades-black'
          }`}
        >
          Past
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'all' 
              ? 'text-primary-01 border-b-2 border-primary-01 bg-primary-01/5' 
              : 'text-neutrals-06 hover:text-shades-black'
          }`}
        >
          All
        </button>
      </div>

      {/* Booking List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockUpcomingBookings.map((booking) => (
          <div key={booking.id} className="space-y-2">
            {/* Status Row */}
            <div className="flex items-center justify-between text-xs text-neutrals-06">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${getStatusDot(booking.status)}`} />
                <span className="capitalize">{booking.status}</span>
              </div>
              <span>{format(booking.date, 'MMM dd')}</span>
            </div>

            {/* Booking Card */}
            <div className="bg-white border border-neutrals-03 rounded-lg p-3 hover:border-primary-01 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 bg-neutrals-03 rounded-full flex items-center justify-center text-xs font-medium text-neutrals-06">
                  {booking.initials}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-shades-black truncate">
                    {booking.title}
                  </h3>
                  <p className="text-xs text-neutrals-06 mt-1">
                    {booking.guests} Guests
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <p className="font-medium text-sm text-shades-black">
                    UGX {booking.amount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-neutrals-03 space-y-3">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutrals-02 text-neutrals-08 rounded-lg hover:bg-neutrals-03 transition-colors">
          <RefreshCw size={16} />
          Sync Google Calendar
        </button>
        
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
          <Ban size={16} />
          Block Dates  
        </button>
      </div>
    </div>
  )
}