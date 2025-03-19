import { Post } from '../components/Post/Post';
import { useLoaderData } from "react-router-dom";
import { fetchFeedPosts } from "../data/post";

export async function loader(){
    const pricingdata = await fetchFeedPosts();
    return pricingdata;
}

export function Feed(){
    const data = useLoaderData();
    return (
        <div className="flex flex-col items-center h-screen overflow-scroll pb-16">
          <Post {...data} ></Post>
        </div>
    )
}