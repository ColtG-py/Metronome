'use client';

import { FaGithub, FaMedium, FaBullseye } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full py-4 flex justify-between text-white px-8">
        <a href="https://github.com/ColtG-py" target="_blank" rel="noopener noreferrer">
          <FaGithub size={36} />  {/* Adjusted size to 24px */}
        </a>
          <a href="https://explained.engineering" target="_blank" rel="noopener noreferrer">
          <FaBullseye size={36} />  {/* Adjusted size to 24px */}
        </a>
        <a href="https://medium.com/@coltg" target="_blank" rel="noopener noreferrer">
          <FaMedium size={36} />  {/* Adjusted size to 24px */}
        </a>
    </footer>
  );
}
