import { Link } from "react-router-dom";
import { NavBar } from '../components/NavBar';
import { Outlet } from "react-router-dom";

export default function Root() {

  return (
    <>

      <NavBar />
      <section>
      <Outlet />
      </section>

    </>
  );
}
