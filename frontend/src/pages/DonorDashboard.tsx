import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { donationsApi, allocationsApi, impactApi, authApi } from '../api/client';
import { FoodDonation, FoodAllocation, WasteRecord, FoodType, StateType } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';
import { 
  Utensils, 
  PlusCircle, 
  ListOrdered, 
  Truck, 
  Trash2, 
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Leaf, 
  Lock,
  Building2,
  Calendar,
  Thermometer,
  MapPin,
  RefreshCw
} from 'lucide-react';

export const DonorDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ADD_DONATION' | 'MY_DONATIONS' | 'ALLOCATIONS' | 'WASTE' | 'PROFILE'>('OVERVIEW');

  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [allocations, setAllocations] = useState<FoodAllocation[]>([]);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Add donation form state
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState('RICE_AND_MEALS');
  const [foodType, setFoodType] = useState<FoodType>('VEGETARIAN');
  const [stateType, setStateType] = useState<StateType>('COOKED');
  const [quantity, setQuantity] = useState<number>(50);
  const [quantityUnit, setQuantityUnit] = useState('PORTIONS');
  const [preparationTime, setPreparationTime] = useState('');
  const [consumeBefore, setConsumeBefore] = useState('');
  const [storageRequirements, setStorageRequirements] = useState('KEEP_WARM');
  const [allergenInfo, setAllergenInfo] = useState('');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '');
  const [submittingDonation, setSubmittingDonation] = useState(false);

  // Log waste modal
  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  const [wasteDonationId, setWasteDonationId] = useState<number | null>(null);
  const [wasteQty, setWasteQty] = useState<number>(10);
  const [wasteReason, setWasteReason] = useState('EXPIRED_WITHOUT_ALLOCATION');
  const [disposalMethod, setDisposalMethod] = useState('COMPOSTING');
  const [wasteNotes, setWasteNotes] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadDashboardData();
    // Default form dates
    const now = new Date();
    setPreparationTime(new Date(now.getTime() - 60 * 60 * 1000).toISOString().slice(0, 16));
    setConsumeBefore(new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16));
  }, []);

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

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingDonation(true);
      await donationsApi.create({
        foodName,
        foodCategory,
        foodType,
        stateType,
        totalQuantity: quantity,
        quantityUnit,
        preparationTime: new Date(preparationTime).toISOString(),
        consumeBefore: new Date(consumeBefore).toISOString(),
        storageRequirements,
        allergenInformation: allergenInfo,
        pickupAddress,
      });

      addToast('success', `Food donation '${foodName}' listed successfully!`);
      // Reset form
      setFoodName('');
      setAllergenInfo('');
      setActiveTab('MY_DONATIONS');
      loadDashboardData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to list food donation');
    } finally {
      setSubmittingDonation(false);
    }
  };

  const handleCancelDonation = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await donationsApi.cancel(id);
      addToast('info', 'Donation has been cancelled');
      loadDashboardData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to cancel donation');
    }
  };

  const handleLogWasteSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      addToast('error', err.message || 'Failed to record waste');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      addToast('success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      addToast('error', err.message || 'Could not update password');
    }
  };

  // Live Statistics calculated from donor's donations
  const totalDonated = donations.reduce((acc, d) => acc + Number(d.totalQuantity), 0);
  const totalRemaining = donations
    .filter((d) => d.status === 'AVAILABLE' || d.status === 'PARTIALLY_ALLOCATED')
    .reduce((acc, d) => acc + Number(d.remainingQuantity), 0);
  const totalAllocated = donations.reduce((acc, d) => acc + Number(d.allocatedQuantity), 0);
  const completedDeliveries = allocations.filter((a) => a.status === 'DELIVERED').length;
  const expiredCount = donations.filter((d) => d.status === 'EXPIRED').length;
  const totalWasted = wasteRecords.reduce((acc, w) => acc + Number(w.quantity), 0);
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
            {user?.profileDetails?.organizationType || 'Restaurant'} • {user?.address}, {user?.city}
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
            <span>Add Food Donation</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-lightBorder text-xs font-semibold">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: Utensils },
          { key: 'ADD_DONATION', label: 'Add Food Donation', icon: PlusCircle },
          { key: 'MY_DONATIONS', label: `My Donations (${donations.length})`, icon: ListOrdered },
          { key: 'ALLOCATIONS', label: `Allocations & Pickups (${allocations.length})`, icon: Truck },
          { key: 'WASTE', label: `Waste Records (${wasteRecords.length})`, icon: Trash2 },
          { key: 'PROFILE', label: 'Profile & Security', icon: UserIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
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
          {/* Stat Cards Grid */}
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
              title="Portions Allocated"
              value={`${totalAllocated} Portions`}
              subtitle="Claimed by orphanages/shelters"
              icon={CheckCircle2}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-700"
            />
            <StatCard
              title="Waste Prevented"
              value={`${wastePrevented} Portions`}
              subtitle="Directly diverted to tables"
              icon={Leaf}
              iconBgColor="bg-softGreen-light"
              iconColor="text-forest"
            />
          </div>

          {/* Recent Donations Quick Table */}
          <div className="card-warm p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-lightBorder">
              <h3 className="font-serif text-lg font-bold text-forest">Recent Food Donations</h3>
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
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Available / Total</th>
                      <th className="py-2.5 px-3">Consume Before</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lightBorder">
                    {donations.slice(0, 5).map((d) => (
                      <tr key={d.id} className="hover:bg-cream-50">
                        <td className="py-2.5 px-3 font-bold text-forest">{d.foodName}</td>
                        <td className="py-2.5 px-3 text-mutedText">{d.foodCategory.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 px-3 font-semibold">
                          {d.remainingQuantity} / {d.totalQuantity} {d.quantityUnit}
                        </td>
                        <td className="py-2.5 px-3 text-mutedText">
                          {new Date(d.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3">
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

      {/* TAB 2: ADD FOOD DONATION FORM */}
      {activeTab === 'ADD_DONATION' && (
        <div className="card-warm p-8 max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-forest">List Surplus Food Donation</h2>
            <p className="text-xs text-mutedText mt-1">
              Provide exact portion counts, safe storage, and consumption cutoffs for our verified recipients.
            </p>
          </div>

          <form onSubmit={handleCreateDonation} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Food Name / Description *
                </label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. South Indian Sambar Rice & Poriyal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Food Category *
                </label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="RICE_AND_MEALS">Rice & Meals</option>
                  <option value="BREAD_AND_BAKERY">Bread & Bakery</option>
                  <option value="FRUITS_AND_VEGETABLES">Fruits & Vegetables</option>
                  <option value="DAIRY">Dairy</option>
                  <option value="PACKAGED_FOOD">Packaged Food</option>
                  <option value="SNACKS">Snacks & Confectionery</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Dietary Classification *
                </label>
                <select
                  value={foodType}
                  onChange={(e: any) => setFoodType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="VEGETARIAN">Vegetarian (Green mark)</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  State Type *
                </label>
                <select
                  value={stateType}
                  onChange={(e: any) => setStateType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="COOKED">Cooked Meal</option>
                  <option value="PACKAGED">Packaged / Sealed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
                <div>
                  <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Preparation Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Consume-Before Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={consumeBefore}
                  onChange={(e) => setConsumeBefore(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Storage Requirement
                </label>
                <select
                  value={storageRequirements}
                  onChange={(e) => setStorageRequirements(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                >
                  <option value="KEEP_WARM">Keep Warm (Hot container)</option>
                  <option value="REFRIGERATED">Refrigerated</option>
                  <option value="COOL_AND_DRY">Cool & Dry Place</option>
                  <option value="ROOM_TEMPERATURE">Room Temperature</option>
                </select>
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Known Allergens
                </label>
                <input
                  type="text"
                  value={allergenInfo}
                  onChange={(e) => setAllergenInfo(e.target.value)}
                  placeholder="Contains mustard, nuts, dairy, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingDonation}
              className="w-full py-3 rounded-xl bg-forest hover:bg-primaryGreen text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
            >
              {submittingDonation ? 'Listing Food...' : 'Submit Food Donation'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MY DONATIONS */}
      {activeTab === 'MY_DONATIONS' && (
        <div className="card-warm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-lightBorder">
            <h2 className="font-serif text-xl font-bold text-forest">My Food Donations</h2>
            <span className="text-xs text-mutedText">{donations.length} records in MySQL</span>
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
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Total Qty</th>
                    <th className="py-2.5 px-3">Allocated</th>
                    <th className="py-2.5 px-3">Remaining</th>
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
                      <td className="py-3 px-3 text-mutedText">{d.foodCategory.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-3 font-semibold">{d.totalQuantity} {d.quantityUnit}</td>
                      <td className="py-3 px-3 text-primaryGreen font-semibold">{d.allocatedQuantity}</td>
                      <td className="py-3 px-3 font-bold text-forest">{d.remainingQuantity}</td>
                      <td className="py-3 px-3 text-mutedText">
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

      {/* TAB 4: ALLOCATIONS & PICKUP TRACKING */}
      {activeTab === 'ALLOCATIONS' && (
        <div className="card-warm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-lightBorder">
            <div>
              <h2 className="font-serif text-xl font-bold text-forest">Allocations & Delivery Dispatch</h2>
              <p className="text-xs text-mutedText mt-0.5">
                Portion claims made by recipient organizations on your food listings.
              </p>
            </div>
          </div>

          {allocations.length === 0 ? (
            <p className="text-xs text-mutedText py-8 text-center">No allocations requested on your food yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-lightBorder rounded-xl overflow-hidden">
                <thead className="bg-cream-100 text-mutedText uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Alloc ID</th>
                    <th className="py-2.5 px-3">Food Item</th>
                    <th className="py-2.5 px-3">Recipient Organization</th>
                    <th className="py-2.5 px-3">Claimed Qty</th>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">15km Transport Rule</th>
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
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          a.transportResponsibility === 'DONOR_OR_VOLUNTEER'
                            ? 'bg-softGreen text-forest'
                            : 'bg-orange-50 text-orangeAccent'
                        }`}>
                          {a.transportResponsibility === 'DONOR_OR_VOLUNTEER' ? '≤15km: Donor/Vol' : '>15km: Recipient'}
                        </span>
                      </td>
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
                Transparent records of expired or spoiled food diverted to composting or biogas recovery.
              </p>
            </div>
          </div>

          {wasteRecords.length === 0 ? (
            <div className="text-center py-10 text-mutedText space-y-2">
              <Leaf className="w-10 h-10 mx-auto text-primaryGreen/30" />
              <p className="font-serif text-base text-forest">Zero Waste Logged</p>
              <p className="text-xs">All allocated food has been successfully claimed or is still within safe consumption limits.</p>
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
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3">Recorded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder">
                  {wasteRecords.map((w) => (
                    <tr key={w.id} className="hover:bg-cream-50">
                      <td className="py-3 px-3 font-mono font-bold text-forest">#{w.id}</td>
                      <td className="py-3 px-3 font-bold text-darkText">{w.foodName}</td>
                      <td className="py-3 px-3 font-bold text-red-600">{w.quantity} {w.quantityUnit}</td>
                      <td className="py-3 px-3 text-mutedText">{w.wasteReason.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-800">
                        {w.disposalMethod.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3 text-mutedText max-w-xs truncate">{w.notes || '—'}</td>
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

      {/* TAB 6: PROFILE & PASSWORD */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-warm p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-forest border-b border-lightBorder pb-2">
              Donor Profile Details
            </h3>
            <div className="text-xs space-y-3">
              <div>
                <span className="text-mutedText block">Organization Name:</span>
                <span className="font-bold text-darkText">{user?.profileDetails?.organizationName}</span>
              </div>
              <div>
                <span className="text-mutedText block">FSSAI License:</span>
                <span className="font-mono text-darkText">{user?.profileDetails?.fssaiLicense || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-mutedText block">Contact Person:</span>
                <span className="font-medium text-darkText">{user?.profileDetails?.contactPerson || user?.fullName}</span>
              </div>
              <div>
                <span className="text-mutedText block">Operating Hours:</span>
                <span className="font-medium text-darkText">{user?.profileDetails?.operatingHours || '07:00 AM - 10:00 PM'}</span>
              </div>
              <div>
                <span className="text-mutedText block">Registered Address:</span>
                <span className="font-medium text-darkText">{user?.address}, {user?.city}, {user?.pincode}</span>
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
              <option value="COMPOSTING">Municipal / Institutional Organic Composting</option>
              <option value="BIOGAS_GENERATION">Agricultural Anaerobic Biogas Digester</option>
              <option value="MUNICIPAL_DISPOSAL">Standard Municipal Disposal</option>
            </select>
          </div>

          <div>
            <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
              Incident Notes
            </label>
            <textarea
              rows={2}
              value={wasteNotes}
              onChange={(e) => setWasteNotes(e.target.value)}
              placeholder="e.g. Prepared for banquet lunch, diverted to compost unit"
              className="w-full px-3.5 py-2 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
            />
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
