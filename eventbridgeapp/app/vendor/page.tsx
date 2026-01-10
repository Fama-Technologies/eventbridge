'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProfileStrengthCard from "@/components/vendor/dashboard/ProfileStrengthCard"
import CardSection from "@/components/vendor/dashboard/cardsection"
import EventSection from "@/components/vendor/dashboard/eventsection"

interface DashboardData {
  vendor: {
    id: number;
    businessName: string;
    category: string;
    email: string;
    phone: string | null;
    location: string | null;
    description: string | null;
    verified: boolean;
    rating: number;
    totalReviews: number;
    avatar: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    profileImage: string | null;
    isVerified: boolean;
  };
  stats: {
    totalRevenue: number;
    revenueGrowth: number;
    totalBookings: number;
    bookingsGrowth: number;
    pendingRequests: number;
    activeEvents: number;
  };
  profileCompletion: number;
  recentBookings: Array<{
    id: number;
    eventName: string;
    eventDate: string;
    status: string;
    amount: number;
    createdAt: string;
    clientName: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'new_request' | 'booking_confirmed' | 'status_update';
    message: string;
    timestamp: string;
  }>;
}

export default function VendorPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [dataError, setDataError] = useState<string | null>(null)

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            if (status === 'loading') return
            
            let currentUser = null
            
            // Check for stored user data from login
            const pendingUser = sessionStorage.getItem('pendingUser')
            if (pendingUser) {
                try {
                    const userData = JSON.parse(pendingUser)
                    if (userData.accountType?.toUpperCase() === 'VENDOR') {
                        currentUser = userData
                        sessionStorage.removeItem('pendingUser')
                    }
                } catch (error) {
                    console.error('Error parsing stored user data:', error)
                }
                sessionStorage.removeItem('pendingUser')
            }
            
            // If no pending user, check session or API
            if (!currentUser) {
                if (status === 'unauthenticated' || !session) {
                    // Try to check if we have a custom auth token
                    try {
                        const response = await fetch('/api/auth/me', {
                            credentials: 'include'
                        })
                        if (response.ok) {
                            const data = await response.json()
                            if (data.success && data.user) {
                                const accountType = data.user.accountType?.toUpperCase()
                                if (accountType === 'VENDOR') {
                                    currentUser = data.user
                                } else if (accountType === 'ADMIN') {
                                    router.push('/admin/dashboard')
                                    return
                                } else if (accountType === 'CUSTOMER') {
                                    router.push('/customer')
                                    return
                                } else {
                                    router.push('/')
                                    return
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Error checking auth:', error)
                    }
                    
                    if (!currentUser) {
                        router.push('/login')
                        return
                    }
                } else {
                    // Get user data from session or API
                    let userData = session.user
                    
                    // If session doesn't have accountType, fetch from API
                    if (!userData || !(userData as any).accountType) {
                        try {
                            const response = await fetch('/api/auth/me', {
                                credentials: 'include'
                            })
                            if (response.ok) {
                                const data = await response.json()
                                if (data.success) {
                                    userData = data.user
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching user data:', error)
                        }
                    }
                    
                    if (!userData) {
                        router.push('/login')
                        return
                    }
                    
                    const accountType = (userData as any).accountType?.toUpperCase()
                    if (accountType !== 'VENDOR') {
                        if (accountType === 'ADMIN') {
                            router.push('/admin/dashboard')
                        } else if (accountType === 'CUSTOMER') {
                            router.push('/customer')
                        } else {
                            router.push('/')
                        }
                        return
                    }
                    
                    currentUser = userData
                }
            }
            
            setUser(currentUser)
            
            // Fetch dashboard data
            await fetchDashboardData()
        }
        
        checkAuthAndFetchData()
    }, [session, status, router])

    const fetchDashboardData = async () => {
        try {
            setDataError(null)
            const response = await fetch('/api/vendor/dashboard')
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Handle authentication error
                    router.push('/login')
                    return
                }
                throw new Error(`Failed to load dashboard: ${response.statusText}`)
            }
            
            const data = await response.json()
            
            if (data.error) {
                throw new Error(data.error)
            }
            
            setDashboardData(data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            setDataError(error instanceof Error ? error.message : 'Failed to load dashboard data')
        } finally {
            setIsLoading(false)
        }
    }

    // Format currency for UGX
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-UG", {
            style: "currency",
            currency: "UGX",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Format date
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Format relative time for activity feed
    const formatRelativeTime = (date: string | Date) => {
        const now = new Date()
        const past = new Date(date)
        const diffMs = now.getTime() - past.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) {
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
        } else {
            return formatDate(date)
        }
    }

    if (isLoading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading vendor dashboard...</div>
            </div>
        )
    }
    
    if (!user) {
        return null
    }

    if (dataError) {
        return (
            <div className="flex flex-col w-full gap-6 text-shades-black transition-colors">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                    <div>
                        <h1 className="font-font1 font-bold text-[28px] md:text-[36px] leading-[32px] md:leading-[40px] tracking-[-0.9px] align-middle pb-4">
                            Welcome back, <span className="text-primary-01">{user.firstName || user.name?.split(' ')[0] || 'Vendor'}</span>!
                        </h1>
                    </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="text-red-800">
                        <p className="font-medium">Error loading dashboard data</p>
                        <p className="text-sm mt-2">{dataError}</p>
                        <button 
                            onClick={fetchDashboardData}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full gap-6 text-shades-black transition-colors">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                <div>
                    <h1 className="font-font1 font-bold text-[28px] md:text-[36px] leading-[32px] md:leading-[40px] tracking-[-0.9px] align-middle pb-4">
                        Welcome back, <span className="text-primary-01">
                            {dashboardData?.vendor?.businessName || user.firstName || user.name?.split(' ')[0] || 'Vendor'}
                        </span>!
                    </h1>
                    <p className="font-font1 text-neutrals-06 font-normal text-[14px] md:text-[16px] leading-[22px] md:leading-[24px] tracking-[-0.5px]">
                        Here is what is happening with your business today.
                    </p>
                </div>
                {dashboardData && (
                    <ProfileStrengthCard 
                        completionPercentage={dashboardData.profileCompletion}
                        vendor={dashboardData.vendor}
                    />
                )}
            </div>
            
            {dashboardData ? (
                <>
                    <div>
                        <CardSection 
                            stats={dashboardData.stats}
                            formatCurrency={formatCurrency}
                        />
                    </div>
                    <div>
                        <EventSection 
                            recentBookings={dashboardData.recentBookings}
                            recentActivity={dashboardData.recentActivity}
                            formatCurrency={formatCurrency}
                            formatDate={formatDate}
                            formatRelativeTime={formatRelativeTime}
                        />
                    </div>
                    
                    {/* Business Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Business Name</p>
                            <p className="font-medium mt-1 truncate">{dashboardData.vendor.businessName}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium mt-1 truncate">{dashboardData.vendor.email}</p>
                        </div>
                        {dashboardData.vendor.phone && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium mt-1">{dashboardData.vendor.phone}</p>
                            </div>
                        )}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className={`font-medium mt-1 ${dashboardData.vendor.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                {dashboardData.vendor.verified ? 'Verified ✓' : 'Pending'}
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-600">No dashboard data available</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="mt-4 px-4 py-2 bg-primary-01 text-white rounded-lg hover:bg-primary-02 transition-colors"
                    >
                        Refresh Data
                    </button>
                </div>
            )}
        </div>
    )
}