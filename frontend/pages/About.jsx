
import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-28 pb-32 px-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full mb-8">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">About Us</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tighter">
            Built for students,<br/>
            <span className="text-slate-400">by students.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-5xl mx-auto leading-relaxed">
            PebbleNotes is a modern marketplace connecting students with high-quality, verified study materials.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Mission */}
          <div className="mb-24">
            <h2 className="text-4xl font-bold text-slate-900 mb-7 tracking-tight">Our Mission</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-600 leading-relaxed mb-5">
                We believe that quality education resources should be accessible to everyone. PebbleNotes provides a trusted platform where students can discover, share, and access verified study materials that help them succeed academically.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Our marketplace ensures that every note meets high standards of quality, accuracy, and usefulness, so you can study with confidence.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-24 grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1.5 uppercase tracking-wider">Verified Content</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                All notes are reviewed and verified to ensure accuracy and quality.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-wider">Secure Platform</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Your data and purchases are protected with industry-standard security.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-wider">Student Community</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Join a growing community of students helping each other succeed.
              </p>
            </div>
          </div>

          {/* Sample Data Section */}
          <div className="mb-24 bg-slate-50 border border-slate-200 rounded-xl p-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Demo Content</h2>
            <p className="text-lg text-slate-600 mb-7 leading-relaxed">
              This platform connects to a live PostgreSQL database. All notes and metadata you see are stored in the database and managed via the admin tools.
            </p>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <p className="text-base text-slate-500">
                <span className="font-semibold text-slate-700">Note:</span> Uploaded previews are saved locally on the server and their paths are stored in the database for easy verification in pgAdmin.
              </p>
            </div>
          </div>

          {/* Policies */}
          <div className="mb-24">
            <h2 className="text-4xl font-bold text-slate-900 mb-10 tracking-tight">Our Policies</h2>
            
            <div className="space-y-10">
              {/* Quality Standards */}
              <div className="border-l-4 border-slate-900 pl-7">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quality Standards</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-4">
                  All notes uploaded to PebbleNotes must meet our quality criteria:
                </p>
                <ul className="space-y-2.5 text-base text-slate-600">
                  <li className="flex items-start">
                    <span className="text-slate-400 mr-1.5">•</span>
                    <span>Clear, legible, and well-organized content</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>Accurate information verified against course materials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>Original work with proper citations where applicable</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span>Comprehensive coverage of the advertised topic</span>
                  </li>
                </ul>
              </div>

              {/* Privacy Policy */}
              <div className="border-l-4 border-slate-900 pl-7">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Privacy & Data</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We respect your privacy. User data is stored securely and never shared with third parties without explicit consent. Your purchase history and personal information remain confidential. We only collect data necessary to provide our services and improve user experience.
                </p>
              </div>

              {/* Fair Use */}
              <div className="border-l-4 border-slate-900 pl-7">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Fair Use & Copyright</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  All content on PebbleNotes must respect copyright and intellectual property rights. Notes should be original student work or properly licensed materials. Users are responsible for ensuring their uploads comply with fair use guidelines and academic integrity policies.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-16 border-t border-slate-200">
            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Ready to get started?</h2>
            <p className="text-lg text-slate-600 mb-10 max-w-5xl mx-auto">
              Join thousands of students who are already using PebbleNotes to ace their studies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-5">
              <Link to="/marketplace" className="bg-slate-900 text-white px-10 py-4 rounded-lg font-bold text-base hover:bg-slate-800 transition inline-block">
                Browse Marketplace
              </Link>
              <Link to="/signup" className="bg-white text-slate-600 border border-slate-200 px-10 py-4 rounded-lg font-bold text-base hover:bg-slate-50 transition inline-block">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
