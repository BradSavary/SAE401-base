interface AccountSIconProps {
    className?: string;
    alt?: string;
}

export function AccountSIcon({ className, alt }: AccountSIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/accountS.svg" alt={alt} className={className} />
    );
};