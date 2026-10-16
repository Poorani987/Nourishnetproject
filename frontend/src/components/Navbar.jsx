import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api/client';
import { 
  HeartHandshake, 
  Bell, 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const countRes = await notificationsApi.getUnreadCount();
      setUnreadCount(countRes);
      const list = await notificationsApi.getAll();
      setNotifications(list.slice(0, 5));
    } catch {
      // ignore when offline
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      loadNotifications();
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Available Food', path: '/available-food' },
    { name: 'Route Map', path: '/route-map' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#FBF7EE]/95 backdrop-blur-md border-b border-lightBorder">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-forest flex items-center justify-center text-white shadow-md group-hover:bg-primaryGreen transition-colors">
              <HeartHandshake className="w-6 h-6 text-orangeAccent" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-forest block leading-tight">
                NourishNet
              </span>
              <span className="text-xs uppercase tracking-widest text-mutedText font-semibold block">
                Food Redistribution
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primaryGreen ${
                  location.pathname === link.path
                    ? 'text-primaryGreen font-semibold border-b-2 border-primaryGreen pb-1'
                    : 'text-darkText'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Actions / Profile */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2.5 rounded-full hover:bg-cream-200 text-darkText relative transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-forest" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-orangeAccent text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Popover */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-lightBorder p-4 z-50">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-lightBorder">
                        <span className="font-serif font-bold text-forest">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-primaryGreen hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto space-y-2.5">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-mutedText text-sm">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded-xl border text-sm transition-colors ${
                                !n.read ? 'bg-softGreen/30 border-softGreen' : 'bg-cream-50 border-lightBorder'
                              }`}
                            >
                              <div className="font-semibold text-darkText flex items-center justify-between">
                                <span>{n.title}</span>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-orangeAccent"></span>}
                              </div>
                              <p className="text-mutedText text-xs mt-1 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-mutedText/80 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dashboard Button */}
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 bg-softGreen text-forest px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-forest hover:text-white transition-all shadow-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>
                    {user.role === 'DONOR' ? 'Donor Dashboard' : user.role === 'RECIPIENT' ? 'Recipient Dashboard' : 'Volunteer Hub'}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-mutedText hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-forest hover:text-primaryGreen transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-forest hover:bg-primaryGreen rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-darkText hover:bg-cream-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-lightBorder px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-darkText hover:bg-cream"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-lightBorder">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 bg-forest text-white rounded-xl font-medium"
                >
                  Open Dashboard
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="block w-full text-center py-2.5 text-red-600 font-medium"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 border border-forest text-forest font-semibold rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-forest text-white font-semibold rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
