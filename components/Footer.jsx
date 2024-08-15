import { FaGithub, FaMedium } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full py-4 flex items-center justify-between text-white px-8">
      <a href="https://github.com/your-github-username" target="_blank" rel="noopener noreferrer">
        <FaGithub size={12} />  {/* Adjusted size to 24px */}
      </a>
      <a href="https://medium.com/@your-medium-username" target="_blank" rel="noopener noreferrer">
        <FaMedium size={12} />  {/* Adjusted size to 24px */}
      </a>
    </footer>
  );
}
