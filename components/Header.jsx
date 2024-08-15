'use client';

import { TypeAnimation } from "react-type-animation";

export default function Header() {
    return (
      <header className="fixed top-0 w-full py-4 flex items-center justify-center text-white text-2xl">
        <TypeAnimation 
            sequence={[
                "mashbox",
                3000,
                "mashbox. click a button",
                3000,
                "mashbox"
            ]}
            repeat={0}
        />
      </header>
    );
  }
  