import { Link } from "react-router-dom";
import { NavBar } from '../components/NavBar';
import { Outlet } from "react-router-dom";

export default function Root() {

  return (
    <div className="flex flex-col min-h-screen bg-custom">
      {/* Conteneur principal avec largeur maximale pour desktop et tablette */}
      <div className="flex flex-col flex-grow mx-auto w-full max-w-3xl md:ml-[70px] lg:ml-[220px] md:border-x border-custom-gray">
        <main className="flex-grow">
          <Outlet />
        </main>
      </div>
      <NavBar />
    </div>
  );
}
