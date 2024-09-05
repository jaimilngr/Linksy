import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-300 dark:bg-gray-800 py-16 px-8 md:px-16">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-12">
        <h2 className="text-4xl md:text-5xl font-bold">Work with us</h2>
        <a href="mailto:linksy.info@gmail.com" className="text-2xl underline mt-6 md:mt-0 hover:text-gray-400">linksy.info@gmail.com</a>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12 text-2xl">
        <div>
          <h3 className="font-semibold mb-4">Sitemap</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-gray-400">Services</Link></li>
            <li><a href="/" className="hover:text-gray-400">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Popular</h3>
          <ul className="space-y-2">
            <li><Link to="/categories/Tech" className="hover:text-gray-400">Tech</Link></li>
            <li><Link to="/categories/Cleaning" className="hover:text-gray-400">Cleaning</Link></li>
            <li><Link to="/categories/AC Service" className="hover:text-gray-400">AC Service</Link></li>
            <li><Link to="/categories/Laptop Repair" className="hover:text-gray-400">Laptop Repair</Link></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-8">
        <div className="text-7xl font-bold">Linksy™</div>
        <div className="flex flex-col md:flex-row items-center gap-6 text-sm mt-6 md:mt-0">
          <Link to="#top" className="hover:text-gray-400">Back to top ↑</Link>
          <p>Copyright © Linksy 2024</p>
        </div>
      </div>
    </footer>
  );
};
