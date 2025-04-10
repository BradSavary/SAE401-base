interface WriteIconProps {
    className?: string;
    alt?: string;
}

export function WriteIcon({ className, alt }: WriteIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/write.svg" alt={alt} className={className} />
    );
};