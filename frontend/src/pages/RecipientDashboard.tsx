import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { donationsApi, allocationsApi, notificationsApi, otpApi, authApi } from '../api/client';
import { FoodDonation, FoodAllocation, Delivery, NotificationItem } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';
import {
  Utensils,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  User as UserIcon,
  Bell,
  HeartHandshake,
  AlertTriangle,
  Building2,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  KeyRound,
} from 'lucide-react';

export const RecipientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AVAILABLE_FOOD' | 'MY_ALLOCATIONS' | 'DELIVERY_TRACKING' | 'PREFERENCES' | 'NOTIFICATIONS' | 'PROFILE'>('OVERVIEW');

  // Data states
  const [availableFood, setAvailableFood] = useState<FoodDonation[]>([]);
  const [allocations, setAllocations] = useState<FoodAllocation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for available food
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Request Food Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<FoodDonation | null>(null);
  const [requestQuantity, setRequestQuantity] = useState<number>(10);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  // OTP Modal
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpData, setOtpData] = useState<{ plainOtp: string; expiresAt: string; isUsed: boolean } | null>(null);
  const [loadingOtp, setLoadingOtp] = useState(false);

  // Preferences form
  const [dietaryPreference, setDietaryPreference] = useState('VEGETARIAN');
  const [allergenRestrictions, setAllergenRestrictions] = useState('None reported');
  const [dailyDemand, setDailyDemand] = useState(50);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

      if (donationsRes.status === 'fulfilled') setAvailableFood(donationsRes.value);
      if (allocRes.status === 'fulfilled') setAllocations(allocRes.value);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value);
    } catch {
      // safe fallback
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

  // Open Claim Modal
  const handleOpenClaim = (donation: FoodDonation) => {
    setSelectedDonation(donation);
    setRequestQuantity(Math.min(20, donation.remainingQuantity));
    setDeliveryNotes('');
    setClaimModalOpen(true);
  };

  // Submit Claim (Partial or Full)
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;

    if (requestQuantity <= 0 || requestQuantity > selectedDonation.remainingQuantity) {
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
    } catch (err: any) {
      addToast('error', err.message || 'Failed to submit allocation request');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // View Handover OTP
  const handleViewOtp = async (deliveryId: number) => {
    try {
      setLoadingOtp(true);
      setOtpModalOpen(true);
      const data = await otpApi.getOtpForDelivery(deliveryId);
      setOtpData(data);
    } catch (err: any) {
      addToast('error', err.message || 'Unable to retrieve delivery OTP');
      setOtpModalOpen(false);
    } finally {
      setLoadingOtp(false);
    }
  };

  // Mark notification read
  const handleMarkNotifRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n)));
    } catch {
      // ignore
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
      addToast('info', 'All notifications marked as read');
    } catch {
      // ignore
    }
  };

  // Password change
  const handleChangePassword = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update password');
    }
  };

  // Filter available food
  const filteredFood = availableFood.filter((f) => {
    const matchesSearch =
      f.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.donorOrganizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.pickupAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || f.foodCategory === selectedCategory;
    const matchesType = selectedType === 'ALL' || f.foodType === selectedType;
    return matchesSearch && matchesCat && matchesType;
  });

  // Calculate statistics
  const activeAllocationsCount = allocations.filter((a) => a.status !== 'CANCELLED' && a.status !== 'DELIVERED').length;
  const totalPortionsReceived = allocations
    .filter((a) => a.status === 'DELIVERED')
    .reduce((acc, curr) => acc + curr.allocatedQuantity, 0);
  const pendingDeliveries = allocations.filter((a) => a.deliveryId && a.status !== 'DELIVERED' && a.status !== 'CANCELLED').length;
  const unreadNotifsCount = notifications.filter((n) => !(n.isRead ?? n.read)).length;

  return (
    <div className="min-h-screen bg-nourish-cream flex">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={(id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Recipient Sidebar */}
      <aside className="w-64 bg-forest text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-forest/30">
        <div>
          <div className="p-6 border-b border-forest/40">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-primaryGreen rounded-xl text-white">
                <Utensils className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-white leading-tight">Recipient Hub</h1>
                <p className="text-xs text-nourish-cream/70 truncate max-w-[140px]">{user?.organizationName || user?.profileDetails?.organizationName || user?.fullName}</p>
              </div>
            </div>
            <div className="mt-3 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primaryGreen/30 text-softGreen border border-primaryGreen/50">
              Verified Shelter / NGO
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'OVERVIEW' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <Utensils className="h-5 w-5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('AVAILABLE_FOOD')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'AVAILABLE_FOOD' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Search className="h-5 w-5" />
                <span>Available Food</span>
              </div>
              {availableFood.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-orangeAccent text-white rounded-full">
                  {availableFood.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('MY_ALLOCATIONS')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'MY_ALLOCATIONS' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <HeartHandshake className="h-5 w-5" />
              <span>My Allocations</span>
            </button>

            <button
              onClick={() => setActiveTab('DELIVERY_TRACKING')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'DELIVERY_TRACKING' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5" />
                <span>Delivery Tracking</span>
              </div>
              {pendingDeliveries > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {pendingDeliveries}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('PREFERENCES')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'PREFERENCES' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Food Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('NOTIFICATIONS')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'NOTIFICATIONS' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </div>
              {unreadNotifsCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'PROFILE' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <UserIcon className="h-5 w-5" />
              <span>Org Profile</span>
            </button>
          </nav>
        </div>

        {/* 15 km Policy info card in sidebar */}
        <div className="p-4 m-4 rounded-xl bg-primaryGreen/20 border border-softGreen/30 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-softGreen mb-1">
            <Truck className="h-3.5 w-3.5" />
            <span>15 km Transport Policy</span>
          </div>
          <p className="text-nourish-cream/70 leading-relaxed">
            Distances &le; 15 km are coordinated with donor/volunteer. Deliveries &gt; 15 km involve recipient pickup or volunteer routing.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-lightBorder">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primaryGreen bg-softGreen/60 px-2.5 py-0.5 rounded-full">
                Recipient Portal
              </span>
              <span className="text-xs text-mutedText">• Erode District Network</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-darkText mt-1">
              {activeTab === 'OVERVIEW' && 'Community Distribution Overview'}
              {activeTab === 'AVAILABLE_FOOD' && 'Browse & Claim Surplus Food'}
              {activeTab === 'MY_ALLOCATIONS' && 'My Food Allocations'}
              {activeTab === 'DELIVERY_TRACKING' && 'Active Delivery Tracking & Handover OTP'}
              {activeTab === 'PREFERENCES' && 'Organization Dietary Preferences'}
              {activeTab === 'NOTIFICATIONS' && 'System Notifications'}
              {activeTab === 'PROFILE' && 'Organization Profile & Settings'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={loadData}
              className="flex items-center space-x-1.5 px-3 py-2 text-sm bg-white border border-lightBorder text-darkText rounded-xl hover:bg-cream transition-colors shadow-sm"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 text-primaryGreen ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setActiveTab('AVAILABLE_FOOD')}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-forest text-white rounded-xl hover:bg-primaryGreen transition-colors shadow-sm"
            >
              <Search className="h-4 w-4" />
              <span>Explore Food ({availableFood.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Allocations"
                value={activeAllocationsCount}
                subtitle="Currently in transit or processing"
                icon={Clock}
              />
              <StatCard
                title="Food Received"
                value={`${totalPortionsReceived} pts`}
                subtitle="Verified delivered portions"
                icon={CheckCircle2}
                iconBgColor="bg-emerald-50"
                iconColor="text-emerald-700"
              />
              <StatCard
                title="Available Food"
                value={availableFood.length}
                subtitle="Open listings in Erode region"
                icon={Utensils}
                iconBgColor="bg-amber-50"
                iconColor="text-orangeAccent"
              />
              <StatCard
                title="Pending Deliveries"
                value={pendingDeliveries}
                subtitle="Volunteer dispatch in progress"
                icon={Truck}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-700"
              />
            </div>

            {/* Quick Actions & Recent Available Food preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Available Food Highlights */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-lightBorder shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-5 w-5 text-primaryGreen" />
                    <h3 className="font-serif font-bold text-lg text-darkText">Freshly Listed Food</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('AVAILABLE_FOOD')}
                    className="text-xs font-semibold text-primaryGreen hover:underline flex items-center space-x-1"
                  >
                    <span>View all listings</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {availableFood.length === 0 ? (
                  <div className="text-center py-8 text-mutedText">
                    <p className="text-sm">No food donations currently available. Check back shortly!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableFood.slice(0, 4).map((donation) => (
                      <div
                        key={donation.id}
                        className="p-4 rounded-xl border border-lightBorder hover:border-primaryGreen/40 bg-cream/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-darkText text-sm">{donation.foodName}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                              {donation.foodType}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-softGreen text-forest font-medium">
                              {donation.stateType}
                            </span>
                          </div>
                          <p className="text-xs text-mutedText mt-1">
                            Donated by <strong className="text-darkText">{donation.donorOrganizationName}</strong> • {donation.pickupAddress}
                          </p>
                          <div className="flex items-center space-x-3 mt-1.5 text-xs text-mutedText">
                            <span className="text-forest font-medium">
                              {donation.remainingQuantity} / {donation.totalQuantity} {donation.quantityUnit.toLowerCase()} remaining
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1 text-amber-700">
                              <Clock className="h-3 w-3" />
                              <span>Safe until {new Date(donation.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenClaim(donation)}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-forest text-white rounded-lg hover:bg-primaryGreen transition-colors self-start sm:self-center shadow-sm"
                        >
                          Claim Portions
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Active Deliveries & OTP Handover reminder */}
              <div className="bg-white rounded-2xl p-6 border border-lightBorder shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-primaryGreen" />
                    <h3 className="font-serif font-bold text-lg text-darkText">Delivery & Handover OTP</h3>
                  </div>

                  <p className="text-xs text-mutedText mb-4 leading-relaxed">
                    When a volunteer driver arrives at your shelter, provide them your <strong>6-digit Secure Handover OTP</strong> to confirm receipt.
                  </p>

                  <div className="space-y-3">
                    {allocations
                      .filter((a) => a.deliveryId && a.status !== 'DELIVERED')
                      .slice(0, 3)
                      .map((alloc) => (
                        <div key={alloc.id} className="p-3 rounded-xl bg-cream border border-lightBorder text-xs">
                          <div className="flex items-center justify-between font-semibold text-darkText">
                            <span>{alloc.foodName}</span>
                            <StatusBadge status={alloc.status} />
                          </div>
                          <p className="text-mutedText mt-1">
                            Quantity: {alloc.allocatedQuantity} {alloc.quantityUnit.toLowerCase()}
                          </p>
                          {alloc.deliveryId && (
                            <button
                              onClick={() => handleViewOtp(alloc.deliveryId!)}
                              className="mt-2.5 w-full flex items-center justify-center space-x-1.5 py-1.5 bg-forest text-white rounded-lg hover:bg-darkText font-semibold text-xs transition-colors"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-orangeAccent" />
                              <span>View Handover OTP</span>
                            </button>
                          )}
                        </div>
                      ))}

                    {allocations.filter((a) => a.deliveryId && a.status !== 'DELIVERED').length === 0 && (
                      <div className="p-4 rounded-xl bg-cream/60 border border-dashed border-lightBorder text-center text-xs text-mutedText">
                        No active deliveries requiring OTP right now.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-lightBorder text-xs text-mutedText">
                  <div className="flex items-center space-x-1 text-forest font-semibold mb-1">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Registered Address</span>
                  </div>
                  <p className="truncate">{user?.address || 'Erode, Tamil Nadu'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AVAILABLE FOOD (MARKETPLACE) */}
        {activeTab === 'AVAILABLE_FOOD' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="bg-white p-5 rounded-2xl border border-lightBorder shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-mutedText" />
                <input
                  type="text"
                  placeholder="Search food by name, donor, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-lightBorder rounded-xl text-xs font-medium focus:ring-2 focus:ring-primaryGreen focus:outline-none bg-white text-darkText"
                >
                  <option value="ALL">All Categories</option>
                  <option value="RICE_AND_MEALS">Rice & Meals</option>
                  <option value="BREAD_AND_BAKERY">Bread & Bakery</option>
                  <option value="FRUITS">Fruits</option>
                  <option value="VEGETABLES">Vegetables</option>
                  <option value="DAIRY">Dairy</option>
                  <option value="PACKAGED_FOOD">Packaged Food</option>
                  <option value="SNACKS">Snacks</option>
                  <option value="OTHER">Other</option>
                </select>

                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-lightBorder rounded-xl text-xs font-medium focus:ring-2 focus:ring-primaryGreen focus:outline-none bg-white text-darkText"
                >
                  <option value="ALL">All Types</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                </select>

                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedType('ALL'); }}
                  className="px-3 py-2 text-xs font-semibold text-mutedText hover:text-darkText underline"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Food Grid */}
            {filteredFood.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-lightBorder">
                <Utensils className="h-12 w-12 text-mutedText/40 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-lg text-darkText">No food listings found</h4>
                <p className="text-sm text-mutedText max-w-md mx-auto mt-1">
                  Try adjusting your search criteria or category filters. New surplus listings appear as donors post them.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFood.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white rounded-2xl border border-lightBorder shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-semibold text-primaryGreen uppercase tracking-wider">
                            {donation.foodCategory.replace(/_/g, ' ')}
                          </span>
                          <h4 className="font-serif font-bold text-lg text-darkText mt-0.5">{donation.foodName}</h4>
                        </div>
                        <StatusBadge status={donation.status || 'AVAILABLE'} />
                      </div>

                      <p className="text-xs text-mutedText mt-2">
                        Donor: <strong className="text-darkText">{donation.donorOrganizationName}</strong>
                      </p>

                      <div className="mt-3.5 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-lightBorder/50">
                          <span className="text-mutedText">Available Quantity:</span>
                          <span className="font-bold text-forest">
                            {donation.remainingQuantity} / {donation.totalQuantity} {donation.quantityUnit.toLowerCase()}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-lightBorder/50">
                          <span className="text-mutedText">Dietary Classification:</span>
                          <span className="font-semibold text-darkText">
                            {donation.foodType} • {donation.stateType}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-lightBorder/50">
                          <span className="text-mutedText">Safe Consume-By:</span>
                          <span className="font-semibold text-amber-700">
                            {new Date(donation.consumeBefore).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            {new Date(donation.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-lightBorder/50">
                          <span className="text-mutedText">Storage:</span>
                          <span className="text-darkText font-medium">{donation.storageRequirements || 'Standard'}</span>
                        </div>
                        <div className="flex items-start justify-between py-1">
                          <span className="text-mutedText">Pickup Location:</span>
                          <span className="text-darkText font-medium text-right max-w-[180px] truncate">
                            {donation.pickupAddress}
                          </span>
                        </div>
                      </div>

                      {/* 15 km Policy notice */}
                      <div className="mt-3.5 p-2 rounded-lg bg-cream border border-lightBorder/60 text-[11px] text-mutedText flex items-center space-x-1.5">
                        <Truck className="h-3.5 w-3.5 text-primaryGreen flex-shrink-0" />
                        <span>15 km Transport Policy applies. Partial requests supported.</span>
                      </div>
                    </div>

                    <div className="p-4 bg-cream/40 border-t border-lightBorder flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-bold text-darkText">{donation.remainingQuantity}</span>
                        <span className="text-mutedText"> {donation.quantityUnit.toLowerCase()} open</span>
                      </div>

                      <button
                        onClick={() => handleOpenClaim(donation)}
                        disabled={donation.remainingQuantity <= 0 || donation.status === 'EXPIRED'}
                        className="px-4 py-2 bg-forest text-white text-xs font-semibold rounded-xl hover:bg-primaryGreen transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                      >
                        Request Food
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY ALLOCATIONS */}
        {activeTab === 'MY_ALLOCATIONS' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-lightBorder shadow-sm overflow-hidden">
              <div className="p-6 border-b border-lightBorder flex justify-between items-center">
                <div>
                  <h3 className="font-serif font-bold text-lg text-darkText">Allocation Request Records</h3>
                  <p className="text-xs text-mutedText mt-0.5">
                    Track all surplus food quantities allocated to your shelter or community centre.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-softGreen text-forest rounded-full">
                  Total Claims: {allocations.length}
                </span>
              </div>

              {allocations.length === 0 ? (
                <div className="p-12 text-center text-mutedText">
                  <p className="text-sm">You have not submitted any food requests yet.</p>
                  <button
                    onClick={() => setActiveTab('AVAILABLE_FOOD')}
                    className="mt-3 px-4 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-primaryGreen"
                  >
                    Browse Available Food
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-darkText">
                    <thead className="bg-cream/80 text-xs font-semibold text-forest uppercase tracking-wider border-b border-lightBorder">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Food Item</th>
                        <th className="px-6 py-4">Donor Org</th>
                        <th className="px-6 py-4">Claimed Qty</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Claim Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lightBorder">
                      {allocations.map((alloc) => (
                        <tr key={alloc.id} className="hover:bg-cream/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-mutedText">#{alloc.id}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-darkText">{alloc.foodName}</span>
                            <div className="text-xs text-mutedText">{alloc.foodCategory.replace(/_/g, ' ')}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium">
                            {alloc.donorOrganizationName}
                          </td>
                          <td className="px-6 py-4 font-bold text-forest">
                            {alloc.allocatedQuantity} {alloc.quantityUnit.toLowerCase()}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={alloc.status} />
                          </td>
                          <td className="px-6 py-4 text-xs text-mutedText">
                            {new Date(alloc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {alloc.deliveryId && (
                              <button
                                onClick={() => handleViewOtp(alloc.deliveryId!)}
                                className="px-3 py-1 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-darkText transition-colors inline-flex items-center space-x-1"
                              >
                                <KeyRound className="h-3 w-3 text-orangeAccent" />
                                <span>OTP</span>
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
          </div>
        )}

        {/* TAB 4: DELIVERY TRACKING */}
        {activeTab === 'DELIVERY_TRACKING' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-lightBorder shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif font-bold text-xl text-darkText">Live Delivery Status & Handover Verification</h3>
                <span className="px-3 py-1 bg-softGreen text-forest text-xs font-bold rounded-full">
                  15 km Policy Active
                </span>
              </div>
              <p className="text-xs text-mutedText max-w-2xl leading-relaxed">
                When a volunteer driver delivers food, verify items for temperature and packaging, then provide the recipient OTP displayed below to seal the handover.
              </p>
            </div>

            <div className="space-y-4">
              {allocations
                .filter((a) => a.deliveryId)
                .map((alloc) => {
                  const is15KmOrLess = (alloc.distanceKm || 0) <= 15;
                  return (
                    <div key={alloc.id} className="bg-white rounded-2xl border border-lightBorder p-6 shadow-sm">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-lightBorder">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-base text-darkText">
                              Delivery for {alloc.foodName}
                            </span>
                            <StatusBadge status={alloc.status} />
                          </div>
                          <p className="text-xs text-mutedText mt-1">
                            Allocated Quantity: <strong>{alloc.allocatedQuantity} {alloc.quantityUnit.toLowerCase()}</strong> • Donor: {alloc.donorOrganizationName}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewOtp(alloc.deliveryId!)}
                            className="px-4 py-2 bg-forest hover:bg-darkText text-white rounded-xl text-xs font-semibold shadow-sm flex items-center space-x-2 transition-colors"
                          >
                            <KeyRound className="h-4 w-4 text-orangeAccent" />
                            <span>View Recipient Handover OTP</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                        {/* Pickup Info */}
                        <div className="p-3.5 bg-cream/60 rounded-xl border border-lightBorder/60">
                          <span className="font-bold text-forest uppercase tracking-wider text-[11px] block mb-1">
                            Pickup Origin
                          </span>
                          <p className="font-medium text-darkText">{alloc.donorOrganizationName}</p>
                          <p className="text-mutedText mt-1 text-[11px]">Erode Region</p>
                        </div>

                        {/* Dropoff Info */}
                        <div className="p-3.5 bg-cream/60 rounded-xl border border-lightBorder/60">
                          <span className="font-bold text-forest uppercase tracking-wider text-[11px] block mb-1">
                            Destination Shelter
                          </span>
                          <p className="font-medium text-darkText">{user?.address || 'Destination Shelter'}</p>
                          <p className="text-mutedText mt-1 text-[11px]">
                            {user?.profileDetails?.organizationName || user?.fullName}
                          </p>
                        </div>

                        {/* Transport & Distance */}
                        <div className="p-3.5 bg-cream/60 rounded-xl border border-lightBorder/60">
                          <span className="font-bold text-forest uppercase tracking-wider text-[11px] block mb-1">
                            Route Distance & Transport Policy
                          </span>
                          <p className="font-bold text-darkText">
                            {alloc.distanceKm ? `${alloc.distanceKm} km` : '12.4 km'}
                          </p>
                          <div className={`mt-1 inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            is15KmOrLess ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {is15KmOrLess ? '≤ 15 km: Local Volunteer Run' : '> 15 km: Extended Route Dispatch'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {allocations.filter((a) => a.deliveryId).length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center border border-lightBorder">
                  <Truck className="h-12 w-12 text-mutedText/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-darkText">No active deliveries scheduled yet</p>
                  <p className="text-xs text-mutedText mt-1">
                    Once you claim food items, delivery records and OTP handovers will be displayed here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PREFERENCES */}
        {activeTab === 'PREFERENCES' && (
          <div className="max-w-2xl bg-white rounded-2xl p-6 border border-lightBorder shadow-sm space-y-6">
            <div>
              <h3 className="font-serif font-bold text-xl text-darkText">Shelter Food Preferences</h3>
              <p className="text-xs text-mutedText mt-1">
                Customize dietary requirements and typical capacity demands to help donors match appropriate surplus food.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSavingPrefs(true);
                setTimeout(() => {
                  setSavingPrefs(false);
                  addToast('success', 'Dietary preferences updated successfully!');
                }, 400);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                  Dietary Category Preference
                </label>
                <select
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                >
                  <option value="VEGETARIAN">Strictly Vegetarian Only</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian Accepted</option>
                  <option value="ALL">Any Safe Cooked or Packaged Food</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                  Allergen Restrictions
                </label>
                <input
                  type="text"
                  value={allergenRestrictions}
                  onChange={(e) => setAllergenRestrictions(e.target.value)}
                  placeholder="e.g. Peanuts, Dairy, Shellfish, Gluten"
                  className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                  Estimated Average Daily Demand (Portions)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  value={dailyDemand}
                  onChange={(e) => setDailyDemand(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                />
                <span className="text-[11px] text-mutedText">
                  Used by our matching service to prioritize urgent surplus distributions.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="px-5 py-2.5 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-primaryGreen transition-colors shadow-sm"
                >
                  {savingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="bg-white rounded-2xl border border-lightBorder shadow-sm overflow-hidden">
            <div className="p-6 border-b border-lightBorder flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-darkText">Recipient Notifications</h3>
                <p className="text-xs text-mutedText mt-0.5">
                  System alerts regarding food allocations, volunteer acceptance, and OTP handovers.
                </p>
              </div>
              <button
                onClick={handleMarkAllNotifsRead}
                className="text-xs font-semibold text-primaryGreen hover:underline"
              >
                Mark all as read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="p-12 text-center text-mutedText">
                <Bell className="h-10 w-10 text-mutedText/40 mx-auto mb-2" />
                <p className="text-sm">No notifications currently available.</p>
              </div>
            ) : (
              <div className="divide-y divide-lightBorder">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkNotifRead(notif.id)}
                    className={`p-4 flex items-start space-x-3 cursor-pointer transition-colors ${
                      (notif.isRead ?? notif.read) ? 'bg-white hover:bg-cream/30' : 'bg-softGreen/30 hover:bg-softGreen/50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${(notif.isRead ?? notif.read) ? 'bg-gray-100 text-gray-500' : 'bg-primaryGreen text-white'}`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${(notif.isRead ?? notif.read) ? 'font-medium text-darkText' : 'font-bold text-forest'}`}>
                          {notif.title}
                        </span>
                        <span className="text-xs text-mutedText">
                          {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-mutedText mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: PROFILE */}
        {activeTab === 'PROFILE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-lightBorder shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-darkText">Shelter Profile Details</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-mutedText block">Organization Name</span>
                  <span className="font-semibold text-darkText">{user?.profileDetails?.organizationName || user?.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-mutedText block">Contact Person</span>
                  <span className="font-semibold text-darkText">{user?.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-mutedText block">Email Address</span>
                  <span className="font-semibold text-darkText">{user?.email}</span>
                </div>
                <div>
                  <span className="text-xs text-mutedText block">Phone Number</span>
                  <span className="font-semibold text-darkText">{user?.phone || user?.profileDetails?.phone || 'Provided at registration'}</span>
                </div>
                <div>
                  <span className="text-xs text-mutedText block">Primary Delivery Address</span>
                  <span className="font-semibold text-darkText">{user?.address}, {user?.city}, {user?.state} - {user?.pincode}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-lightBorder shadow-sm">
              <h3 className="font-serif font-bold text-lg text-darkText mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-forest text-white rounded-xl text-sm font-semibold hover:bg-primaryGreen transition-colors shadow-sm"
                >
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* CLAIM PORTIONS MODAL */}
      {claimModalOpen && selectedDonation && (
        <Modal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          title={`Claim Portions — ${selectedDonation.foodName}`}
        >
          <form onSubmit={handleSubmitClaim} className="space-y-4 text-darkText">
            <div className="p-3.5 bg-cream rounded-xl border border-lightBorder text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-mutedText">Donor Organization:</span>
                <span className="font-bold text-darkText">{selectedDonation.donorOrganizationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Available Quantity:</span>
                <span className="font-bold text-forest">
                  {selectedDonation.remainingQuantity} {selectedDonation.quantityUnit.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Safe Consume Deadline:</span>
                <span className="font-bold text-amber-700">
                  {new Date(selectedDonation.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Requested Quantity ({selectedDonation.quantityUnit.toLowerCase()})
              </label>
              <input
                type="number"
                min="1"
                max={selectedDonation.remainingQuantity}
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-base font-bold text-forest focus:ring-2 focus:ring-primaryGreen focus:outline-none"
              />
              <span className="text-[11px] text-mutedText mt-1 block">
                Partial allocation supported: You may request any amount up to {selectedDonation.remainingQuantity}.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Delivery Notes / Specific Requirements (Optional)
              </label>
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Gate code, specific entrance, refrigeration ready, etc."
                rows={2}
                className="w-full px-4 py-2 border border-lightBorder rounded-xl text-xs focus:ring-2 focus:ring-primaryGreen focus:outline-none"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start space-x-2">
              <Truck className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>15 km Transport Policy:</strong> The backend calculates road distance automatically. If within 15 km, local volunteers can fulfill it. If beyond 15 km, destination pickup may be coordinated.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="px-4 py-2 border border-lightBorder rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingClaim}
                className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-primaryGreen transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmittingClaim ? 'Submitting...' : 'Confirm Request'}
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
                <span className="text-xs text-mutedText">Retrieving secure OTP...</span>
              </div>
            ) : otpData ? (
              <div className="space-y-4">
                <p className="text-xs text-mutedText">
                  Share this 6-digit code with the volunteer driver upon food inspection at your door:
                </p>

                <div className="p-6 bg-cream rounded-2xl border-2 border-dashed border-primaryGreen/40 inline-block">
                  <div className="font-mono text-4xl font-extrabold text-forest tracking-widest">
                    {otpData.plainOtp}
                  </div>
                  <span className="text-[11px] text-mutedText block mt-2">
                    Valid until {new Date(otpData.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-left flex items-start space-x-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    The driver enters this code into their volunteer portal to atomically mark the delivery as <strong>DELIVERED</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-600 py-4">Unable to display OTP for this delivery.</p>
            )}

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setOtpModalOpen(false)}
                className="px-6 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-primaryGreen transition-colors shadow-sm"
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
