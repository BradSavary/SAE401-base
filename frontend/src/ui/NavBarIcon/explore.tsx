interface ExploreIconProps {
    className?: string;
    alt?: string;
}

export function ExploreIcon({ className, alt }: ExploreIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/explore.svg" alt={alt} className={className} />
    );
};