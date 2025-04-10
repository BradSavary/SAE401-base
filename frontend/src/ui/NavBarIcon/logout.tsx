interface LogoutIconProps {
    className?: string;
    alt?: string;
}

export function LogoutIcon({ className, alt }: LogoutIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/logout.svg" alt={alt} className={className} />
    );
};