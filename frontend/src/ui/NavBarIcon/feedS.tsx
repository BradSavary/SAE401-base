interface FeedSIconProps {
    className?: string;
    alt?: string;
}

export function FeedSIcon({ className, alt }: FeedSIconProps) {
    return (
        <img src="../../../public/feedS.svg" alt={alt} className={className} />
    );
};