import { useLoaderData } from "remix";

export const loader = async () => {
  return "I came from loader!";
};

export default function Index() {
  const data = useLoaderData();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1 className="text-red-500 text-2xl">Hello hackathooon!!</h1>
      <p>{data}</p>
    </div>
  );
}
