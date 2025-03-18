import { ExploreIcon} from '../NavBarIcon/explore';
import { FeedIcon} from '../NavBarIcon/feedS';
import { WriteIcon} from '../NavBarIcon/write';
import { LikeIcon} from '../NavBarIcon/like';
import { AccountIcon} from '../NavBarIcon/account';

export function NavBar(){
    return (
        <nav className="bg-black text-custom p-4 absolute bottom-0 w-full">
            <ul className="flex justify-between ">
                <li>
                    <a href="#" className="">
                        <FeedIcon className="h-8 w-8" alt="Feed"></FeedIcon>
                    </a>
                </li>
                <li>
                    <a href="#" className="">
                        <ExploreIcon className="h-8 w-8" alt="Explore"></ExploreIcon>
                    </a>
                </li>
                <li>
                    <a href="#" className="">
                        <WriteIcon className="h-8 w-8" alt="Write"></WriteIcon>
                    </a>
                </li>
                <li>
                    <a href="#" className="">
                        <LikeIcon className="h-8 w-8" alt="Like"></LikeIcon>
                    </a>
                </li>
                <li>
                    <a href="#" className="">
                        <AccountIcon className="h-8 w-8" alt="Account"></AccountIcon>
                    </a>
                </li>
            </ul>
        </nav>
    )
}