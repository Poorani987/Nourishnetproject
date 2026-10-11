import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { volunteerApi, routesApi, notificationsApi, otpApi, authApi } from '../api/client';
import { Delivery, Vehicle, VolunteerReward, NotificationItem, RoadNode, RouteResponse } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Toast, ToastMessage } from '../components/Toast';
import {
  Truck,
  CheckCircle2,
  Clock,
  Award,
  Navigation,
  Bell,
  User as UserIcon,
  RefreshCw,
  MapPin,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Lock,
  Compass
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AVAILABLE_DELIVERIES' | 'MY_ASSIGNMENTS' | 'ROUTE_NAV' | 'VEHICLE' | 'REWARDS' | 'NOTIFICATIONS' | 'PROFILE'>('OVERVIEW');

  // Core Volunteer States
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [myAssignments, setMyAssignments] = useState<Delivery[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [rewards, setRewards] = useState<VolunteerReward[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Vehicle form
  const [vehicleType, setVehicleType] = useState('MOTORCYCLE');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [capacity, setCapacity] = useState<number>(30);
  const [capacityUnit, setCapacityUnit] = useState('PORTIONS');
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(15);
  const [savingVehicle, setSavingVehicle] = useState(false);

  // OTP Verification Modal
  const [otpVerifyModalOpen, setOtpVerifyModalOpen] = useState(false);
  const [targetDelivery, setTargetDelivery] = useState<Delivery | null>(null);
  const [inputOtp, setInputOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Status transition state
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<number | null>(null);

  // Route calculation in Dashboard
  const [roadNodes, setRoadNodes] = useState<RoadNode[]>([]);
  const [routeOrigin, setRouteOrigin] = useState<number>(1);
  const [routeDest, setRouteDest] = useState<number>(2);
  const [activeRoute, setActiveRoute] = useState<RouteResponse | null>(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    loadData();
    loadNodes();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [availRes, myRes, vehRes, rewRes, notifRes] = await Promise.allSettled([
        volunteerApi.getAvailableDeliveries(),
        volunteerApi.getMyAssignments(),
        volunteerApi.getVehicle(),
        volunteerApi.getRewards(),
        notificationsApi.getAll(),
      ]);

      if (availRes.status === 'fulfilled') setAvailableDeliveries(availRes.value);
      if (myRes.status === 'fulfilled') setMyAssignments(myRes.value);
      if (vehRes.status === 'fulfilled' && vehRes.value) {
        setVehicle(vehRes.value);
        setVehicleType(vehRes.value.vehicleType);
        setRegistrationNumber(vehRes.value.registrationNumber);
        setCapacity(vehRes.value.capacity ?? vehRes.value.capacityValue ?? 30);
        setCapacityUnit(vehRes.value.capacityUnit);
        setServiceRadiusKm(vehRes.value.serviceRadiusKm ?? 15);
      }
      if (rewRes.status === 'fulfilled') setRewards(rewRes.value);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value);
    } catch {
      // offline handling
    } finally {
      setLoading(false);
    }
  };

  const loadNodes = async () => {
    try {
      const nodes = await routesApi.getNodes();
      setRoadNodes(nodes);
      if (nodes.length >= 2) {
        setRouteOrigin(nodes[0].id);
        setRouteDest(nodes[1].id);
      }
    } catch {
      // ignore
    }
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Toggle Availability
  const handleToggleAvailability = async () => {
    try {
      const res = await volunteerApi.toggleAvailability();
      setIsAvailable(res.isAvailable);
      addToast('info', `Your status is now: ${res.isAvailable ? 'AVAILABLE FOR DISPATCH' : 'OFF DUTY'}`);
    } catch (err: any) {
      addToast('error', err.message || 'Failed to toggle availability');
    }
  };

  // Accept Delivery
  const handleAcceptDelivery = async (deliveryId: number) => {
    try {
      setUpdatingDeliveryId(deliveryId);
      const accepted = await volunteerApi.acceptDelivery(deliveryId);
      addToast('success', `Delivery #${accepted.id} accepted! Added to your active assignments.`);
      await loadData();
      setActiveTab('MY_ASSIGNMENTS');
    } catch (err: any) {
      addToast('error', err.message || 'Unable to accept this delivery');
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  // Update Delivery Status (PICKED_UP or IN_TRANSIT)
  const handleUpdateStatus = async (deliveryId: number, newStatus: string) => {
    try {
      setUpdatingDeliveryId(deliveryId);
      await volunteerApi.updateStatus(deliveryId, newStatus, `Updated to ${newStatus} by volunteer`);
      addToast('success', `Delivery #${deliveryId} updated to ${newStatus.replace('_', ' ')}!`);
      await loadData();
    } catch (err: any) {
      addToast('error', err.message || 'Status transition failed');
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  // Open OTP Handover Modal
  const handleOpenOtpModal = (delivery: Delivery) => {
    setTargetDelivery(delivery);
    setInputOtp('');
    setOtpVerifyModalOpen(true);
  };

  // Submit OTP for Verification
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDelivery) return;

    if (!inputOtp || inputOtp.length !== 6) {
      addToast('error', 'Please enter the exact 6-digit code provided by the recipient.');
      return;
    }

    try {
      setVerifyingOtp(true);
      await otpApi.verifyOtp(targetDelivery.id, inputOtp);
      addToast('success', 'Handover Verified! Delivery marked as COMPLETED. Points credited to your profile!');
      setOtpVerifyModalOpen(false);
      setTargetDelivery(null);
      await loadData();
    } catch (err: any) {
      addToast('error', err.message || 'Invalid or expired OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Save Vehicle Details
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingVehicle(true);
      const updated = await volunteerApi.updateVehicle({
        id: vehicle?.id || 0,
        vehicleType,
        registrationNumber,
        capacityValue: capacity,
        capacity: capacity,
        capacityUnit,
        serviceRadiusKm,
        isAvailable,
        isActive: true,
      });
      setVehicle(updated);
      addToast('success', 'Vehicle parameters and payload limits updated successfully!');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to update vehicle');
    } finally {
      setSavingVehicle(false);
    }
  };

  // Calculate Route
  const handleCalculateRoute = async () => {
    if (routeOrigin === routeDest) {
      addToast('error', 'Origin and destination must be different nodes.');
      return;
    }
    try {
      setCalculatingRoute(true);
      const res = await routesApi.calculateRoute(routeOrigin, routeDest);
      setActiveRoute(res);
      addToast('info', `Optimal route found: ${res.totalDistanceKm} km across ${res.orderedNodeNames.length} nodes`);
    } catch (err: any) {
      addToast('error', err.message || 'No road route found between selected points');
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('error', 'Please provide current and new passwords.');
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

  // Metrics
  const completedDeliveries = myAssignments.filter((d) => (d.status ?? d.deliveryStatus) === 'DELIVERED').length;
  const activeAssignments = myAssignments.filter((d) => (d.status ?? d.deliveryStatus) !== 'DELIVERED' && (d.status ?? d.deliveryStatus) !== 'CANCELLED');
  const totalPoints = rewards.reduce((sum, r) => sum + (r.pointsAwarded ?? r.pointsEarned ?? 0), 0);
  const unreadNotifs = notifications.filter((n) => !(n.isRead ?? n.read)).length;

  return (
    <div className="min-h-screen bg-nourish-cream flex">
      <Toast toasts={toasts} onDismiss={(id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Volunteer Sidebar */}
      <aside className="w-64 bg-forest text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-forest/30">
        <div>
          <div className="p-6 border-b border-forest/40">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-primaryGreen rounded-xl text-white">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-white leading-tight">Volunteer Portal</h1>
                <p className="text-xs text-nourish-cream/70 truncate max-w-[140px]">{user?.fullName}</p>
              </div>
            </div>

            {/* Quick Availability Switch in Header */}
            <div className="mt-4 pt-3 border-t border-forest/50 flex items-center justify-between">
              <span className="text-xs font-medium text-nourish-cream/80">Duty Status:</span>
              <button
                onClick={handleToggleAvailability}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                  isAvailable
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-red-500/20 text-red-300 border border-red-400/40'
                }`}
              >
                {isAvailable ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>AVAILABLE</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-red-400"></span>
                    <span>OFF DUTY</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'OVERVIEW' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <Truck className="h-5 w-5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('AVAILABLE_DELIVERIES')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'AVAILABLE_DELIVERIES' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Navigation className="h-5 w-5" />
                <span>Available Deliveries</span>
              </div>
              {availableDeliveries.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-orangeAccent text-white rounded-full">
                  {availableDeliveries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('MY_ASSIGNMENTS')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'MY_ASSIGNMENTS' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5" />
                <span>My Assignments</span>
              </div>
              {activeAssignments.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {activeAssignments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ROUTE_NAV')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'ROUTE_NAV' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <Compass className="h-5 w-5" />
              <span>Dijkstra Route Map</span>
            </button>

            <button
              onClick={() => setActiveTab('VEHICLE')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'VEHICLE' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <Truck className="h-5 w-5" />
              <span>Vehicle Details</span>
            </button>

            <button
              onClick={() => setActiveTab('REWARDS')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                activeTab === 'REWARDS' ? 'bg-primaryGreen text-white shadow-sm' : 'text-nourish-cream/80 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5" />
                <span>Impact Rewards</span>
              </div>
              {totalPoints > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full">
                  {totalPoints} pts
                </span>
              )}
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
              {unreadNotifs > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {unreadNotifs}
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
              <span>Volunteer Profile</span>
            </button>
          </nav>
        </div>

        {/* Transport policy reminder */}
        <div className="p-4 m-4 rounded-xl bg-primaryGreen/20 border border-softGreen/30 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-softGreen mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Unpaid Volunteer Service</span>
          </div>
          <p className="text-nourish-cream/70 leading-relaxed">
            All routes are voluntary. Vehicle details ensure safe cargo matching. 15 km policy dictates dispatch priority.
          </p>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-lightBorder">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primaryGreen bg-softGreen/60 px-2.5 py-0.5 rounded-full">
                Vehicle Volunteer Network
              </span>
              <span className="text-xs text-mutedText">• Erode Road Graph</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-darkText mt-1">
              {activeTab === 'OVERVIEW' && 'Volunteer Dashboard'}
              {activeTab === 'AVAILABLE_DELIVERIES' && 'Available Delivery Dispatches'}
              {activeTab === 'MY_ASSIGNMENTS' && 'Active Deliveries & Handover OTP Verification'}
              {activeTab === 'ROUTE_NAV' && 'Dijkstra Road Graph Route Optimizer'}
              {activeTab === 'VEHICLE' && 'Personal Vehicle & Capacity Settings'}
              {activeTab === 'REWARDS' && 'Volunteer Badges & Impact Points'}
              {activeTab === 'NOTIFICATIONS' && 'Volunteer Notifications'}
              {activeTab === 'PROFILE' && 'Volunteer Profile & Settings'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={loadData}
              className="flex items-center space-x-1.5 px-3 py-2 text-sm bg-white border border-lightBorder text-darkText rounded-xl hover:bg-cream transition-colors shadow-sm"
              title="Refresh assignments"
            >
              <RefreshCw className={`h-4 w-4 text-primaryGreen ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setActiveTab('AVAILABLE_DELIVERIES')}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-forest text-white rounded-xl hover:bg-primaryGreen transition-colors shadow-sm"
            >
              <Navigation className="h-4 w-4" />
              <span>Explore Deliveries ({availableDeliveries.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Assignments"
                value={activeAssignments.length}
                subtitle="Currently in transit or picked up"
                icon={Clock}
              />
              <StatCard
                title="Deliveries Completed"
                value={completedDeliveries}
                subtitle="Verified via 6-digit recipient OTP"
                icon={CheckCircle2}
                iconBgColor="bg-emerald-50"
                iconColor="text-emerald-700"
              />
              <StatCard
                title="Volunteer Points"
                value={`${totalPoints} pts`}
                subtitle="Earned from community dispatches"
                icon={Award}
                iconBgColor="bg-amber-50"
                iconColor="text-orangeAccent"
              />
              <StatCard
                title="Available Opportunities"
                value={availableDeliveries.length}
                subtitle="Ready for pickup in your radius"
                icon={Truck}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-700"
              />
            </div>

            {/* Active Assignments Quick Action Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-lightBorder shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primaryGreen" />
                    <h3 className="font-serif font-bold text-lg text-darkText">Current Active Deliveries</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('MY_ASSIGNMENTS')}
                    className="text-xs font-semibold text-primaryGreen hover:underline flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {activeAssignments.length === 0 ? (
                  <div className="text-center py-8 text-mutedText">
                    <p className="text-sm">You currently have no active deliveries.</p>
                    <button
                      onClick={() => setActiveTab('AVAILABLE_DELIVERIES')}
                      className="mt-3 px-4 py-2 bg-forest text-white text-xs font-semibold rounded-xl hover:bg-primaryGreen transition-colors shadow-sm"
                    >
                      Browse Available Deliveries
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeAssignments.map((del) => (
                      <div
                        key={del.id}
                        className="p-4 rounded-xl border border-lightBorder bg-cream/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-darkText">Delivery #{del.id} — {del.foodName}</span>
                            <StatusBadge status={del.status || del.deliveryStatus || 'PENDING'} />
                          </div>
                          <p className="text-xs text-mutedText mt-1">
                            Pickup: <strong className="text-darkText">{del.pickupAddress}</strong> &rarr; Dropoff: <strong className="text-darkText">{del.deliveryAddress}</strong>
                          </p>
                          <div className="flex items-center space-x-3 mt-1.5 text-xs text-mutedText">
                            <span className="text-forest font-semibold">
                              Est. Distance: {del.distanceKm || del.estimatedDistanceKm || '12.4'} km
                            </span>
                            <span>•</span>
                            <span className="text-amber-800 font-medium">15 km Transport Policy Applied</span>
                          </div>
                        </div>

                        {/* Handover OTP or status advance button */}
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {(del.status === 'ASSIGNED' || del.deliveryStatus === 'ASSIGNED') && (
                            <button
                              onClick={() => handleUpdateStatus(del.id, 'PICKED_UP')}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Confirm Pickup
                            </button>
                          )}
                          {(del.status === 'PICKED_UP' || del.deliveryStatus === 'PICKED_UP' || del.status === 'IN_TRANSIT' || del.deliveryStatus === 'IN_TRANSIT') && (
                            <button
                              onClick={() => handleOpenOtpModal(del)}
                              className="px-3.5 py-1.5 bg-forest text-white rounded-lg text-xs font-semibold hover:bg-darkText transition-colors flex items-center space-x-1.5 shadow-sm"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-orangeAccent" />
                              <span>Verify Recipient OTP</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Vehicle details snapshot */}
              <div className="bg-white rounded-2xl p-6 border border-lightBorder shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Truck className="h-5 w-5 text-primaryGreen" />
                    <h3 className="font-serif font-bold text-lg text-darkText">Registered Vehicle</h3>
                  </div>

                  {vehicle ? (
                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-cream rounded-xl border border-lightBorder">
                        <span className="text-mutedText block text-[11px] uppercase tracking-wider">Type & Reg Number</span>
                        <span className="font-bold text-sm text-darkText">{vehicle.vehicleType} • {vehicle.registrationNumber}</span>
                      </div>
                      <div className="p-3 bg-cream rounded-xl border border-lightBorder">
                        <span className="text-mutedText block text-[11px] uppercase tracking-wider">Payload Capacity</span>
                        <span className="font-bold text-sm text-forest">{vehicle.capacity ?? vehicle.capacityValue} {vehicle.capacityUnit.toLowerCase()}</span>
                      </div>
                      <div className="p-3 bg-cream rounded-xl border border-lightBorder">
                        <span className="text-mutedText block text-[11px] uppercase tracking-wider">Service Radius</span>
                        <span className="font-bold text-sm text-darkText">{vehicle.serviceRadiusKm ?? 15} km coverage</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-cream text-center text-xs text-mutedText rounded-xl">
                      Vehicle details not registered yet.
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-lightBorder">
                  <button
                    onClick={() => setActiveTab('VEHICLE')}
                    className="w-full py-2 bg-cream hover:bg-softGreen/40 text-forest font-semibold text-xs rounded-xl border border-lightBorder transition-colors text-center"
                  >
                    Manage Vehicle Parameters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AVAILABLE DELIVERIES */}
        {activeTab === 'AVAILABLE_DELIVERIES' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-lightBorder shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-serif font-bold text-xl text-darkText">Available Volunteer Delivery Dispatches</h3>
                  <p className="text-xs text-mutedText mt-0.5">
                    Surplus food deliveries awaiting volunteer transport. Accepting an assignment locks it atomically to you.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-3 py-1 bg-softGreen text-forest rounded-full">
                    {availableDeliveries.length} Opportunities
                  </span>
                </div>
              </div>
            </div>

            {availableDeliveries.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-lightBorder">
                <Truck className="h-12 w-12 text-mutedText/40 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-lg text-darkText">No Pending Deliveries</h4>
                <p className="text-xs text-mutedText mt-1 max-w-md mx-auto">
                  All active surplus requests are currently assigned. Check back as new food allocations are requested by shelters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableDeliveries.map((del) => {
                  const dist = del.distanceKm || del.estimatedDistanceKm || 12.4;
                  const is15Km = dist <= 15;
                  return (
                    <div
                      key={del.id}
                      className="bg-white rounded-2xl border border-lightBorder shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-mono text-mutedText">Dispatch #{del.id}</span>
                            <h4 className="font-serif font-bold text-lg text-darkText mt-0.5">
                              {del.foodName} Delivery
                            </h4>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            is15Km ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {is15Km ? '≤ 15 km Priority' : '> 15 km Extended'}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2.5 text-xs">
                          <div className="p-3 bg-cream/60 rounded-xl border border-lightBorder/60">
                            <span className="font-bold text-forest uppercase tracking-wider text-[10px] block mb-0.5">
                              Pickup Location
                            </span>
                            <p className="font-medium text-darkText truncate">{del.pickupAddress}</p>
                          </div>

                          <div className="p-3 bg-cream/60 rounded-xl border border-lightBorder/60">
                            <span className="font-bold text-forest uppercase tracking-wider text-[10px] block mb-0.5">
                              Destination Shelter
                            </span>
                            <p className="font-medium text-darkText truncate">{del.deliveryAddress}</p>
                          </div>

                          <div className="flex justify-between py-1 text-mutedText">
                            <span>Estimated Road Distance:</span>
                            <strong className="text-darkText">{dist} km</strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-lightBorder flex items-center justify-between">
                        <button
                          onClick={() => {
                            setActiveTab('ROUTE_NAV');
                          }}
                          className="text-xs font-semibold text-primaryGreen hover:underline flex items-center space-x-1"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>View on Graph</span>
                        </button>

                        <button
                          onClick={() => handleAcceptDelivery(del.id)}
                          disabled={updatingDeliveryId === del.id}
                          className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-primaryGreen transition-colors shadow-sm disabled:opacity-50"
                        >
                          {updatingDeliveryId === del.id ? 'Accepting...' : 'Accept Delivery Run'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY ASSIGNMENTS */}
        {activeTab === 'MY_ASSIGNMENTS' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-lightBorder shadow-sm">
              <h3 className="font-serif font-bold text-xl text-darkText">My Accepted Assignments</h3>
              <p className="text-xs text-mutedText mt-0.5">
                Manage your accepted food dispatches. Advance statuses and complete handover by verifying the recipient's OTP.
              </p>
            </div>

            {myAssignments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-lightBorder">
                <Truck className="h-12 w-12 text-mutedText/40 mx-auto mb-3" />
                <p className="text-sm font-semibold text-darkText">No assignments assigned to you yet</p>
                <button
                  onClick={() => setActiveTab('AVAILABLE_DELIVERIES')}
                  className="mt-3 px-4 py-2 bg-forest text-white text-xs font-semibold rounded-xl hover:bg-primaryGreen"
                >
                  Browse Available Deliveries
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myAssignments.map((del) => {
                  const status = del.status || del.deliveryStatus || 'PENDING';
                  return (
                    <div key={del.id} className="bg-white rounded-2xl border border-lightBorder p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-lightBorder">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-base text-darkText">Delivery #{del.id} — {del.foodName}</span>
                            <StatusBadge status={status} />
                          </div>
                          <p className="text-xs text-mutedText mt-1">
                            Est. Road Distance: <strong>{del.distanceKm || del.estimatedDistanceKm || '12.4'} km</strong>
                          </p>
                        </div>

                        {/* Action buttons depending on state */}
                        <div className="flex items-center space-x-2">
                          {status === 'ASSIGNED' && (
                            <button
                              onClick={() => handleUpdateStatus(del.id, 'PICKED_UP')}
                              disabled={updatingDeliveryId === del.id}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                            >
                              Mark Picked Up
                            </button>
                          )}

                          {status === 'PICKED_UP' && (
                            <button
                              onClick={() => handleUpdateStatus(del.id, 'IN_TRANSIT')}
                              disabled={updatingDeliveryId === del.id}
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                            >
                              Mark In Transit
                            </button>
                          )}

                          {(status === 'PICKED_UP' || status === 'IN_TRANSIT') && (
                            <button
                              onClick={() => handleOpenOtpModal(del)}
                              className="px-4 py-2 bg-forest hover:bg-darkText text-white text-xs font-semibold rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
                            >
                              <KeyRound className="h-3.5 w-3.5 text-orangeAccent" />
                              <span>Verify Handover OTP</span>
                            </button>
                          )}

                          {status === 'DELIVERED' && (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              <span>Delivery Completed</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs">
                        <div className="p-3 bg-cream/60 rounded-xl border border-lightBorder/60">
                          <span className="font-bold text-forest uppercase tracking-wider text-[11px] block mb-1">
                            Pickup Origin
                          </span>
                          <p className="font-semibold text-darkText">{del.pickupAddress}</p>
                        </div>

                        <div className="p-3 bg-cream/60 rounded-xl border border-lightBorder/60">
                          <span className="font-bold text-forest uppercase tracking-wider text-[11px] block mb-1">
                            Dropoff Destination
                          </span>
                          <p className="font-semibold text-darkText">{del.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ROUTE NAVIGATION (DIJKSTRA) */}
        {activeTab === 'ROUTE_NAV' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-lightBorder shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-xl text-darkText">Dijkstra Shortest Route Engine</h3>
                  <p className="text-xs text-mutedText mt-1">
                    Calculate optimal road distances across regional hubs (Erode, Perundurai, Bhavani, Chithode, Gobichettipalayam).
                  </p>
                </div>
                <span className="px-3 py-1 bg-softGreen text-forest text-xs font-bold rounded-full">
                  Sample Road Graph
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-lightBorder shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                    Origin Node
                  </label>
                  <select
                    value={routeOrigin}
                    onChange={(e) => setRouteOrigin(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                  >
                    {roadNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.nodeName} ({n.areaName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                    Destination Node
                  </label>
                  <select
                    value={routeDest}
                    onChange={(e) => setRouteDest(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                  >
                    {roadNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.nodeName} ({n.areaName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    onClick={handleCalculateRoute}
                    disabled={calculatingRoute}
                    className="w-full py-2.5 bg-forest text-white font-semibold text-sm rounded-xl hover:bg-primaryGreen transition-colors shadow-sm disabled:opacity-50"
                  >
                    {calculatingRoute ? 'Computing...' : 'Calculate Optimal Path'}
                  </button>
                </div>
              </div>

              {activeRoute && (
                <div className="mt-6 pt-6 border-t border-lightBorder space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-cream rounded-xl border border-lightBorder">
                    <div>
                      <span className="text-xs text-mutedText block">Calculated Shortest Distance:</span>
                      <span className="text-2xl font-bold font-serif text-forest">
                        {activeRoute.totalDistanceKm} km
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-mutedText block">Policy Applicability:</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        activeRoute.totalDistanceKm <= 15 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {activeRoute.totalDistanceKm <= 15 ? '≤ 15 km Policy (Local Volunteer Dispatch)' : '> 15 km Extended Route'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-darkText uppercase tracking-wider mb-2">
                      Optimal Path Sequence ({activeRoute.orderedNodeNames.length} nodes):
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeRoute.orderedNodeNames.map((nodeName, index) => (
                        <React.Fragment key={index}>
                          <div className="px-3 py-1.5 bg-white border border-lightBorder rounded-lg text-xs font-semibold text-darkText shadow-sm">
                            {nodeName}
                          </div>
                          {index < activeRoute.orderedNodeNames.length - 1 && (
                            <span className="text-orangeAccent font-bold">&rarr;</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: VEHICLE DETAILS */}
        {activeTab === 'VEHICLE' && (
          <div className="max-w-2xl bg-white rounded-2xl p-6 border border-lightBorder shadow-sm space-y-6">
            <div>
              <h3 className="font-serif font-bold text-xl text-darkText">Volunteer Vehicle Parameters</h3>
              <p className="text-xs text-mutedText mt-1">
                Configure your vehicle type and carrying capacity to receive deliveries that fit your vehicle safely.
              </p>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                >
                  <option value="BICYCLE">Bicycle (Light cargo)</option>
                  <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                  <option value="AUTO">Auto Rickshaw (Three-wheeler)</option>
                  <option value="CAR">Car / Hatchback</option>
                  <option value="VAN">Van / Utility vehicle</option>
                  <option value="MINI_TRUCK">Mini Truck (Large cargo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. TN 33 AB 1234"
                  required
                  className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                    Payload Capacity
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                    Capacity Unit
                  </label>
                  <select
                    value={capacityUnit}
                    onChange={(e) => setCapacityUnit(e.target.value)}
                    className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                  >
                    <option value="PORTIONS">Portions</option>
                    <option value="KG">Kilograms (kg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText uppercase tracking-wider mb-1.5">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={serviceRadiusKm}
                  onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 border border-lightBorder rounded-xl text-sm focus:ring-2 focus:ring-primaryGreen focus:outline-none"
                />
                <span className="text-[11px] text-mutedText">
                  Deliveries beyond this radius will not appear in your dispatch queue.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingVehicle}
                  className="px-5 py-2.5 bg-forest text-white rounded-xl font-semibold text-sm hover:bg-primaryGreen transition-colors shadow-sm disabled:opacity-50"
                >
                  {savingVehicle ? 'Saving...' : 'Update Vehicle Parameters'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: IMPACT REWARDS */}
        {activeTab === 'REWARDS' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-lightBorder shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-darkText">Volunteer Community Recognition</h3>
                <p className="text-xs text-mutedText mt-0.5">
                  Tokens of appreciation for volunteer hours and verified food handovers in the Erode region.
                </p>
              </div>
              <div className="p-3 bg-cream rounded-xl border border-lightBorder flex items-center space-x-3">
                <Award className="h-6 w-6 text-orangeAccent" />
                <div>
                  <span className="text-xs text-mutedText block">Total Accrued Points</span>
                  <span className="text-xl font-bold font-serif text-forest">{totalPoints} Points</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((rew) => (
                <div key={rew.id} className="bg-white rounded-2xl border border-lightBorder p-5 shadow-sm space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-darkText">{rew.badgeName || 'Volunteer Impact Badge'}</h4>
                      <span className="text-xs font-bold text-emerald-600">+{rew.pointsAwarded ?? rew.pointsEarned ?? 20} pts</span>
                    </div>
                  </div>
                  <p className="text-xs text-mutedText leading-relaxed">{rew.notes || rew.reason || 'Awarded for reliable community food transport.'}</p>
                  <span className="text-[11px] text-mutedText block pt-2 border-t border-lightBorder/60">
                    Awarded: {new Date(rew.awardedAt || rew.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              ))}

              {rewards.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-lightBorder">
                  <Award className="h-12 w-12 text-mutedText/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-darkText">No badges awarded yet</p>
                  <p className="text-xs text-mutedText mt-1">
                    Complete your first delivery run and verify the recipient's OTP to earn points!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: NOTIFICATIONS */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="bg-white rounded-2xl border border-lightBorder shadow-sm overflow-hidden">
            <div className="p-6 border-b border-lightBorder flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-darkText">Volunteer Notifications</h3>
                <p className="text-xs text-mutedText mt-0.5">Alerts regarding assigned runs and handover verification.</p>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-12 text-center text-mutedText">
                <Bell className="h-10 w-10 text-mutedText/40 mx-auto mb-2" />
                <p className="text-sm">No notifications available.</p>
              </div>
            ) : (
              <div className="divide-y divide-lightBorder">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 flex items-start space-x-3 bg-white hover:bg-cream/30 transition-colors">
                    <div className="p-2 rounded-xl mt-0.5 bg-primaryGreen text-white">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-darkText">{notif.title}</span>
                        <span className="text-xs text-mutedText">
                          {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
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

        {/* TAB 8: PROFILE */}
        {activeTab === 'PROFILE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-lightBorder shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-darkText">Volunteer Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-mutedText block">Full Name</span>
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
                  <span className="text-xs text-mutedText block">Operating Base</span>
                  <span className="font-semibold text-darkText">{user?.address}, {user?.city}</span>
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

      {/* OTP HANDOVER VERIFICATION MODAL */}
      {otpVerifyModalOpen && targetDelivery && (
        <Modal
          isOpen={otpVerifyModalOpen}
          onClose={() => setOtpVerifyModalOpen(false)}
          title={`Verify Recipient OTP — Delivery #${targetDelivery.id}`}
        >
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-darkText">
            <div className="p-3 bg-cream rounded-xl border border-lightBorder text-xs space-y-1">
              <div>
                <span className="text-mutedText">Destination: </span>
                <span className="font-bold text-darkText">{targetDelivery.deliveryAddress}</span>
              </div>
              <p className="text-mutedText">
                Ask the recipient at the destination for their 6-digit handover code. Entering it here validates the delivery atomically in the database.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                Enter 6-Digit Handover OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full px-4 py-3 border-2 border-primaryGreen rounded-xl text-center text-3xl font-mono font-extrabold tracking-widest text-forest focus:outline-none"
              />
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-start space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                Verification prevents premature completion and automatically awards volunteer community points.
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setOtpVerifyModalOpen(false)}
                className="px-4 py-2 border border-lightBorder rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifyingOtp || inputOtp.length !== 6}
                className="px-5 py-2 bg-forest text-white rounded-xl text-xs font-semibold hover:bg-primaryGreen transition-colors shadow-sm disabled:opacity-50"
              >
                {verifyingOtp ? 'Verifying...' : 'Confirm Handover'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
