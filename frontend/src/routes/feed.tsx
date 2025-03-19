import { Post } from '../components/Post/Post';

export function Feed(){
    return (
        <div className="flex flex-col items-center h-screen overflow-scroll pb-16">
           <Post username="john_doe" content="Just had a great day at the park!" date="2023-10-01" />
           <Post username="jane_smith" content="Loving the new React features!" date="2023-10-02" />
           <Post username="tech_guru" content="Check out my latest blog post on TypeScript." date="2023-10-03" />
           <Post username="nature_lover" content="Captured this beautiful sunset today." date="2023-10-04" />
           <Post username="foodie123" content="Tried a new recipe for dinner, it was delicious!" date="2023-10-05" />
           <Post username="traveler" content="Exploring the mountains this weekend." date="2023-10-06" />
           <Post username="fitness_fan" content="Completed a 10k run this morning!" date="2023-10-07" />
           <Post username="movie_buff" content="Watched an amazing movie last night." date="2023-10-08" />
           <Post username="bookworm" content="Finished reading a fantastic book." date="2023-10-09" />
           <Post username="music_lover" content="Listening to some great tunes today." date="2023-10-10" />
           <Post username="gamer" content="Reached a new high score in my favorite game." date="2023-10-11" />
           <Post username="artist" content="Created a new painting, feeling inspired!" date="2023-10-12" />
           <Post username="photographer" content="Took some amazing photos at the beach." date="2023-10-13" />
           <Post username="chef" content="Baked a delicious cake for a friend's birthday." date="2023-10-14" />
           <Post username="yogi" content="Had a relaxing yoga session this morning." date="2023-10-15" />
        </div>
    )
}