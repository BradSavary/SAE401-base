import { ExploreIcon } from '../../ui/NavBarIcon/explore';
import { FeedIcon } from '../../ui/NavBarIcon/feedS';
import { WriteIcon } from '../../ui/NavBarIcon/write';
import { LikeIcon } from '../../ui/NavBarIcon/like';
import { AccountIcon } from '../../ui/NavBarIcon/account';
import { Link } from 'react-router-dom';
import { SkeletonIcon } from '../../ui/NavBarIcon/squeleton';
import { useState, useEffect } from 'react';

export function NavBar() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <nav className="bg-black text-custom p-4 bottom-0 w-full fixed">
            <ul className="flex justify-between ">
                <li>
                    <Link to="/feed" className="">
                        {loading ? <SkeletonIcon /> : <FeedIcon className="h-8 w-8" alt="Feed" />}
                    </Link>
                </li>
                <li>
                    <Link to="/explore" className="">
                        {loading ? <SkeletonIcon /> : <ExploreIcon className="h-8 w-8" alt="Explore" />}
                    </Link>
                </li>
                <li>
                    <Link to="/write" className="">
                        {loading ? <SkeletonIcon /> : <WriteIcon className="h-8 w-8" alt="Write" />}
                    </Link>
                </li>
                <li>
                    <Link to="/like" className="">
                        {loading ? <SkeletonIcon /> : <LikeIcon className="h-8 w-8" alt="Like" />}
                    </Link>
                </li>
                <li>
                    <Link to="/account" className="">
                        {loading ? <SkeletonIcon /> : <AccountIcon className="h-8 w-8" alt="Account" />}
                    </Link>
                </li>
            </ul>
        </nav>
    );
}