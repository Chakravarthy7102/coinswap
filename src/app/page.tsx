"use client";

export default function Home() {
  const { ethereum } = window;

  if (!ethereum) {
    return <p>Please install Metamask on your browser to use this app.</p>;
  }

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center justify-center">
      Hello world!
    </main>
  );
}
