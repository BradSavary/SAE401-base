import { ExploreIcon} from '../NavBarIcon/explore';
import { FeedIcon} from '../NavBarIcon/feedS';
import { WriteIcon} from '../NavBarIcon/write';
import { LikeIcon} from '../NavBarIcon/like';
import { AccountIcon} from '../NavBarIcon/account';
import {Link} from 'react-router-dom';

export function NavBar(){
    return (
        <nav className="bg-black text-custom p-4 bottom-0 w-full fixed">
            <ul className="flex justify-between ">
                <li>
                    <Link to="/" className="">
                        <FeedIcon className="h-8 w-8" alt="Feed"></FeedIcon>
                    </Link>
                </li>
                <li>
                    <Link to="/explore" className="">
                        <ExploreIcon className="h-8 w-8" alt="Explore"></ExploreIcon>
                    </Link>
                </li>
                <li>
                    <Link to="/write" className="">
                        <WriteIcon className="h-8 w-8" alt="Write"></WriteIcon>
                    </Link>
                </li>
                <li>
                    <Link to="/like" className="">
                        <LikeIcon className="h-8 w-8" alt="Like"></LikeIcon>
                    </Link>
                </li>
                <li>
                    <Link to="/account" className="">
                        <AccountIcon className="h-8 w-8" alt="Account"></AccountIcon>
                    </Link>
                </li>
            </ul>
        </nav>
    )
}