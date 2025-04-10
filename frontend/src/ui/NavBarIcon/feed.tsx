interface FeedIconProps {
    className?: string;
    alt?: string;
}

export function FeedIcon({ className, alt }: FeedIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/feed.svg" alt={alt} className={className} />
    );
};