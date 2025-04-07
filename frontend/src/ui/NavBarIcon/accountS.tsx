interface AccountSIconProps {
    className?: string;
    alt?: string;
}

export function AccountSIcon({ className, alt }: AccountSIconProps) {
    return (
        <img src='../../../public/accountS.svg' alt={alt} className={className} />
    );
};