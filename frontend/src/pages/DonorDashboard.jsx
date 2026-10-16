import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { donationsApi, allocationsApi, impactApi, authApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { 
  Utensils, 
  PlusCircle, 
  ListOrdered, 
  Truck, 
  Trash2, 
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  Leaf, 
  MapPin,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Calendar
} from 'lucide-react';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const [donations, setDonations] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Local datetime string helper: YYYY-MM-DDTHH:mm
  const formatDateTimeLocal = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const toBackendDateTime = (str) => {
    if (!str) return '';
    if (str.length === 16) return `${str}:00`;
    return str;
  };

  // Simplified Add donation form state
  const [foodName, setFoodName] = useState('');
  const [foodType, setFoodType] = useState('VEGETARIAN');
  const [quantity, setQuantity] = useState(50);
  const [freshHours, setFreshHours] = useState(6);
  const [preparationTime, setPreparationTime] = useState(() => formatDateTimeLocal(new Date()));
  const [consumeBefore, setConsumeBefore] = useState(() => formatDateTimeLocal(new Date(Date.now() + 6 * 3600000)));
  const [pickupAddress, setPickupAddress] = useState(user?.address || 'Erode');
  const [submittingDonation, setSubmittingDonation] = useState(false);

  // Minimum safe expiry for browser picker: at least 4 hours from right now
  const minExpiryString = formatDateTimeLocal(new Date(Date.now() + 4 * 3600000));

  // Food is expiring too soon if less than 3 hours 45 mins (225 mins) from now or from prep time
  const isExpiringSoon = (() => {
    if (!consumeBefore) return true;
    const expMs = new Date(consumeBefore).getTime();
    const nowMs = Date.now();
    const prepMs = preparationTime ? new Date(preparationTime).getTime() : nowMs;

    // Expiry must be after preparation
    if (expMs <= prepMs) return true;

    // Less than 225 minutes (~3.75 hours) from now
    const minutesFromNow = (expMs - nowMs) / 60000;
    if (minutesFromNow < 225) return true;

    // Less than 225 minutes from preparation
    const minutesFromPrep = (expMs - prepMs) / 60000;
    if (minutesFromPrep < 225) return true;

    return false;
  })();

  // Log waste modal
  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  const [wasteDonationId, setWasteDonationId] = useState(null);
  const [wasteQty, setWasteQty] = useState(10);
  const [wasteReason, setWasteReason] = useState('EXPIRED_WITHOUT_ALLOCATION');
  const [disposalMethod, setDisposalMethod] = useState('COMPOSTING');
  const [wasteNotes, setWasteNotes] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // When donor navigates to the Add Donation form, ensure fresh timestamps
  useEffect(() => {
    if (activeTab === 'ADD_DONATION') {
      const now = new Date();
      setPreparationTime(formatDateTimeLocal(now));
      setConsumeBefore(formatDateTimeLocal(new Date(now.getTime() + 6 * 3600000)));
      setFreshHours(6);
    }
  }, [activeTab]);

  const calculateDeadline = (hours) => {
    setFreshHours(hours);
    const now = Date.now();
    const baseMs = preparationTime ? new Date(preparationTime).getTime() : now;
    // Add 10-minute padding for 4 hours preset so user has time to fill the form without falling below 4 hours
    const actualHours = hours === 4 ? 4.17 : hours;
    const targetMs = Math.max(now + actualHours * 3600000, baseMs + actualHours * 3600000);
    setConsumeBefore(formatDateTimeLocal(new Date(targetMs)));
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [donationsRes, allocRes, wasteRes] = await Promise.allSettled([
        donationsApi.getMy(),
        allocationsApi.getDonorAllocations(),
        impactApi.getMyWaste(),
      ]);

      if (donationsRes.status === 'fulfilled') setDonations(donationsRes.value);
      if (allocRes.status === 'fulfilled') setAllocations(allocRes.value);
      if (wasteRes.status === 'fulfilled') setWasteRecords(wasteRes.value);
    } catch {
      // offline handling
    } finally {
      setLoading(false);
    }
  };

  const addToast = (type, message) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCreateDonation = async (e) => {
    e.preventDefault();
    if (!foodName.trim()) {
      addToast('error', 'Please enter the food name to list');
      return;
    }

    if (isExpiringSoon) {
      addToast('error', 'The food is likely to expire soon so it cannot be donated');
      return;
    }

    try {
      setSubmittingDonation(true);

      const prepTime = preparationTime || formatDateTimeLocal(new Date());
      const expTime = consumeBefore || formatDateTimeLocal(new Date(Date.now() + 6 * 3600000));

      // Clean, automatic backend payload with zero unnecessary questions
      await donationsApi.create({
        foodName: foodName.trim(),
        foodCategory: 'RICE_AND_MEALS',
        foodType,
        stateType: 'COOKED',
        totalQuantity: Number(quantity) || 50,
        quantityUnit: 'PORTIONS',
        preparationTime: toBackendDateTime(prepTime),
        consumeBefore: toBackendDateTime(expTime),
        storageRequirements: 'ROOM_TEMPERATURE',
        allergenInformation: '', // No annoying allergen questions!
        pickupAddress: pickupAddress.trim() || user?.address || 'Erode',
      });

      addToast('success', `Food donation '${foodName}' listed successfully!`);
      // Reset form
      setFoodName('');
      const now = new Date();
      setPreparationTime(formatDateTimeLocal(now));
      setConsumeBefore(formatDateTimeLocal(new Date(now.getTime() + 6 * 3600000)));
      setFreshHours(6);
      setActiveTab('MY_DONATIONS');
      loadDashboardData();
    } catch (err) {
      addToast('error', err.message || 'Failed to list food donation');
    } finally {
      setSubmittingDonation(false);
    }
  };

  const handleCancelDonation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await donationsApi.cancel(id);
      addToast('info', 'Donation has been cancelled');
      loadDashboardData();
    } catch (err) {
      addToast('error', err.message || 'Failed to cancel donation');
    }
  };

  const handleLogWasteSubmit = async (e) => {
    e.preventDefault();
    if (!wasteDonationId) return;
    try {
      await impactApi.logWaste({
        donationId: wasteDonationId,
        quantity: wasteQty,
        quantityUnit: 'PORTIONS',
        wasteReason,
        disposalMethod,
        notes: wasteNotes,
      });
      addToast('success', 'Food waste record safely documented');
      setWasteModalOpen(false);
      loadDashboardData();
    } catch (err) {
      addToast('error', err.message || 'Failed to record waste');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      addToast('success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addToast('error', err.message || 'Could not update password');
    }
  };

  // Live Statistics
  const totalDonated = donations.reduce((acc, d) => acc + Number(d.totalQuantity || 0), 0);
  const totalRemaining = donations
    .filter((d) => d.status === 'AVAILABLE' || d.status === 'PARTIALLY_ALLOCATED')
    .reduce((acc, d) => acc + Number(d.remainingQuantity || 0), 0);
  const totalAllocated = donations.reduce((acc, d) => acc + Number(d.allocatedQuantity || 0), 0);
  const totalWasted = wasteRecords.reduce((acc, w) => acc + Number(w.quantity || 0), 0);
  const wastePrevented = totalAllocated - totalWasted > 0 ? totalAllocated - totalWasted : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-lightBorder shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primaryGreen">Donor Portal</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
            {user?.profileDetails?.organizationName || user?.fullName}
          </h1>
          <p className="text-xs text-mutedText mt-0.5">
            {user?.address}, {user?.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl border border-lightBorder text-mutedText hover:text-forest hover:bg-cream transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('ADD_DONATION')}
            className="px-4 py-2.5 rounded-xl bg-forest hover:bg-primaryGreen text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-orangeAccent" />
            <span>Donate Food Now</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-lightBorder text-xs font-semibold">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: Utensils },
          { key: 'ADD_DONATION', label: 'Quick Donate Food', icon: PlusCircle },
          { key: 'MY_DONATIONS', label: `My Food (${donations.length})`, icon: ListOrdered },
          { key: 'ALLOCATIONS', label: `Allocations (${allocations.length})`, icon: Truck },
          { key: 'WASTE', label: `Waste Records (${wasteRecords.length})`, icon: Trash2 },
          { key: 'PROFILE', label: 'Profile', icon: UserIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-forest text-white'
                  : 'text-mutedText hover:bg-cream hover:text-darkText'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Food Donated"
              value={`${totalDonated} Portions`}
              subtitle="All registered listings"
              icon={Utensils}
            />
            <StatCard
              title="Available for Claim"
              value={`${totalRemaining} Portions`}
              subtitle="Active unallocated balance"
              icon={Clock}
              iconBgColor="bg-emerald-50"
              iconColor="text-primaryGreen"
            />
            <StatCard
              title="Portions Claimed"
              value={`${totalAllocated} Portions`}
              subtitle="Received by orphanages/shelters"
              icon={CheckCircle2}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-700"
            />
            <StatCard
              title="Waste Prevented"
              value={`${wastePrevented} Portions`}
              subtitle="Directly fed to people"
              icon={Leaf}
              iconBgColor="bg-softGreen-light"
              iconColor="text-forest"
            />
          </div>

          {/* Quick Action Banner */}
          <div className="card-warm p-6 bg-gradient-to-r from-softGreen/30 to-cream border border-forest/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primaryGreen">
                <Sparkles className="w-4 h-4 text-orangeAccent" />
                <span>Zero Waste Mission</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-forest">Have extra food right now?</h3>
              <p className="text-xs text-mutedText max-w-xl">
                List it in 15 seconds. Nearby orphanages and shelters in Erode will be notified immediately to claim and collect it.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ADD_DONATION')}
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-primaryGreen text-white text-xs font-bold transition-all shadow-sm shrink-0"
            >
              List Surplus Food →
            </button>
          </div>

          {/* Recent Donations Table */}
          <div className="card-warm p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-lightBorder">
              <h3 className="font-serif text-lg font-bold text-forest">Recent Food Listings</h3>
              <button
                onClick={() => setActiveTab('MY_DONATIONS')}
                className="text-xs text-primaryGreen hover:underline font-semibold"
              >
                View all →
              </button>
            </div>

            {donations.length === 0 ? (
              <p className="text-xs text-mutedText py-4 text-center">No donations created yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100 text-mutedText uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Food Item</th>
                      <th className="py-2.5 px-3">Total Quantity</th>
                      <th className="py-2.5 px-3">Remaining</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lightBorder">
                    {donations.slice(0, 5).map((d) => (
                      <tr key={d.id} className="hover:bg-cream-50">
                        <td className="py-3 px-3 font-semibold text-darkText">{d.foodName}</td>
                        <td className="py-3 px-3">{d.totalQuantity} {d.quantityUnit}</td>
                        <td className="py-3 px-3 font-bold text-forest">{d.remainingQuantity}</td>
                        <td className="py-3 px-3">
                          <StatusBadge status={d.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SIMPLE, FAST DONATION FORM */}
      {activeTab === 'ADD_DONATION' && (
        <div className="max-w-2xl mx-auto card-warm p-8 space-y-6">
          <div className="border-b border-lightBorder pb-4">
            <h2 className="font-serif text-2xl font-bold text-forest">List Surplus Food</h2>
            <p className="text-xs text-mutedText mt-1">
              Simple 3-step listing. No unnecessary questions or complicated forms.
            </p>
          </div>

          <form onSubmit={handleCreateDonation} className="space-y-6 text-xs">
            {/* Step 1: Food Name */}
            <div>
              <label className="font-bold uppercase tracking-wider text-darkText block mb-1.5 text-xs">
                1. What food are you donating? *
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Vegetable Biryani, Curd Rice, Idlis, Chapatis & Dal"
                className="w-full px-4 py-3 rounded-xl border border-lightBorder bg-cream-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Step 2: Veg / Non-Veg Toggle & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold uppercase tracking-wider text-darkText block mb-1.5 text-xs">
                  2. Dietary Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFoodType('VEGETARIAN')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      foodType === 'VEGETARIAN'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-sm'
                        : 'bg-white border-lightBorder text-mutedText hover:bg-cream-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>Vegetarian</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoodType('NON_VEGETARIAN')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      foodType === 'NON_VEGETARIAN'
                        ? 'bg-red-50 border-red-600 text-red-800 shadow-sm'
                        : 'bg-white border-lightBorder text-mutedText hover:bg-cream-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span>Non-Veg</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-darkText block mb-1.5 text-xs">
                  3. Quantity (Portions / Meals) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <div className="flex gap-1.5 mt-2">
                  {[20, 50, 100, 200].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className="px-2 py-0.5 rounded bg-cream-200 text-darkText text-[11px] font-semibold hover:bg-softGreen"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 4: Food Prepared Date and Time */}
            <div>
              <label className="font-bold uppercase tracking-wider text-darkText block mb-1.5 text-xs flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-forest" />
                <span>4. Food Prepared Date & Time *</span>
              </label>
              <input
                type="datetime-local"
                required
                max={formatDateTimeLocal(new Date())}
                value={preparationTime}
                onChange={(e) => {
                  const newPrep = e.target.value;
                  setPreparationTime(newPrep);
                  // Automatically adjust expiry if it falls below 4 hours from new prep time
                  const prepMs = new Date(newPrep).getTime();
                  if (new Date(consumeBefore).getTime() < prepMs + 4 * 3600000) {
                    setConsumeBefore(formatDateTimeLocal(new Date(prepMs + 4 * 3600000)));
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest text-darkText"
              />
              <p className="text-[11px] text-mutedText mt-1">
                Enter when this food was cooked or prepared (cannot be in the future).
              </p>
            </div>

            {/* Step 5: Food Expiry Date and Time */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold uppercase tracking-wider text-darkText block text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-forest" />
                  <span>5. Food Expiry Date & Time *</span>
                </label>
                <span className="text-[10px] font-bold text-forest bg-softGreen/40 px-2 py-0.5 rounded-md border border-forest/20">
                  Minimum 4 Hours Required
                </span>
              </div>

              {/* Quick Preset Chips - All strictly 4 hours or more */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[
                  { label: '4 Hours (Min)', hours: 4 },
                  { label: '6 Hours (Rec)', hours: 6 },
                  { label: '12 Hours', hours: 12 },
                  { label: '24 Hours', hours: 24 },
                ].map((item) => (
                  <button
                    key={item.hours}
                    type="button"
                    onClick={() => calculateDeadline(item.hours)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold text-center transition-all ${
                      freshHours === item.hours
                        ? 'bg-forest text-white border-forest shadow-sm'
                        : 'bg-white border-lightBorder text-darkText hover:bg-cream-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <input
                type="datetime-local"
                required
                min={minExpiryString}
                value={consumeBefore}
                onChange={(e) => {
                  setConsumeBefore(e.target.value);
                  setFreshHours(0);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 transition-all ${
                  isExpiringSoon
                    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-red-400'
                    : 'border-lightBorder bg-cream-50 text-darkText focus:ring-forest'
                }`}
              />

              {/* Warning message if expiry time is less than 4 hours */}
              {isExpiringSoon && (
                <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-medium flex items-start gap-2.5 shadow-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-700">
                      The food is likely to expire soon so it cannot be donated
                    </p>
                    <p className="text-[11px] text-red-600 mt-0.5 font-normal">
                      Food must have at least 4 hours remaining to guarantee volunteers sufficient time to safely collect and distribute it before it spoils.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Step 6: Pickup Address */}
            <div>
              <label className="font-bold uppercase tracking-wider text-darkText block mb-1.5 text-xs">
                6. Pickup Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. 45 Brough Road, Erode"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isExpiringSoon || submittingDonation || !foodName.trim()}
              className="w-full py-3.5 rounded-xl bg-forest hover:bg-primaryGreen text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-orangeAccent" />
              <span>
                {isExpiringSoon
                  ? 'Cannot Donate (Expiry < 4 Hours)'
                  : !foodName.trim()
                  ? 'Enter Food Name to Donate'
                  : submittingDonation
                  ? 'Listing Food...'
                  : 'Submit Food Donation Now'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MY DONATIONS */}
      {activeTab === 'MY_DONATIONS' && (
        <div className="card-warm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-lightBorder">
            <h2 className="font-serif text-xl font-bold text-forest">My Food Donations</h2>
            <span className="text-xs text-mutedText">{donations.length} records</span>
          </div>

          {donations.length === 0 ? (
            <div className="text-center py-10 text-mutedText">
              <Utensils className="w-10 h-10 mx-auto text-forest/20 mb-2" />
              <p>You have not listed any donations yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-lightBorder rounded-xl overflow-hidden">
                <thead className="bg-cream-100 text-mutedText uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Food Item</th>
                    <th className="py-2.5 px-3">Total Qty</th>
                    <th className="py-2.5 px-3">Allocated</th>
                    <th className="py-2.5 px-3">Remaining</th>
                    <th className="py-2.5 px-3">Prepared At</th>
                    <th className="py-2.5 px-3">Consume Deadline</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-cream-50">
                      <td className="py-3 px-3 font-mono font-bold text-forest">#{d.id}</td>
                      <td className="py-3 px-3 font-bold text-darkText">{d.foodName}</td>
                      <td className="py-3 px-3 font-semibold">{d.totalQuantity} {d.quantityUnit}</td>
                      <td className="py-3 px-3 text-primaryGreen font-semibold">{d.allocatedQuantity}</td>
                      <td className="py-3 px-3 font-bold text-forest">{d.remainingQuantity}</td>
                      <td className="py-3 px-3 text-mutedText">
                        {d.preparationTime ? new Date(d.preparationTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </td>
                      <td className="py-3 px-3 text-darkText font-medium">
                        {new Date(d.consumeBefore).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {d.status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleCancelDonation(d.id)}
                            className="px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                        {(d.status === 'EXPIRED' || d.status === 'AVAILABLE') && (
                          <button
                            onClick={() => {
                              setWasteDonationId(d.id);
                              setWasteQty(Number(d.remainingQuantity));
                              setWasteModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 font-semibold"
                          >
                            Log Waste
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ALLOCATIONS */}
      {activeTab === 'ALLOCATIONS' && (
        <div className="card-warm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-lightBorder">
            <div>
              <h2 className="font-serif text-xl font-bold text-forest">Allocations & Pickups</h2>
              <p className="text-xs text-mutedText mt-0.5">
                Portion claims made by recipient shelters and orphanages.
              </p>
            </div>
          </div>

          {allocations.length === 0 ? (
            <p className="text-xs text-mutedText py-8 text-center">No claims requested on your food yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-lightBorder rounded-xl overflow-hidden">
                <thead className="bg-cream-100 text-mutedText uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Claim ID</th>
                    <th className="py-2.5 px-3">Food Item</th>
                    <th className="py-2.5 px-3">Recipient Shelter</th>
                    <th className="py-2.5 px-3">Claimed Qty</th>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder">
                  {allocations.map((a) => (
                    <tr key={a.id} className="hover:bg-cream-50">
                      <td className="py-3 px-3 font-mono font-bold text-forest">#{a.id}</td>
                      <td className="py-3 px-3 font-bold text-darkText">{a.foodName}</td>
                      <td className="py-3 px-3 font-medium text-forest">{a.recipientOrganizationName}</td>
                      <td className="py-3 px-3 font-bold text-primaryGreen">
                        {a.allocatedQuantity} {a.quantityUnit}
                      </td>
                      <td className="py-3 px-3">{a.distanceKm} km</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: WASTE RECORDS */}
      {activeTab === 'WASTE' && (
        <div className="card-warm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-lightBorder">
            <div>
              <h2 className="font-serif text-xl font-bold text-forest">Food Waste Audit Log</h2>
              <p className="text-xs text-mutedText mt-0.5">
                Records of expired food safely diverted to composting or organic recovery.
              </p>
            </div>
          </div>

          {wasteRecords.length === 0 ? (
            <div className="text-center py-10 text-mutedText space-y-2">
              <Leaf className="w-10 h-10 mx-auto text-primaryGreen/30" />
              <p className="font-serif text-base text-forest">Zero Waste Logged</p>
              <p className="text-xs">All allocated food has been claimed or is within safe consumption limits.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-lightBorder rounded-xl overflow-hidden">
                <thead className="bg-cream-100 text-mutedText uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Record ID</th>
                    <th className="py-2.5 px-3">Food Item</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Waste Reason</th>
                    <th className="py-2.5 px-3">Disposal Method</th>
                    <th className="py-2.5 px-3">Recorded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder">
                  {wasteRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-cream-50">
                      <td className="py-3 px-3 font-mono font-bold text-forest">#{w.id}</td>
                      <td className="py-3 px-3 font-bold text-darkText">{w.foodName}</td>
                      <td className="py-3 px-3 font-bold text-red-600">{w.quantity} {w.quantityUnit}</td>
                      <td className="py-3 px-3 text-mutedText">{w.wasteReason?.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-800">
                        {w.disposalMethod?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3 text-mutedText">
                        {new Date(w.recordedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-warm p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-forest border-b border-lightBorder pb-2">
              Donor Profile Details
            </h3>
            <div className="text-xs space-y-3">
              <div>
                <span className="text-mutedText block">Organization Name:</span>
                <span className="font-bold text-darkText">{user?.profileDetails?.organizationName || user?.fullName}</span>
              </div>
              <div>
                <span className="text-mutedText block">Contact Person:</span>
                <span className="font-medium text-darkText">{user?.profileDetails?.contactPerson || user?.fullName}</span>
              </div>
              <div>
                <span className="text-mutedText block">Registered Address:</span>
                <span className="font-medium text-darkText">{user?.address}, {user?.city}</span>
              </div>
            </div>
          </div>

          <div className="card-warm p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-forest border-b border-lightBorder pb-2">
              Security: Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-forest hover:bg-primaryGreen text-white font-semibold text-xs transition-all shadow-sm"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOG WASTE MODAL */}
      <Modal
        isOpen={wasteModalOpen}
        onClose={() => setWasteModalOpen(false)}
        title="Document Food Waste Record"
      >
        <form onSubmit={handleLogWasteSubmit} className="space-y-4 text-xs text-left">
          <div>
            <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
              Quantity to Log (Portions) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={wasteQty}
              onChange={(e) => setWasteQty(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
              Reason for Waste *
            </label>
            <select
              value={wasteReason}
              onChange={(e) => setWasteReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <option value="EXPIRED_WITHOUT_ALLOCATION">Expired Without Recipient Allocation</option>
              <option value="EXPIRED_BEFORE_DELIVERY">Passed Expiry Before Volunteer Arrival</option>
              <option value="DONOR_CANCELLED_SPOILED">Spoiled / Packaging Exposure</option>
            </select>
          </div>

          <div>
            <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
              Sustainable Disposal Method *
            </label>
            <select
              value={disposalMethod}
              onChange={(e) => setDisposalMethod(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <option value="COMPOSTING">Municipal / Organic Composting</option>
              <option value="BIOGAS_GENERATION">Agricultural Biogas Digester</option>
              <option value="MUNICIPAL_DISPOSAL">Standard Municipal Disposal</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setWasteModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-lightBorder font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Confirm Log Waste
            </button>
          </div>
        </form>
      </Modal>

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

    </div>
  );
};
