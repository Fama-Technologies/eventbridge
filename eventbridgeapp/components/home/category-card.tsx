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
    <Link
      href={href}
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="relative h-48 w-full">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm text-white/80">{subtitle}</p>
      </div>
    </Link>
  );
}
