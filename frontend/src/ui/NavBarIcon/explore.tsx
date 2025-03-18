interface ExploreIconProps {
    className?: string;
    alt?: string;
}

export function ExploreIcon({ className, alt }: ExploreIconProps) {
    return (
        <img src="../../../public/explore.svg" alt={alt} className={className} />
    );
};