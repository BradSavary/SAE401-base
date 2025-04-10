interface PlaceProps {
    place: string | null;
    className?: string;
}

function Place({ place, className }: PlaceProps) {
    return (
        <div className={`flex gap-1 ${className}`}>
            <p>{place ? place : "No place available"}</p> 
            <img src="/~savary23/SAE401/CycleC/dist/placeicon.svg" alt="" />
        </div>
    );
}

export default Place;
