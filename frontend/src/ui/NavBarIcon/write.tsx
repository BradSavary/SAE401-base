interface WriteIconProps {
    className?: string;
    alt?: string;
}

export function WriteIcon({ className, alt }: WriteIconProps) {
    return (
        <img src='../../../public/write.svg' alt={alt} className={className} />
    );
};