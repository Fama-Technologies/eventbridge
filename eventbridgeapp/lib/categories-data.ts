export type CategoryData = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  vendorCount: number;
};

export const CATEGORY_DATA: CategoryData[] = [
  {
    slug: 'weddings',
    name: 'Weddings',
    description: 'Venues, photographers, florists',
    imageUrl: '/categories/weddings.jpg',
    vendorCount: 150
  },
  {
    slug: 'corporate',
    name: 'Corporate',
    description: 'Seminars, catering, team building',
    imageUrl: '/categories/Corporate.jpg',
    vendorCount: 85
  },
  {
    slug: 'parties',
    name: 'Parties',
    description: 'DJs, decor, entertainment',
    imageUrl: '/categories/Parties.jpg',
    vendorCount: 200
  },
  {
    slug: 'birthdays',
    name: 'Birthdays',
    description: 'Bakers, caterers, entertainment',
    imageUrl: '/categories/Birthdays.jpg',
    vendorCount: 120
  },
  {
    slug: 'anniversaries',
    name: 'Anniversaries',
    description: 'Venue rentals, photographers, gift shops',
    imageUrl: '/categories/Anniversaries.jpg',
    vendorCount: 70
  },
  {
    slug: 'conferences',
    name: 'Conferences',
    description: 'Speakers, workshops, networking',
    imageUrl: '/categories/Conferences.jpg',
    vendorCount: 95
  },
  {
    slug: 'funerals',
    name: 'Funerals',
    description: 'Transportation, funeral organizers, catering',
    imageUrl: '/categories/Funerals.jpg',
    vendorCount: 40
  },
  {
    slug: 'graduations',
    name: 'Graduations',
    description: 'Catering services, photography, venue decor',
    imageUrl: '/categories/Graduations.jpg',
    vendorCount: 60
  },
  {
    slug: 'baby-showers',
    name: 'Baby Showers',
    description: 'Venue, decorations, catering',
    imageUrl: '/categories/Baby Showers.png',
    vendorCount: 55
  },
  {
    slug: 'engagements',
    name: 'Engagements',
    description: 'Venue, photographers, floral design',
    imageUrl: '/categories/Engagements.jpg',
    vendorCount: 75
  },
  {
    slug: 'workshops',
    name: 'Workshops',
    description: 'Tutoring, materials, venue rental',
    imageUrl: '/categories/Workshops.jpg',
    vendorCount: 50
  },
  {
    slug: 'product-launches',
    name: 'Product Launches',
    description: 'Promotions, displays, catering',
    imageUrl: '/categories/Product Launches.png',
    vendorCount: 45
  }
];
