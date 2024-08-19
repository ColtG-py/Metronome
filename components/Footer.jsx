'use client';

import { FaGithub, FaMedium, FaOsi } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full py-4 flex justify-between text-white px-8">
      <div className="flex space-x-8"> {/* Container for the first two icons */}
        <a href="https://github.com/ColtG-py" target="_blank" rel="noopener noreferrer">
          <FaGithub size={36} /> {/* Adjusted size to 36px */}
        </a>
        <a href="https://explained.engineering" target="_blank" rel="noopener noreferrer">
          <FaOsi size={36} /> {/* Adjusted size to 36px */}
        </a>
      </div>
      <a href="https://medium.com/@coltg" target="_blank" rel="noopener noreferrer" className="ml-auto"> {/* This one is pushed to the right */}
        <FaMedium size={36} /> {/* Adjusted size to 36px */}
      </a>
    </footer>
  );
}
