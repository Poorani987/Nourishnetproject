import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import { 
  HeartHandshake, 
  Utensils, 
  Truck, 
  UserPlus, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Lock, 
  Mail, 
  User as UserIcon 
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<Role>('DONOR');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'DONOR' || roleParam === 'RECIPIENT' || roleParam === 'VEHICLE_VOLUNTEER') {
      setSelectedRole(roleParam as Role);
    }
  }, [searchParams]);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Erode');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('638001');

  // Donor fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('RESTAURANT');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');

  // Recipient fields
  const [beneficiaryCount, setBeneficiaryCount] = useState(50);
  const [dietaryPreferences, setDietaryPreferences] = useState('ANY');
  const [allergenRestrictions, setAllergenRestrictions] = useState('');

  // Volunteer fields
  const [vehicleType, setVehicleType] = useState('MOTORCYCLE');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [capacityValue, setCapacityValue] = useState(30);
  const [capacityUnit, setCapacityUnit] = useState('KG');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(15);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload: any = {
        fullName,
        email,
        password,
        phoneNumber,
        role: selectedRole,
        address,
        city,
        state,
        pincode,
        organizationName: orgName || fullName,
      };

      if (selectedRole === 'DONOR') {
        payload.organizationType = orgType;
        payload.fssaiLicense = fssaiLicense;
        payload.pickupInstructions = pickupInstructions;
      } else if (selectedRole === 'RECIPIENT') {
        payload.organizationType = orgType || 'SHELTER';
        payload.beneficiaryCount = beneficiaryCount;
        payload.dietaryPreferences = dietaryPreferences;
        payload.allergenRestrictions = allergenRestrictions;
      } else if (selectedRole === 'VEHICLE_VOLUNTEER') {
        payload.vehicleType = vehicleType;
        payload.registrationNumber = registrationNumber || `TN33 TEMP ${Math.floor(1000 + Math.random() * 9000)}`;
        payload.capacityValue = capacityValue;
        payload.capacityUnit = capacityUnit;
        payload.serviceRadiusKm = serviceRadiusKm;
      }

      const user = await register(payload);
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-left">
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-forest text-white flex items-center justify-center mx-auto shadow-md">
          <UserPlus className="w-6 h-6 text-orangeAccent" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-forest">Join NourishNet</h1>
        <p className="text-sm text-mutedText max-w-md mx-auto">
          Choose your role to get started with verified food donation, claiming, or volunteer transport.
        </p>
      </div>

      {/* Role Tabs (Exactly Three) */}
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
          <p className="text-[11px] mt-0.5 leading-snug">Restaurants, messes, caterers with surplus meals.</p>
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
          <p className="text-[11px] mt-0.5 leading-snug">Shelters, orphanages, and care homes in need of food.</p>
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
          <h4 className="font-serif font-bold text-sm">Volunteer Driver</h4>
          <p className="text-[11px] mt-0.5 leading-snug">Unpaid volunteers offering personal vehicles.</p>
        </button>
      </div>

      {/* Registration Form */}
      <div className="card-warm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION: Contact & Account */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-forest border-b border-lightBorder pb-2">
              1. Account Credentials & Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Full Name / Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Murugan Palanisamy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Email Address (Login) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.org"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Password (min 6 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9842100001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>
          </div>

          {/* SECTION: Address */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif text-lg font-bold text-forest border-b border-lightBorder pb-2">
              2. Facility Location (Erode Region)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-3">
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Physical Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 45 Brough Road, Near Railway Colony"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  City / Town *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="Erode">Erode</option>
                  <option value="Perundurai">Perundurai</option>
                  <option value="Bhavani">Bhavani</option>
                  <option value="Chithode">Chithode</option>
                  <option value="Gobichettipalayam">Gobichettipalayam</option>
                </select>
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="638001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>
          </div>

          {/* SECTION: Role-Specific Details */}
          <div className="space-y-4 pt-2">
            <h3 className="font-serif text-lg font-bold text-forest border-b border-lightBorder pb-2">
              3. {selectedRole === 'DONOR' ? 'Donor Organization Details' : selectedRole === 'RECIPIENT' ? 'Recipient Organization Details' : 'Vehicle & Availability'}
            </h3>

            {/* DONOR SPECIFIC */}
            {selectedRole === 'DONOR' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Organization / Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Annapoorna Bhavan Hotel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Organization Type
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="HOTEL">Hotel & Hospitality</option>
                    <option value="HOSTEL_MESS">College / Hostel Mess</option>
                    <option value="CATERING">Event Catering Service</option>
                    <option value="BAKERY">Bakery & Confectionery</option>
                    <option value="EVENT_HALL">Marriage & Banquet Hall</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    FSSAI Food License Number
                  </label>
                  <input
                    type="text"
                    value={fssaiLicense}
                    onChange={(e) => setFssaiLicense(e.target.value)}
                    placeholder="FSSAI-12420001000111"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Pickup Instructions
                  </label>
                  <input
                    type="text"
                    value={pickupInstructions}
                    onChange={(e) => setPickupInstructions(e.target.value)}
                    placeholder="Rear kitchen service gate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>
            )}

            {/* RECIPIENT SPECIFIC */}
            {selectedRole === 'RECIPIENT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Orphanage / Shelter Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Anbu Karangal Children's Home"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Beneficiary Count Served *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={beneficiaryCount}
                    onChange={(e) => setBeneficiaryCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Dietary Preference
                  </label>
                  <select
                    value={dietaryPreferences}
                    onChange={(e) => setDietaryPreferences(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    <option value="ANY">Any Edible Food</option>
                    <option value="VEGETARIAN">Vegetarian Only</option>
                    <option value="NON_VEGETARIAN">Non-Vegetarian Accepted</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Known Allergen Restrictions
                  </label>
                  <input
                    type="text"
                    value={allergenRestrictions}
                    onChange={(e) => setAllergenRestrictions(e.target.value)}
                    placeholder="e.g. Peanut free, no extreme spice"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>
            )}

            {/* VOLUNTEER SPECIFIC */}
            {selectedRole === 'VEHICLE_VOLUNTEER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Registered Vehicle Type *
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    <option value="BICYCLE">Bicycle (Light load)</option>
                    <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                    <option value="AUTO_RICKSHAW">Auto Rickshaw</option>
                    <option value="CAR">Car / Hatchback</option>
                    <option value="VAN">Van</option>
                    <option value="MINI_TRUCK">Mini Truck</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Vehicle Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. TN33 AB 1204"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Carrying Capacity ({capacityUnit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={capacityValue}
                    onChange={(e) => setCapacityValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Service Radius (km) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-forest hover:bg-primaryGreen text-white font-semibold text-sm transition-all shadow-sm hover:shadow disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : `Register as ${selectedRole.replace(/_/g, ' ')}`}
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
