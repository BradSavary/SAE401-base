interface FeedIconProps {
    className?: string;
    alt?: string;
}

export function FeedIcon({ className, alt }: FeedIconProps) {
    return (
        <img src="../../../public/feed.svg" alt={alt} className={className} />
    );
};