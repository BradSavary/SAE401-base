interface AccountIconProps {
    className?: string;
    alt?: string;
}

export function AccountIcon({ className, alt }: AccountIconProps) {
    return (
        <img src='../../../public/account.svg' alt={alt} className={className} />
    );
};