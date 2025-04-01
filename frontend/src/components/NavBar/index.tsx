import { ExploreIcon } from '../../ui/NavBarIcon/explore';
import { FeedSIcon } from '../../ui/NavBarIcon/feedS';
import { FeedIcon } from '../../ui/NavBarIcon/feed';
import { WriteIcon } from '../../ui/NavBarIcon/write';
import { LogoutIcon } from '../../ui/NavBarIcon/logout';
import { AccountIcon } from '../../ui/NavBarIcon/account';
import { AccountSIcon } from '../../ui/NavBarIcon/accountS';
import { Link, useLocation } from 'react-router-dom';
import { SkeletonIcon } from '../../ui/NavBarIcon/squeleton';
import { useState, useEffect } from 'react';
import { clearLocalStorage } from '../../lib/utils';

export function NavBar() {
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <nav className="bg-black text-custom p-4 bottom-0 w-full fixed z-50">
            <ul className="flex justify-between ">
                <li>
                    <Link to="/feed" className="">
                        {loading ? <SkeletonIcon /> : (location.pathname === '/feed' ? <FeedSIcon className="h-8 w-8" alt="Feed" /> : <FeedIcon className="h-8 w-8" alt="Feed" />)}
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
                        {loading ? <SkeletonIcon /> : (location.pathname === '/profile' ? <AccountSIcon className="h-8 w-8" alt="Account" /> : <AccountIcon className="h-8 w-8" alt="Account" />)}
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