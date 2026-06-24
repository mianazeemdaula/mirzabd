import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("bg-elevated rounded animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
