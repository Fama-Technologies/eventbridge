import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";

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
    neutral: "bg-[#3a3a3a] text-gray-200",
    positive: "bg-[#FFFFFF33] text-[#00E64D]",
    negative: "bg-red-600 text-white",
  };

  const TrendIcon =
    trend === "positive"
      ? TrendingUp
      : trend === "negative"
        ? TrendingDown
        : null;

  return (
    <div className="h-[162px] w-full bg-[#222222] p-6 rounded-xl border border-[#666666] shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-md bg-[#FF704333] flex items-center justify-center">
          <Icon size={18} className="text-[#FF7043]" />
        </div>

        <div
          className={`px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2 ${badgeStyles[trend]}`}
        >
          {TrendIcon && <TrendIcon size={12} />}
          <span>{stat}</span>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-white">
          {formatCount(title, count)}
        </p>
      </div>
    </div>
  );
}
