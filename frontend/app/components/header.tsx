import { useEffect, useState } from "react";
import Image from "next/image";
import { ConnectBtn } from "./connectButton";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <section className="w-full flex justify-between bg-emerald-950 items-center rounded-full p-2">
      <div className="flex justify-between w-[90%] mx-auto">
      <div className="flex items-center gap-3">
        <Image src="/hack2.png" width={50} height={50} alt="Hack" />
        <h1 className="text-md"> Hackerboost Staking</h1>
      </div>

      <div className="flex items-center ">
          <div>
           <ConnectBtn 
           setIsLoggedIn={setIsLoggedIn}
           />
          </div>
      </div>
      </div>
    </section>
  );
}
