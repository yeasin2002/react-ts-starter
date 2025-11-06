import { Button } from "@/components";
import { Link } from "react-router";

interface Props extends React.ComponentProps<"div"> {}

const Home = ({ ...rest }: Props) => {
  const [count, setCount] = useState(0); // no need to import react and react-router, auto-import will handle it

  const handleIncrement = () => {
    setCount(count + 1);
  };
  return (
    <div className="grid min-h-screen place-items-center bg-gray-900 text-white" {...rest}>
      <div className="space-y-8 text-center">
        <div>
          <span className="mx-3 text-2xl">Count: {count}</span>
          <Button variant={"secondary"} onClick={handleIncrement}>
            Increase
          </Button>
        </div>

        <nav className="space-x-4">
          <Link to="/about" className="text-blue-400 hover:underline">
            About
          </Link>
          <Link to="/users" className="text-blue-400 hover:underline">
            Users
          </Link>
          <Link to="/users/profile" className="text-blue-400 hover:underline">
            Profile
          </Link>
          <Link to="/users/123" className="text-blue-400 hover:underline">
            User #123
          </Link>
        </nav>

        <p className="text-center text-xl">
          React-TS Starter with Vite By Md Kawsar Islam Yeasin
          <a href="https://github.com/yeasin2002" className="mx-2 underline" target="_blank">
            (yeasin2002)
          </a>
        </p>
      </div>
    </div>
  );
};

export default Home;
