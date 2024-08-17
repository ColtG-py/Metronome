'use client';

import { TypeAnimation } from "react-type-animation";

export default function Header() {
    return (
      <header className="fixed top-0 w-full py-4 flex items-center justify-center text-white text-2xl">
        <TypeAnimation 
            sequence={[
                "metronome",
                3000,
                "metronome. click a button",
                3000,
                "metronome"
            ]}
            repeat={0}
        />
      </header>
    );
  }
  