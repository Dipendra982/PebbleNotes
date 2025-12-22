
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
           <div className="text-2xl font-bold text-blue-600 flex items-center space-x-2 mb-4">
              <span className="bg-blue-600 text-white p-1 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </span>
              <span>PebbleNote</span>
            </div>
            <p className="text-gray-500 max-w-sm">
              Empowering college students with high-quality, verified study materials. Buy trusted notes in seconds and ace your exams.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Marketplace</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-blue-600">All Notes</a></li>
              <li><a href="#" className="hover:text-blue-600">Mathematics</a></li>
              <li><a href="#" className="hover:text-blue-600">Science</a></li>
              <li><a href="#" className="hover:text-blue-600">Engineering</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-blue-600">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600">How it Works</a></li>
              <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 PebbleNote. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-600">Twitter</a>
            <a href="#" className="hover:text-gray-600">Instagram</a>
            <a href="#" className="hover:text-gray-600">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
