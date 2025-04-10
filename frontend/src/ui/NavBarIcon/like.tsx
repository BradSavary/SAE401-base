interface LikeIconProps {
    className?: string;
    alt?: string;
}

export function LikeIcon({ className, alt }: LikeIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/like.svg" alt={alt} className={className} />
    );
};