import {Link} from 'react-router-dom';

export default function About() {
    
  
    return (
      <div className="flex flex-col space-y-5 items-center my-20">
        <h1>About this app</h1>
        <p>Base de code pour montrer comment utiliser React Router et organiser le code d'une application front basée React.</p>
        <Link to="/"><button className="bg-gray-500/50 px-3 rounded-full">Home</button></Link>
      </div>
    );
  }