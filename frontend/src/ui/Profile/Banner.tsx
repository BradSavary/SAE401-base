import React from 'react';

interface BannerProps {
    banner: string | null;
    className?: string;
}

const Banner = ({ banner, className }: BannerProps) => {
    return (
        <div className={`${className}`}>
            {banner ? <img src={banner} alt="User Banner" /> : <div className="default-banner">No Banner</div>}
        </div>
    );
};

export default Banner;