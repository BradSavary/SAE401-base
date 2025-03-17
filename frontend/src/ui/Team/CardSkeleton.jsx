import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

export default function CardSkeleton() {
  return (
    <figure className="aspect-card grid cursor-pointer overflow-hidden rounded duration-300 md:hover:scale-105">
      <div className="col-start-1 col-end-1 row-start-1 row-end-1">
        <Skeleton className="h-full object-cover" height="100%" />
      </div>
    </figure>
  );
}
