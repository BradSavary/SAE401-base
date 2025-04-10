interface FeedSIconProps {
    className?: string;
    alt?: string;
}

export function FeedSIcon({ className, alt }: FeedSIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/feedS.svg" alt={alt} className={className} />
    );
};