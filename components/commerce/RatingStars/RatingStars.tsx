import React from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";

export interface RatingStarsProps {
  rating: number; // 0-5
  maxRating?: number; // 기본값 5
  size?: "small" | "medium" | "large";
  showRating?: boolean; // 숫자 표시 여부
  interactive?: boolean; // 클릭 가능 여부
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarIcon: React.FC<{ filled: boolean; size: number }> = ({
  filled,
  size,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 0L10.1631 5.52786L16 6.11146L11.8541 9.52786L13.0557 15.8885L8 12.9443L2.94427 15.8885L4.1459 9.52786L0 6.11146L5.83686 5.52786L8 0Z"
      fill={filled ? commerceColors.neutral["07"]["100"] : "none"}
      stroke={filled ? commerceColors.neutral["07"]["100"] : "#E8EDEF"}
      strokeWidth={filled ? 0 : 1}
    />
  </svg>
);

export const RatingStars = React.forwardRef<HTMLDivElement, RatingStarsProps>(
  (
    {
      rating,
      maxRating = 5,
      size = "medium",
      showRating = false,
      interactive = false,
      onRatingChange,
      className,
    },
    ref
  ) => {
    const [hoveredRating, setHoveredRating] = React.useState<number | null>(
      null
    );
    const [internalRating, setInternalRating] = React.useState(rating);

    React.useEffect(() => {
      setInternalRating(rating);
    }, [rating]);

    const starSize = {
      small: 12,
      medium: 16,
      large: 20,
    }[size];

    const displayRating = hoveredRating ?? internalRating;
    const clampedRating = Math.max(0, Math.min(displayRating, maxRating));

    const handleStarClick = (starIndex: number) => {
      if (!interactive || !onRatingChange) return;
      const newRating = starIndex + 1;
      setInternalRating(newRating);
      onRatingChange(newRating);
    };

    const handleStarHover = (starIndex: number) => {
      if (!interactive) return;
      setHoveredRating(starIndex + 1);
    };

    const handleMouseLeave = () => {
      if (!interactive) return;
      setHoveredRating(null);
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        onMouseLeave={handleMouseLeave}
        role={interactive ? "radiogroup" : "img"}
        aria-label={`Rating: ${clampedRating} out of ${maxRating} stars`}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const isFilled = index < Math.floor(clampedRating);
          const isHalfFilled =
            !isFilled && index < clampedRating && clampedRating % 1 !== 0;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(index)}
              onMouseEnter={() => handleStarHover(index)}
              disabled={!interactive}
              className={cn(
                "flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#141718]",
                interactive && "cursor-pointer",
                !interactive && "cursor-default"
              )}
              aria-label={`${index + 1} star${index + 1 !== 1 ? "s" : ""}`}
              aria-pressed={interactive ? index < internalRating : undefined}
            >
              <StarIcon filled={isFilled || isHalfFilled} size={starSize} />
            </button>
          );
        })}
        {showRating && (
          <span
            className="ml-2"
            style={{
              fontSize: `${commerceTypography.caption["1"].fontSize}px`,
              lineHeight: `${commerceTypography.caption["1"].lineHeight}px`,
              fontFamily: commerceTypography.caption["1"].fontFamily,
              fontWeight: commerceTypography.caption["1"].fontWeight,
              color: commerceColors.text.tertiary,
            }}
          >
            {clampedRating.toFixed(1)}
          </span>
        )}
      </div>
    );
  }
);

RatingStars.displayName = "RatingStars";
