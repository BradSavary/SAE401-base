interface LikeIconProps {
    className?: string;
    alt?: string;
}

export function LikeIcon({ className, alt }: LikeIconProps) {
    return (
        <img src='../../../public/likeS.svg' alt={alt} className={className} />
    );
};