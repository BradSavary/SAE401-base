interface AccountIconProps {
    className?: string;
    alt?: string;
}

export function AccountIcon({ className, alt }: AccountIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/account.svg" alt={alt} className={className} />
    );
};