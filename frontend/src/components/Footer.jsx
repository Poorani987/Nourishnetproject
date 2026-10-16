import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, MapPin, Truck, Leaf } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-forest text-cream-50 pt-16 pb-12 border-t border-forest-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primaryGreen flex items-center justify-center text-white shadow-sm">
                <HeartHandshake className="w-5 h-5 text-orangeAccent" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                NourishNet
              </span>
            </div>
            <p className="text-cream-200/80 text-sm leading-relaxed">
              Smart Food Redistribution & Waste Management System connecting donors, community shelters, and volunteer vehicle drivers.
            </p>
            <div className="flex items-center gap-2 text-xs text-softGreen">
              <Leaf className="w-4 h-4 text-primaryGreen-light" />
              <span>Targeting Zero Edible Food Waste</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm text-cream-200/70">
              <li>
                <Link to="/available-food" className="hover:text-white transition-colors">
                  Available Food Marketplace
                </Link>
              </li>
              <li>
                <Link to="/route-map" className="hover:text-white transition-colors">
                  Dijkstra Route Network Map
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Become a Volunteer Driver
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy & Rules */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Core Policies</h4>
            <ul className="space-y-2.5 text-sm text-cream-200/70">
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-orangeAccent shrink-0 mt-0.5" />
                <span><strong>15 km Transport Rule:</strong> Under 15km donor coordinates; over 15km recipient arranges.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primaryGreen-light shrink-0 mt-0.5" />
                <span><strong>OTP Verification:</strong> Handover requires short-lived random token.</span>
              </li>
              <li className="flex items-start gap-2">
                <HeartHandshake className="w-4 h-4 text-softGreen shrink-0 mt-0.5" />
                <span><strong>Unpaid Volunteers:</strong> Voluntary vehicle participation without driver marketplace.</span>
              </li>
            </ul>
          </div>

          {/* Geographic Region */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Pilot Geographic Scope</h4>
            <div className="flex items-start gap-2 text-sm text-cream-200/70">
              <MapPin className="w-4 h-4 text-orangeAccent shrink-0 mt-0.5" />
              <span>
                Demonstration road graph covering:
                <br /><strong>Erode</strong>, <strong>Perundurai</strong>, <strong>Bhavani</strong>, <strong>Chithode</strong>, and <strong>Gobichettipalayam</strong>.
              </span>
            </div>
            <p className="text-xs text-cream-200/50 mt-4 leading-relaxed">
              Academic BE CSE Capstone Evaluation Project. MySQL Relational Schema with Spring Boot REST API.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-cream-200/50 gap-4">
          <p>© {new Date().getFullYear()} NourishNet System. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed for Academic Evaluation & Sustainable Impact
          </p>
        </div>
      </div>
    </footer>
  );
};
