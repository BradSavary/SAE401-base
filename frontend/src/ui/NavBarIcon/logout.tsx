interface LogoutIconProps {
    className?: string;
    alt?: string;
}

export function LogoutIcon({ className, alt }: LogoutIconProps) {
    return (
        <img src='../../../public/logout.svg' alt={alt} className={className} />
    );
};