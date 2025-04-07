import { Link } from "react-router-dom";
import { ThreadsIcon } from "../ui/LogoIcon/threads";
import Button from "../ui/Button/Button";
import {MetaIcon} from "../ui/LogoIcon/Meta";

export function Welcome() {
    return (
        <div className="flex flex-col items-center justify-between h-screen bg-custom p-4 py-32">
        <ThreadsIcon size="xlarge" alt="Threads-logo"/>
        <div className="w-full max-w-lg flex flex-col items-center justify-center space-y-4">
        <Link to="/register" className="w-full">
            <Button variant="primary">Register</Button>
        </Link>
        <Link to="/login" className="w-full">
            <Button variant="primary">Login</Button>
        </Link>
        </div>
           <MetaIcon className="absolute bottom-0" size="xlarge" alt="Meta-logo"/>
        </div>
    );
}