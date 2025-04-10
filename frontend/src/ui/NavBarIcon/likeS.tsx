interface LikeIconProps {
    className?: string;
    alt?: string;
}

export function LikeSIcon({ className, alt }: LikeIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/likeS.svg" alt={alt} className={className} />
    );
};