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
import { ThreadsIcon } from '../../ui/LogoIcon/threads';

export function NavBar() {
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <nav className="bg-black text-custom fixed bottom-0 w-full z-20 md:h-screen md:w-auto md:left-0 md:top-0 md:flex md:flex-col md:justify-between">
            {/* Logo visible uniquement sur desktop/tablette */}
            <div className="hidden md:flex md:justify-center md:p-4">
                <ThreadsIcon size="large" alt="Threads" />
            </div>
            
            {/* Navigation icons */}
            <ul className="flex justify-between p-4 md:flex-col md:flex-grow md:gap-8 md:justify-start md:items-center md:mt-8">
                <li className="md:mb-4">
                    <Link to="/feed" className="flex items-center">
                        {loading ? 
                            <SkeletonIcon /> : 
                            (location.pathname === '/feed' ? 
                                <FeedSIcon className="h-8 w-8" alt="Feed" /> : 
                                <FeedIcon className="h-8 w-8" alt="Feed" />)
                        }
                        <span className="hidden md:inline ml-2 text-custom">Feed</span>
                    </Link>
                </li>
                <li className="md:mb-4">
                    <Link to="/explore" className="flex items-center">
                        {loading ? 
                            <SkeletonIcon /> : 
                            <ExploreIcon className="h-8 w-8" alt="Explore" />
                        }
                        <span className="hidden md:inline ml-2 text-custom">Explore</span>
                    </Link>
                </li>
                <li className="md:mb-4">
                    <Link to="/write" className="flex items-center">
                        {loading ? 
                            <SkeletonIcon /> : 
                            <WriteIcon className="h-8 w-8" alt="Write" />
                        }
                        <span className="hidden md:inline ml-2 text-custom">Write</span>
                    </Link>
                </li>
                <li className="md:mb-4">
                    <Link to="/profile" className="flex items-center">
                        {loading ? 
                            <SkeletonIcon /> : 
                            (location.pathname === '/profile' ? 
                                <AccountSIcon className="h-8 w-8" alt="Account" /> : 
                                <AccountIcon className="h-8 w-8" alt="Account" />)
                        }
                        <span className="hidden md:inline ml-2 text-custom">Profile</span>
                    </Link>
                </li>
                <li className="md:mt-auto">
                    <Link to="/login" className="flex items-center">
                        {loading ? 
                            <SkeletonIcon /> : 
                            <div onClick={clearLocalStorage} className="flex items-center">
                                <LogoutIcon className="h-8 w-8" alt="Logout" />
                                <span className="hidden md:inline ml-2 text-custom">Logout</span>
                            </div>
                        }
                    </Link>
                </li>
            </ul>
        </nav>
    );
}