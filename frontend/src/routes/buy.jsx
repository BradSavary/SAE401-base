import Pricing from "../ui/Pricing/index.jsx";
import { fetchPricingData } from "../lib/loaders.js";
import { useLoaderData } from "react-router-dom";

export async function loader(){
    const pricingdata = await fetchPricingData();
    return pricingdata;
}

export default function Buy() {

  const data = useLoaderData();
  return (
    <>
    <Pricing {...data} />
    </>
  );
}