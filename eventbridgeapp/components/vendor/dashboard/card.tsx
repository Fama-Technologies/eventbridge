import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CardProps {
  title: string;
  count: number | string;
  stat?: string;
  icon: LucideIcon;
}

type Trend = "positive" | "negative" | "neutral";

function getTrend(stat: string): Trend {
  const value = Number(stat.replace(/[^\d.-]/g, ""));
  if (!value || value === 0) return "neutral";
  if (value < 0) return "negative";
  return "positive";
}

function formatCount(title: string, count: number | string) {
  const num = Number(count);

  if (title.toLowerCase().includes("earn")) {
    return `UGX ${new Intl.NumberFormat().format(isNaN(num) ? 0 : num)}`;
  }

  if (
    title.toLowerCase().includes("response") ||
    title.toLowerCase().includes("rate")
  ) {
    return `${count}%`;
  }

  return typeof count === "number"
    ? new Intl.NumberFormat().format(count)
    : count;
}

export default function Card({
  title,
  count,
  stat = "",
  icon: Icon,
}: CardProps) {
  const trend = getTrend(stat);

  const badgeStyles: Record<Trend, string> = {
    neutral: "bg-neutrals-02 text-neutrals-07",
    positive: "bg-neutrals-02 text-accents-discount",
    negative: "bg-errors-bg text-errors-main",
  };

  const TrendIcon =
    trend === "positive"
      ? TrendingUp
      : trend === "negative"
        ? TrendingDown
        : null;

  return (
    <div className="h-[162px] w-full bg-shades-white p-6 rounded-xl border border-neutrals-03 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-neutrals-05">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-md bg-primary-01/15 flex items-center justify-center">
          <Icon size={18} className="text-primary-01" />
        </div>

        <div
          className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2 ${badgeStyles[trend]}`}
        >
          {TrendIcon && <TrendIcon size={12} />}
          <span>{stat}</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-neutrals-07">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-shades-black">
          {formatCount(title, count)}
        </p>
      </div>
    </div>
  );
}
