interface LikeIconProps {
    className?: string;
    alt?: string;
}

export function LikeIcon({ className, alt }: LikeIconProps) {
    return (
        <img src='../../../public/like.svg' alt={alt} className={className} />
    );
};