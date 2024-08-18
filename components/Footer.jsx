'use client';

import { FaGithub, FaMedium } from 'react-icons/fa';
import { TypeAnimation } from "react-type-animation";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full py-4 flex items-center justify-between text-white px-8">
      <a href="https://github.com/ColtG-py" target="_blank" rel="noopener noreferrer">
        <FaGithub size={36} />  {/* Adjusted size to 24px */}
      </a>
      <TypeAnimation 
            sequence={[
                9000,
                "100% free",
                2000,
                "100% organicly grown",
                2000,
                "100% stream friendly",
                2000,
                "" 
            ]}
            repeat={0}
        />
      <a href="https://medium.com/@coltg" target="_blank" rel="noopener noreferrer">
        <FaMedium size={36} />  {/* Adjusted size to 24px */}
      </a>
    </footer>
  );
}
