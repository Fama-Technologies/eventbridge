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

  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 text-center whitespace-nowrap ${
              isSelected
                ? 'bg-primary-01 text-white border border-primary-01'
                : 'bg-transparent border border-neutrals-05 text-foreground hover:border-primary-01 hover:text-primary-01'
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
