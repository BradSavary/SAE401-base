import { Link } from "react-router-dom";
import { ThreadsIcon } from "../ui/LogoIcon/threads";
import Button from "../ui/Button/Button";
import { MetaIcon } from "../ui/LogoIcon/Meta";
import Card from "../ui/Card/Card";

export function Welcome() {
    return (
        <div className="flex flex-col items-center justify-between h-screen bg-custom p-4 py-32">
            <ThreadsIcon size="xlarge" alt="Threads-logo"/>
            
            <Card 
                variant="secondary" 
                radius="lg" 
                padding="lg"
                hover="glow"
                className="w-full max-w-lg"
            >
                <div className="flex flex-col items-center justify-center space-y-6">
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome to Threads</h1>
                    <Link to="/register" className="w-full">
                        <Button variant="secondary">Register</Button>
                    </Link>
                    <Link to="/login" className="w-full">
                        <Button variant="primary">Login</Button>
                    </Link>
                </div>
            </Card>
            
            <MetaIcon className="absolute bottom-0" size="xlarge" alt="Meta-logo"/>
        </div>
    );
}