export function BobaLogo({
  className,
  size = 28,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size * 1.28}
      viewBox="0 0 44 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* straw */}
      <rect x="24" y="1" width="5" height="16" rx="2" transform="rotate(14 24 1)" fill="currentColor" />
      {/* dome lid */}
      <path
        d="M8 14C8 8.5 14.3 4 22 4C29.7 4 36 8.5 36 14V16H8V14Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* cup body */}
      <path
        d="M8.5 17H35.5L32.3 49.5C32 52.5 29.5 54.5 26.5 54.5H17.5C14.5 54.5 12 52.5 11.7 49.5L8.5 17Z"
        fill="currentColor"
        fillOpacity="0.07"
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* tapioca pearls */}
      <circle cx="17.5" cy="46" r="2.6" fill="#4A2E1E" />
      <circle cx="23.5" cy="48.5" r="2.6" fill="#4A2E1E" />
      <circle cx="27.5" cy="43.5" r="2.6" fill="#4A2E1E" />
    </svg>
  )
}
