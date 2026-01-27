'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const CATEGORIES = [
  { id: 'photography', label: 'Photography' },
  { id: 'catering', label: 'Catering' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'decoration', label: 'Decoration' },
  { id: 'dj-sound', label: 'DJ & Sound' },
  { id: 'venues', label: 'Venues' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'flowers', label: 'Flowers' },
];

interface CategoryPillsProps {
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

export default function CategoryPills({
  selectedCategory,
  onCategorySelect
}: CategoryPillsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      // Update URL with filter
      const params = new URLSearchParams(searchParams.toString());
      if (selectedCategory === categoryId) {
        params.delete('filter');
      } else {
        params.set('filter', categoryId);
      }
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  const ALL_CATEGORIES = [
    ...CATEGORIES,
    { id: 'makeup', label: 'Makeup' },
    { id: 'transport', label: 'Transport' },
    { id: 'planning', label: 'Planning' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 scrollbar-hide">
      {ALL_CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${isSelected
              ? 'bg-primary-01 text-white shadow-md'
              : 'bg-white text-primary-01 border-2 border-primary-01 hover:bg-primary-01/5'
              }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

export { CATEGORIES };
