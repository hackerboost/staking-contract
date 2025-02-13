"use client";

import Profile from "./components/profile";
import Header from "./components/header";
import Main from "./components/main";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Header />
      <Main />
      <Profile />
    </main>
  );
}
