interface Props extends React.ComponentProps<'div'> {}

export const Home = ({ ...rest }: Props) => {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(count + 1);
  };
  return (
    <div
      className="grid min-h-screen place-items-center bg-gray-900 text-white "
      {...rest}
    >
      <h1 className="text-center text-4xl font-bold" onClick={handleIncrement}>
        React TypeScript TailwindCSS Templates with Vite = {count}
      </h1>
      <p className="text-center text-2xl">
        Md Kawsar Islam Yeasin (@yeasin2002)
      </p>
    </div>
  );
};
