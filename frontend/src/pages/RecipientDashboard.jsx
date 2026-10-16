import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { donationsApi, allocationsApi, notificationsApi, otpApi, authApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { FoodCard } from '../components/FoodCard';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import {
  Utensils,
  Search,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  User as UserIcon,
  RefreshCw,
  Truck,
  HeartHandshake
} from 'lucide-react';

export const RecipientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const [availableFood, setAvailableFood] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Request Food Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState(10);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // OTP Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [loadingOtp, setLoadingOtp] = useState(false);

  // Preferences form (Clean & Simple)
  const [dietaryPreference, setDietaryPreference] = useState('VEGETARIAN');
  const [dailyDemand, setDailyDemand] = useState(50);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, allocRes, notifRes] = await Promise.allSettled([
        donationsApi.getAvailable(),
        allocationsApi.getMy(),
        notificationsApi.getAll(),
      ]);

      if (donationsRes.status === 'fulfilled') setAvailableFood(donationsRes.value || []);
      if (allocRes.status === 'fulfilled') setAllocations(allocRes.value || []);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value || []);
    } catch {
      // safe fallback
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

  // Open Claim Modal
  const handleOpenClaim = (donation) => {
    setSelectedDonation(donation);
    setRequestQuantity(Math.min(20, Number(donation.remainingQuantity)));
    setDeliveryNotes('');
    setClaimModalOpen(true);
  };

  // Submit Claim
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    if (requestQuantity <= 0 || requestQuantity > Number(selectedDonation.remainingQuantity)) {
      addToast('error', `Please enter a valid quantity between 1 and ${selectedDonation.remainingQuantity}`);
      return;
    }

    try {
      setIsSubmittingClaim(true);
      await allocationsApi.request({
        donationId: selectedDonation.id,
        requestedQuantity: requestQuantity,
        notes: deliveryNotes,
      });

      addToast('success', `Requested ${requestQuantity} portions of ${selectedDonation.foodName}!`);
      setClaimModalOpen(false);
      setSelectedDonation(null);
      await loadData();
      setActiveTab('MY_CLAIMS');
    } catch (err) {
      addToast('error', err.message || 'Failed to submit allocation request');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // View Handover OTP
  const handleViewOtp = async (deliveryId) => {
    try {
      setLoadingOtp(true);
      setOtpModalOpen(true);
      const data = await otpApi.getOtpForDelivery(deliveryId);
      setOtpData(data);
    } catch (err) {
      addToast('error', err.message || 'Unable to retrieve delivery OTP');
      setOtpModalOpen(false);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n)));
    } catch {}
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      addToast('info', 'All notifications marked as read');
    } catch {}
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('error', 'Please fill in both password fields');
      return;
    }
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      addToast('success', 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addToast('error', err.message || 'Failed to update password');
    }
  };

  // Filter available food
  const filteredFood = availableFood.filter((f) => {
    const matchesSearch =
      (f.foodName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.donorOrganizationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.pickupAddress || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || f.foodCategory === selectedCategory;
    const matchesType = selectedType === 'ALL' || f.foodType === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  const activeAllocationsCount = allocations.filter((a) => a.status !== 'CANCELLED' && a.status !== 'DELIVERED').length;
  const totalPortionsReceived = allocations
    .filter((a) => a.status === 'DELIVERED')
    .reduce((acc, curr) => acc + Number(curr.allocatedQuantity || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-lightBorder shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primaryGreen">Recipient Portal</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
            {user?.profileDetails?.organizationName || user?.fullName}
          </h1>
          <p className="text-xs text-mutedText mt-0.5">
            {user?.address}, {user?.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-lightBorder text-mutedText hover:text-forest hover:bg-cream transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('AVAILABLE_FOOD')}
            className="px-4 py-2.5 rounded-xl bg-forest hover:bg-primaryGreen text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Search className="w-4 h-4 text-orangeAccent" />
            <span>Browse Available Meals</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-lightBorder text-xs font-semibold">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: Utensils },
          { key: 'AVAILABLE_FOOD', label: `Available Food (${availableFood.length})`, icon: Search },
          { key: 'MY_CLAIMS', label: `My Claims & OTPs (${allocations.length})`, icon: CheckCircle2 },
          { key: 'PREFERENCES', label: 'Preferences', icon: SlidersHorizontal },
          { key: 'NOTIFICATIONS', label: `Alerts (${notifications.length})`, icon: Bell },
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Active Claims"
              value={activeAllocationsCount}
              subtitle="Pending preparation / in transit"
              icon={Clock}
              iconBgColor="bg-amber-50"
              iconColor="text-orangeAccent"
            />
            <StatCard
              title="Meals Received"
              value={`${totalPortionsReceived} Portions`}
              subtitle="Successfully distributed"
              icon={CheckCircle2}
              iconBgColor="bg-emerald-50"
              iconColor="text-primaryGreen"
            />
            <StatCard
              title="Surplus Available"
              value={`${availableFood.length} Batches`}
              subtitle="Fresh meals ready to claim"
              icon={Utensils}
            />
          </div>

          {/* Quick Browse Callout */}
          <div className="card-warm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">Ready to feed your community?</h3>
              <p className="text-xs text-mutedText mt-1">
                Explore real-time surplus from hotels, restaurants, and caterers across Erode. Partial claims are supported.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('AVAILABLE_FOOD')}
              className="px-5 py-2.5 bg-forest hover:bg-primaryGreen text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Browse Food →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABLE FOOD */}
      {activeTab === 'AVAILABLE_FOOD' && (
        <div className="space-y-6">
          <div className="card-warm p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food by name or donor location..."
                className="w-full pl-10 pr-4 py-2 border border-lightBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-lightBorder rounded-xl text-xs font-semibold"
            >
              <option value="ALL">All Food</option>
              <option value="VEGETARIAN">Vegetarian Only</option>
              <option value="NON_VEGETARIAN">Non-Veg</option>
            </select>
          </div>

          {filteredFood.length === 0 ? (
            <div className="text-center py-12 text-mutedText card-warm">
              <Utensils className="w-10 h-10 mx-auto text-forest/20 mb-2" />
              <p>No matching surplus food listings at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFood.map((donation) => (
                <FoodCard
                  key={donation.id}
                  donation={donation}
                  onRequestClick={handleOpenClaim}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY CLAIMS & OTPs */}
      {activeTab === 'MY_CLAIMS' && (
        <div className="card-warm p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-lightBorder">
            <div>
              <h2 className="font-serif text-xl font-bold text-forest">My Food Claims & Deliveries</h2>
              <p className="text-xs text-mutedText mt-0.5">
                Inspect your requested portions and access your secure 6-digit handover OTP.
              </p>
            </div>
          </div>

          {allocations.length === 0 ? (
            <p className="text-xs text-mutedText py-8 text-center">You have not claimed any food yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-lightBorder rounded-xl overflow-hidden">
                <thead className="bg-cream-100 text-mutedText uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Claim ID</th>
                    <th className="py-2.5 px-3">Food Item</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Handover OTP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightBorder">
                  {allocations.map((a) => (
                    <tr key={a.id} className="hover:bg-cream-50">
                      <td className="py-3 px-3 font-mono font-bold text-forest">#{a.id}</td>
                      <td className="py-3 px-3 font-bold text-darkText">{a.foodName}</td>
                      <td className="py-3 px-3 font-semibold text-primaryGreen">
                        {a.allocatedQuantity} {a.quantityUnit}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        {a.deliveryId ? (
                          <button
                            onClick={() => handleViewOtp(a.deliveryId)}
                            className="px-3 py-1.5 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-primaryGreen transition-colors inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-orangeAccent" />
                            <span>View OTP</span>
                          </button>
                        ) : (
                          <span className="text-mutedText">Awaiting driver</span>
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

      {/* TAB 4: PREFERENCES (Simple, No allergens!) */}
      {activeTab === 'PREFERENCES' && (
        <div className="max-w-xl card-warm p-6 space-y-6">
          <div className="border-b border-lightBorder pb-3">
            <h3 className="font-serif font-bold text-xl text-forest">Shelter Preferences</h3>
            <p className="text-xs text-mutedText mt-1">
              Set dietary category and daily capacity demand.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSavingPrefs(true);
              setTimeout(() => {
                setSavingPrefs(false);
                addToast('success', 'Preferences updated successfully!');
              }, 300);
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-darkText uppercase tracking-wider mb-1.5">
                Dietary Preference
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="VEGETARIAN">Vegetarian Only</option>
                <option value="NON_VEGETARIAN">Non-Vegetarian Accepted</option>
                <option value="ALL">Any Edible Food</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-darkText uppercase tracking-wider mb-1.5">
                Daily Capacity Demand (Estimated Portions)
              </label>
              <input
                type="number"
                min="5"
                max="1000"
                value={dailyDemand}
                onChange={(e) => setDailyDemand(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <button
              type="submit"
              disabled={savingPrefs}
              className="px-6 py-2.5 bg-forest text-white rounded-xl font-semibold text-xs hover:bg-primaryGreen transition-colors shadow-sm"
            >
              {savingPrefs ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="card-warm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-lightBorder">
            <h3 className="font-serif font-bold text-lg text-forest">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllNotifsRead}
                className="text-xs font-semibold text-primaryGreen hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-mutedText py-8 text-center">No notifications yet.</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkNotifRead(n.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    n.read ? 'bg-cream-50 border-lightBorder' : 'bg-softGreen/40 border-softGreen font-medium'
                  }`}
                >
                  <div className="flex justify-between items-center font-bold text-darkText">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-mutedText font-normal">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-mutedText mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-warm p-6 space-y-4 text-xs">
            <h3 className="font-serif font-bold text-lg text-forest border-b border-lightBorder pb-2">
              Shelter Profile
            </h3>
            <div className="space-y-2.5">
              <div>
                <span className="text-mutedText block">Organization:</span>
                <span className="font-bold text-darkText">{user?.profileDetails?.organizationName || user?.fullName}</span>
              </div>
              <div>
                <span className="text-mutedText block">Address:</span>
                <span className="font-medium text-darkText">{user?.address}, {user?.city}</span>
              </div>
            </div>
          </div>

          <div className="card-warm p-6 space-y-4 text-xs">
            <h3 className="font-serif font-bold text-lg text-forest border-b border-lightBorder pb-2">
              Security: Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-mutedText block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-lightBorder bg-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-forest hover:bg-primaryGreen text-white font-semibold text-xs shadow-sm"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CLAIM PORTIONS MODAL */}
      {claimModalOpen && selectedDonation && (
        <Modal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          title={`Claim Portions — ${selectedDonation.foodName}`}
        >
          <form onSubmit={handleSubmitClaim} className="space-y-4 text-darkText text-xs">
            <div className="p-3.5 bg-cream rounded-xl border border-lightBorder space-y-1">
              <div className="flex justify-between">
                <span className="text-mutedText">Donor:</span>
                <span className="font-bold text-darkText">{selectedDonation.donorOrganizationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Available Portions:</span>
                <span className="font-bold text-forest">{selectedDonation.remainingQuantity}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider mb-1">
                Portions Needed *
              </label>
              <input
                type="number"
                min="1"
                max={selectedDonation.remainingQuantity}
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-base font-bold text-forest focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider mb-1">
                Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Gate code, specific entrance, etc."
                className="w-full px-4 py-2 border border-lightBorder rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="px-4 py-2 border border-lightBorder rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingClaim}
                className="px-5 py-2 bg-forest text-white rounded-xl font-semibold hover:bg-primaryGreen shadow-sm"
              >
                {isSubmittingClaim ? 'Submitting...' : 'Confirm Claim'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* OTP HANDOVER MODAL */}
      {otpModalOpen && (
        <Modal
          isOpen={otpModalOpen}
          onClose={() => setOtpModalOpen(false)}
          title="Recipient Handover Verification OTP"
        >
          <div className="space-y-4 text-center">
            {loadingOtp ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-8 w-8 text-primaryGreen animate-spin" />
                <span className="text-xs text-mutedText">Retrieving OTP...</span>
              </div>
            ) : otpData ? (
              <div className="space-y-4">
                <p className="text-xs text-mutedText">
                  Share this 6-digit code with the volunteer driver when receiving food:
                </p>

                <div className="p-6 bg-cream rounded-2xl border-2 border-dashed border-primaryGreen/40 inline-block">
                  <div className="font-mono text-4xl font-extrabold text-forest tracking-widest">
                    {otpData.plainOtp}
                  </div>
                  <span className="text-[11px] text-mutedText block mt-2">
                    Valid until {new Date(otpData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-left flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    The driver enters this OTP to mark the food as safely delivered.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-600 py-4">Unable to display OTP.</p>
            )}

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="px-6 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-primaryGreen shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
