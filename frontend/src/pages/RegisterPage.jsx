import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HeartHandshake, 
  Utensils, 
  Truck, 
  UserPlus, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Lock, 
  Mail, 
  User as UserIcon,
  Building2
} from 'lucide-react';

export const RegisterPage = () => {
  const { register, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedRole, setSelectedRole] = useState('DONOR');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'DONOR' || roleParam === 'RECIPIENT' || roleParam === 'VEHICLE_VOLUNTEER') {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Essential User Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [orgName, setOrgName] = useState('');
  const [vehicleType, setVehicleType] = useState('MOTORCYCLE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Clean payload with sensible backend defaults - no frustrating questions for the user!
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim(),
        role: selectedRole,
        address: address.trim() || 'Central Road, Erode',
        city: 'Erode',
        state: 'Tamil Nadu',
        pincode: '638001',
        organizationName: orgName.trim() || fullName.trim(),
      };

      if (selectedRole === 'DONOR') {
        payload.organizationType = 'RESTAURANT';
        payload.fssaiLicense = 'EXEMPT-DEMO';
        payload.pickupInstructions = 'Direct pickup from front counter';
      } else if (selectedRole === 'RECIPIENT') {
        payload.organizationType = 'SHELTER';
        payload.beneficiaryCount = 50;
        payload.dietaryPreferences = 'ANY';
        payload.allergenRestrictions = 'None';
        payload.deliveryInstructions = 'Main entrance gate';
      } else if (selectedRole === 'VEHICLE_VOLUNTEER') {
        payload.vehicleType = vehicleType;
        payload.registrationNumber = `TN33-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.capacityValue = 40;
        payload.capacityUnit = 'PORTIONS';
        payload.serviceRadiusKm = 15;
      }

      const user = await register(payload);
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-left">
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center mx-auto shadow-md">
          <UserPlus className="w-6 h-6 text-orangeAccent" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-forest">Quick Registration</h1>
        <p className="text-sm text-mutedText max-w-md mx-auto">
          Get started in seconds. We keep things simple with zero unnecessary questions.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          type="button"
          onClick={() => setSelectedRole('DONOR')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRole === 'DONOR'
              ? 'bg-softGreen/40 border-forest text-forest shadow-sm'
              : 'bg-white border-lightBorder text-mutedText hover:border-gray-300'
          }`}
        >
          <Utensils className={`w-5 h-5 mb-2 ${selectedRole === 'DONOR' ? 'text-primaryGreen' : 'text-gray-400'}`} />
          <h4 className="font-serif font-bold text-sm">Food Donor</h4>
          <p className="text-[11px] mt-0.5 leading-snug">Hotels, caterers & messes</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('RECIPIENT')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRole === 'RECIPIENT'
              ? 'bg-softGreen/40 border-forest text-forest shadow-sm'
              : 'bg-white border-lightBorder text-mutedText hover:border-gray-300'
          }`}
        >
          <HeartHandshake className={`w-5 h-5 mb-2 ${selectedRole === 'RECIPIENT' ? 'text-orangeAccent' : 'text-gray-400'}`} />
          <h4 className="font-serif font-bold text-sm">Recipient</h4>
          <p className="text-[11px] mt-0.5 leading-snug">Shelters & orphanages</p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('VEHICLE_VOLUNTEER')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedRole === 'VEHICLE_VOLUNTEER'
              ? 'bg-softGreen/40 border-forest text-forest shadow-sm'
              : 'bg-white border-lightBorder text-mutedText hover:border-gray-300'
          }`}
        >
          <Truck className={`w-5 h-5 mb-2 ${selectedRole === 'VEHICLE_VOLUNTEER' ? 'text-primaryGreen' : 'text-gray-400'}`} />
          <h4 className="font-serif font-bold text-sm">Volunteer</h4>
          <p className="text-[11px] mt-0.5 leading-snug">Community delivery driver</p>
        </button>
      </div>

      {/* Main Registration Form */}
      <div className="card-warm p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="font-semibold uppercase tracking-wider text-mutedText text-xs block mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="font-semibold uppercase tracking-wider text-mutedText text-xs block mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="font-semibold uppercase tracking-wider text-mutedText text-xs block mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="font-semibold uppercase tracking-wider text-mutedText text-xs block mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>
          </div>

          {/* Role specific simple detail */}
          {selectedRole === 'DONOR' && (
            <div>
              <label className="font-semibold uppercase tracking-wider text-mutedText text-xs block mb-1.5">
                Hotel, Restaurant or Kitchen Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Annapoorna Restaurant"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>
          )}

          {selectedRole === 'RECIPIENT' && (
            <div>
              <label className="font-semibold uppercase tracking-wider text-mutedText text-xs block mb-1.5">
                Shelter, Orphanage or Care Home Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Karunai Illam Children Home"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>
          )}

          {selectedRole === 'VEHICLE_VOLUNTEER' && (
            <div>
              <label className="font-semibold uppercase tracking-wider text-mutedText text-xs block mb-1.5">
                Select Your Vehicle Type *
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                <option value="AUTO_RICKSHAW">Auto Rickshaw</option>
                <option value="CAR">Car / Hatchback</option>
                <option value="VAN">Van</option>
                <option value="BICYCLE">Bicycle</option>
              </select>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="font-semibold uppercase tracking-wider text-mutedText text-xs block mb-1.5">
              Pickup / Delivery Address *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 45 Brough Road, Erode"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
            <p className="text-[11px] text-mutedText mt-1">
              Serving Erode, Perundurai, Bhavani, Chithode, and nearby areas.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-forest hover:bg-primaryGreen text-white font-semibold text-sm transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Your Account...' : 'Complete Simple Registration'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-lightBorder text-center text-xs text-mutedText">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primaryGreen hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
