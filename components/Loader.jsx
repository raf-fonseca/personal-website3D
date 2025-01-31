import { Html } from "@react-three/drei";

const Loader = () => {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="ml-4 text-2xl font-bold text-blue-500">
          Loading Island...
        </div>
      </div>
    </Html>
  );
};

export default Loader;
