import Team from "../ui/Team/index.jsx";
import TeamSkeleton from "../ui/Team/TeamSkeleton";
import Testimonial from "../ui/Testimonial/index.jsx";
import { fetchOurTeams,  fetchTestimonialData  } from "../lib/loaders.js";

import { useLoaderData, defer, Await } from "react-router-dom";
import { Suspense } from "react";



export async function loader({ params }) {
  const teamdata = fetchOurTeams(params.teamType);
  const testimonialdata = await fetchTestimonialData(params.teamType);
  return defer({ team: teamdata, testimonial: testimonialdata });
}

export default function AllTeam() {
  const data = useLoaderData();
  return (
    <>
    <Suspense fallback={<TeamSkeleton />}>
      <Await resolve={data.team} errorElement={<div>Failed to load data.team</div>}>
        {teamData => <Team {...teamData} />}
      </Await>
    </Suspense>

      <Testimonial data={data.testimonial} /> 
    </>
  );
}