import { ExploreIcon } from '../../ui/NavBarIcon/explore';
import { FeedIcon } from '../../ui/NavBarIcon/feedS';
import { WriteIcon } from '../../ui/NavBarIcon/write';
import { LogoutIcon } from '../../ui/NavBarIcon/logout';
import { AccountIcon } from '../../ui/NavBarIcon/account';
import { Link } from 'react-router-dom';
import { SkeletonIcon } from '../../ui/NavBarIcon/squeleton';
import { useState, useEffect } from 'react';
import { clearLocalStorage } from '../../lib/utils';

export function NavBar() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
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
                    <Link to="/profile" className="">
                        {loading ? <SkeletonIcon /> : <AccountIcon className="h-8 w-8" alt="Account" />}
                    </Link>
                </li>
                <li>
                    <Link to="/login" className="">
                        {loading ? <SkeletonIcon /> : <div onClick={clearLocalStorage}><LogoutIcon className="h-8 w-8" alt="Like" /></div>}
                    </Link>
                </li>
            </ul>
        </nav>
    );
}