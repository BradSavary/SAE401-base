import CardSkeleton from "./CardSkeleton";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

export default function TeamSkeleton() {
  return (
    <section className="text-foreground m-auto max-w-6xl p-4 text-center">
      <header>
        <h2><Skeleton className="text-foreground m-auto max-w-6xl p-4 text-center" width="150px"/></h2>
        <h1><Skeleton className="mt-3 text-4xl font-bold" /></h1>
      </header>
      <div>
        <p>
            <Skeleton className="max-w-ch text-foreground mx-auto mb-8 mt-4 leading-8 text-opacity-70"/>
        </p>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
          <li><CardSkeleton/></li>
          <li><CardSkeleton/></li>
          <li><CardSkeleton/></li>
        </ul>
      </div>
    </section>
  );
}