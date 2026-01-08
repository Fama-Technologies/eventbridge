'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProfileStrengthCard from "@/components/vendor/dashboard/ProfileStrengthCard"
import CardSection from "@/components/vendor/dashboard/cardsection"
import EventSection from "@/components/vendor/dashboard/eventsection"

export default function VendorPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            if (status === 'loading') return
            
            // Check for stored user data from login
            const pendingUser = sessionStorage.getItem('pendingUser')
            if (pendingUser) {
                try {
                    const userData = JSON.parse(pendingUser)
                    if (userData.accountType?.toUpperCase() === 'VENDOR') {
                        setUser(userData)
                        setIsLoading(false)
                        sessionStorage.removeItem('pendingUser')
                        return
                    }
                } catch (error) {
                    console.error('Error parsing stored user data:', error)
                }
                sessionStorage.removeItem('pendingUser')
            }
            
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
                                setUser(data.user)
                                setIsLoading(false)
                                return
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
                
                router.push('/login')
                return
            }
            
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
            
            setUser(userData)
            setIsLoading(false)
        }
        
        checkAuth()
    }, [session, status, router])
    
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

    return (
        <div className="flex flex-col w-full gap-6 text-shades-black transition-colors">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                <div>
                    <h1 className="font-font1 font-bold text-[28px] md:text-[36px] leading-[32px] md:leading-[40px] tracking-[-0.9px] align-middle pb-4">
                        Welcome back, <span className="text-primary-01">{user.firstName || user.name?.split(' ')[0] || 'Vendor'}</span>!
                    </h1>
                    <p className="font-font1 text-neutrals-06 font-normal text-[14px] md:text-[16px] leading-[22px] md:leading-[24px] tracking-[-0.5px]">
                        Here is what is happening with your business today.
                    </p>
                </div>
                <ProfileStrengthCard />
            </div>
            <div>
                <CardSection />
            </div>
            <div>
                <EventSection />
            </div>
        </div>
    )
}