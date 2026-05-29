import { forwardRef } from "react"

/** use:action archive | store, box, remove */
const Archive = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement> & { size?: number }>(
  ({ className, size = 16, ...props }, ref) => (
    <svg ref={ref} className={className} {...props} width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
      fill="currentColor"
      fillRule="evenodd"
      d="M1.75 1A.75.75 0 0 0 1 1.75v2.5c0 .414.336.75.75.75H2v8.25c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75V5h.25a.75.75 0 0 0 .75-.75v-2.5a.75.75 0 0 0-.75-.75zm10.75 4H3.5v7.5h9zM13.5 3.5h-11v-1h11zM6 7.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75"
      clipRule="evenodd"
      />
    </svg>
  )
)
Archive.displayName = "Archive"
export { Archive }
