import HeroSection from '@/components/home/hero-section';
import BookingProcess from '@/components/home/booking-process';
import ExploreCategories from '@/components/home/explore-categories';
import MostUsedServices from '@/components/home/most-used-services';

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <BookingProcess />
      <ExploreCategories />
      <MostUsedServices />
    </div>
  );
}