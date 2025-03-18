import { Link } from "react-router-dom";
import { ThreadsIcon } from "../ui/LogoIcon/threads";
import Button from "../ui/Button/Button";
import {MetaIcon} from "../ui/LogoIcon/Meta";
import Input from "../ui/Input/Input";
import { ArrowIcon } from "../ui/Icon/arrow";

export function Login() {
    return (
        <div className="flex flex-col items-center justify-between h-screen bg-custom p-4 py-32">
        <Link to="/welcome">
        <ArrowIcon className="absolute top-0 left-0 m-4" alt="Back-arrow"/>
        </Link>  
        <Link to="/welcome">
        <ThreadsIcon size="xlarge" alt="Threads-logo"/>
        </Link>
        <div className="w-full flex flex-col justify-center space-y-4">
        <h2 className="text-custom font-bold">Log in</h2>
        <div>
        <Input variant="primary" placeholder="Email"></Input>
        </div>
        <div>
        <Input variant="primary" placeholder="Password"></Input>
        </div>
        <Button variant="secondary" className="">Log in</Button>
        <p className="text-custom-gray underline self-center">Forgotten Password ?</p>
        </div>
           <MetaIcon className="absolute bottom-0" size="xlarge" alt="Meta-logo"/>
        </div>
    );
}