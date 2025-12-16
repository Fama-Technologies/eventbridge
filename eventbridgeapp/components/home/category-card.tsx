import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

export default function CategoryCard({ title, subtitle, image, href }: CategoryCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="text-base font-semibold text-shades-black mb-1">{title}</h3>
      <p className="text-sm text-neutrals-06">{subtitle}</p>
    </Link>
  );
}
