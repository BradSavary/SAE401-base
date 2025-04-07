interface BioProps {
    bio: string | null;
    className?: string;
}

function Bio({ bio, className }: BioProps) {
    return (
        <div className={className}>
            <p className="text-custom-gray text-sm">Bio:
            </p> 
            <p className="text-custom">{bio ? bio : "No bio available"}</p>
        </div>
    );
}

export default Bio;
