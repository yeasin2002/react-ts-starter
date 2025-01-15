interface Props extends React.ComponentProps<'div'> {}

export const Home = ({ ...rest }: Props) => {
  const [count, setCount] = useState(0); // no need to import react and react-router, auto-import will handle it

  const handleIncrement = () => {
    setCount(count + 1);
  };
  return (
    <div
      className="grid min-h-screen place-items-center bg-gray-900 text-white "
      {...rest}
    >
      <div>
        <span className="mx-3 text-2xl">Count: {count}</span>
        <Button variant={'secondary'} onClick={handleIncrement}>
          Increase
        </Button>
      </div>
      <p className="text-center text-xl">
        React-TS Starter with Vite By Md Kawsar Islam Yeasin
        <a
          href="https://github.com/yeasin2002"
          className="underline mx-2"
          target="_blank"
        >
          (yeasin2002)
        </a>
      </p>
    </div>
  );
};
