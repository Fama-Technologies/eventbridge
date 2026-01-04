import ServiceCard from './service-card';

export default function MostUsedServices() {
  // Mock data - replace with actual data from API
  const services = [
    {
      id: '1',
      businessName: 'Business name',
      category: 'Service Category',
      location: 'Location',
      availableDates: 'Available dates',
      pricePerDay: '$---',
      rating: 4.91,
    },
    {
      id: '2',
      businessName: 'Business name',
      category: 'Service Category',
      location: 'Location',
      availableDates: 'Available dates',
      pricePerDay: '$---',
      rating: 4.91,
    },
    {
      id: '3',
      businessName: 'Business name',
      category: 'Service Category',
      location: 'Location',
      availableDates: 'Available dates',
      pricePerDay: '$---',
      rating: 4.91,
    },
    {
      id: '4',
      businessName: 'Business name',
      category: 'Service Category',
      location: 'Location',
      availableDates: 'Available dates',
      pricePerDay: '$---',
      rating: 4.91,
    },
  ];

  return (
    <section className="py-12 px-6 bg-accents-peach/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-primary-01 rounded-full"></div>
          <h2 className="text-2xl font-bold text-shades-black">Top Recommended Services</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
