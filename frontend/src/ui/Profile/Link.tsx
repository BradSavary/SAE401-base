interface SiteProps {
    site: string | null;
    className?: string;
}

function Site({ site, className }: SiteProps) {
    return (
        <div className={`flex gap-1 ${className}`}>
            <p>{site ? site : "No site available"}</p> 
            <img src="../../../../public/siteicon.svg" alt="" />
        </div>
    );
}

export default Site;
