import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { volunteerApi, routesApi, notificationsApi, otpApi, authApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
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
  Compass
} from 'lucide-react';

export const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  // Core Volunteer States
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  // OTP Verification Modal
  const [otpVerifyModalOpen, setOtpVerifyModalOpen] = useState(false);
  const [targetDelivery, setTargetDelivery] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Status transition state
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState(null);

  // Route calculation in Dashboard
  const [roadNodes, setRoadNodes] = useState([]);
  const [routeOrigin, setRouteOrigin] = useState(1);
  const [routeDest, setRouteDest] = useState(2);
  const [activeRoute, setActiveRoute] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [toasts, setToasts] = useState([]);

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

      if (availRes.status === 'fulfilled') setAvailableDeliveries(availRes.value || []);
      if (myRes.status === 'fulfilled') setMyAssignments(myRes.value || []);
      if (vehRes.status === 'fulfilled' && vehRes.value) {
        setVehicle(vehRes.value);
      }
      if (rewRes.status === 'fulfilled') setRewards(rewRes.value || []);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value || []);
    } catch {
      // offline handling
    } finally {
      setLoading(false);
    }
  };

  const loadNodes = async () => {
    try {
      const nodes = await routesApi.getNodes();
      setRoadNodes(nodes || []);
      if (nodes && nodes.length >= 2) {
        setRouteOrigin(nodes[0].id);
        setRouteDest(nodes[1].id);
      }
    } catch {
      // ignore
    }
  };

  const addToast = (type, message) => {
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
    } catch (err) {
      addToast('error', err.message || 'Failed to toggle availability');
    }
  };

  // Accept Delivery
  const handleAcceptDelivery = async (deliveryId) => {
    try {
      setUpdatingDeliveryId(deliveryId);
      const accepted = await volunteerApi.acceptDelivery(deliveryId);
      addToast('success', `Delivery #${accepted.id} accepted! Added to your active runs.`);
      await loadData();
      setActiveTab('MY_ASSIGNMENTS');
    } catch (err) {
      addToast('error', err.message || 'Unable to accept this delivery');
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  // Update Delivery Status (PICKED_UP / IN_TRANSIT)
  const handleUpdateStatus = async (deliveryId, nextStatus) => {
    try {
      setUpdatingDeliveryId(deliveryId);
      await volunteerApi.updateStatus(deliveryId, nextStatus);
      addToast('success', `Status updated to ${nextStatus.replace(/_/g, ' ')}`);
      await loadData();
    } catch (err) {
      addToast('error', err.message || 'Failed to update delivery status');
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  // Verify OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!targetDelivery || !inputOtp) return;
    try {
      setVerifyingOtp(true);
      const ok = await otpApi.verifyOtp(targetDelivery.id, inputOtp.trim());
      if (ok) {
        addToast('success', `Delivery #${targetDelivery.id} verified and DELIVERED! Impact points awarded.`);
        setOtpVerifyModalOpen(false);
        setInputOtp('');
        setTargetDelivery(null);
        await loadData();
      } else {
        addToast('error', 'Incorrect OTP code. Please verify with the recipient.');
      }
    } catch (err) {
      addToast('error', err.message || 'Invalid or expired OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Calculate Dijkstra Route
  const handleCalculateRoute = async () => {
    if (routeOrigin === routeDest) {
      addToast('error', 'Origin and destination must be different nodes.');
      return;
    }
    try {
      setCalculatingRoute(true);
      const res = await routesApi.calculateRoute(routeOrigin, routeDest);
      setActiveRoute(res);
      addToast('info', `Optimal route found: ${res.totalDistanceKm} km across ${res.orderedNodeNames?.length || 0} nodes`);
    } catch (err) {
      addToast('error', err.message || 'No road route found between selected points');
    } finally {
      setCalculatingRoute(false);
    }
  };

  const handleChangePassword = async (e) => {
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
    } catch (err) {
      addToast('error', err.message || 'Failed to update password');
    }
  };

  const completedDeliveries = myAssignments.filter((d) => (d.status ?? d.deliveryStatus) === 'DELIVERED').length;
  const activeRuns = myAssignments.filter((d) => (d.status ?? d.deliveryStatus) !== 'DELIVERED' && (d.status ?? d.deliveryStatus) !== 'CANCELLED');
  const points = rewards.reduce((acc, r) => acc + Number(r.points || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-lightBorder shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primaryGreen">Volunteer Portal</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
            {user?.fullName}
          </h1>
          <p className="text-xs text-mutedText mt-0.5">
            {vehicle?.vehicleType || 'Motorcycle'} Volunteer • {user?.address}, {user?.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs border transition-colors ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-gray-100 text-gray-600 border-gray-300'
            }`}
          >
            {isAvailable ? '● ON DUTY (Available)' : '○ OFF DUTY'}
          </button>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-lightBorder text-mutedText hover:text-forest hover:bg-cream transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-lightBorder text-xs font-semibold">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: Truck },
          { key: 'AVAILABLE_DELIVERIES', label: `Available Runs (${availableDeliveries.length})`, icon: Clock },
          { key: 'MY_ASSIGNMENTS', label: `My Runs (${activeRuns.length})`, icon: CheckCircle2 },
          { key: 'ROUTE_NAV', label: 'Dijkstra Map Route', icon: Navigation },
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
              title="Active Runs"
              value={activeRuns.length}
              subtitle="Pickups & deliveries in progress"
              icon={Truck}
              iconBgColor="bg-amber-50"
              iconColor="text-orangeAccent"
            />
            <StatCard
              title="Completed Deliveries"
              value={completedDeliveries}
              subtitle="Safely delivered to shelters"
              icon={CheckCircle2}
              iconBgColor="bg-emerald-50"
              iconColor="text-primaryGreen"
            />
            <StatCard
              title="Impact Points"
              value={`${points || completedDeliveries * 50} pts`}
              subtitle="Community appreciation score"
              icon={Award}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-700"
            />
          </div>

          <div className="card-warm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-forest">Ready to accept a meal delivery?</h3>
              <p className="text-xs text-mutedText mt-1">
                Help transport surplus food from local donors to recipient shelters within our 15 km community radius.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('AVAILABLE_DELIVERIES')}
              className="px-5 py-2.5 bg-forest hover:bg-primaryGreen text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              View Available Runs →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABLE RUNS */}
      {activeTab === 'AVAILABLE_DELIVERIES' && (
        <div className="card-warm p-6 space-y-4">
          <div className="border-b border-lightBorder pb-3">
            <h2 className="font-serif text-xl font-bold text-forest">Available Delivery Runs</h2>
            <p className="text-xs text-mutedText mt-0.5">
              Deliveries awaiting a volunteer driver in the Erode region.
            </p>
          </div>

          {availableDeliveries.length === 0 ? (
            <p className="text-xs text-mutedText py-8 text-center">No unassigned runs available right now.</p>
          ) : (
            <div className="space-y-3">
              {availableDeliveries.map((del) => (
                <div key={del.id} className="p-4 rounded-xl border border-lightBorder bg-cream-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-darkText text-sm">Delivery #{del.id}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-softGreen text-forest">
                        {del.distanceKm || 5.0} km
                      </span>
                    </div>
                    <p className="text-xs text-mutedText">
                      <strong>Pickup:</strong> {del.pickupAddress}
                    </p>
                    <p className="text-xs text-mutedText">
                      <strong>Drop:</strong> {del.deliveryAddress}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptDelivery(del.id)}
                    disabled={updatingDeliveryId === del.id}
                    className="px-4 py-2 bg-forest hover:bg-primaryGreen text-white text-xs font-semibold rounded-xl shadow-sm transition-all shrink-0"
                  >
                    {updatingDeliveryId === del.id ? 'Accepting...' : 'Accept Delivery Run'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY RUNS */}
      {activeTab === 'MY_ASSIGNMENTS' && (
        <div className="card-warm p-6 space-y-4">
          <div className="border-b border-lightBorder pb-3">
            <h2 className="font-serif text-xl font-bold text-forest">My Active Delivery Runs</h2>
            <p className="text-xs text-mutedText mt-0.5">
              Manage your assigned runs, advance status, and verify the recipient's OTP to seal handover.
            </p>
          </div>

          {myAssignments.length === 0 ? (
            <p className="text-xs text-mutedText py-8 text-center">You have no active runs right now.</p>
          ) : (
            <div className="space-y-4">
              {myAssignments.map((del) => {
                const status = del.status ?? del.deliveryStatus;
                return (
                  <div key={del.id} className="p-5 rounded-2xl border border-lightBorder bg-white shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-forest">Run #{del.id}</span>
                      <StatusBadge status={status} />
                    </div>

                    <div className="text-xs text-mutedText space-y-1">
                      <p><strong>Pickup From:</strong> {del.pickupAddress}</p>
                      <p><strong>Deliver To:</strong> {del.deliveryAddress}</p>
                      <p><strong>Estimated Road Distance:</strong> {del.distanceKm || 5.0} km</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-lightBorder">
                      {status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleUpdateStatus(del.id, 'PICKED_UP')}
                          className="px-3.5 py-1.5 bg-purple-700 text-white rounded-lg text-xs font-semibold hover:bg-purple-800"
                        >
                          Mark Picked Up
                        </button>
                      )}
                      {status === 'PICKED_UP' && (
                        <button
                          onClick={() => handleUpdateStatus(del.id, 'IN_TRANSIT')}
                          className="px-3.5 py-1.5 bg-sky-700 text-white rounded-lg text-xs font-semibold hover:bg-sky-800"
                        >
                          Mark In Transit
                        </button>
                      )}
                      {(status === 'PICKED_UP' || status === 'IN_TRANSIT') && (
                        <button
                          onClick={() => {
                            setTargetDelivery(del);
                            setInputOtp('');
                            setOtpVerifyModalOpen(true);
                          }}
                          className="px-4 py-1.5 bg-forest text-white rounded-lg text-xs font-bold hover:bg-primaryGreen shadow-sm flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4 text-orangeAccent" />
                          <span>Verify Recipient OTP & Complete</span>
                        </button>
                      )}
                      {status === 'DELIVERED' && (
                        <span className="text-xs font-bold text-primaryGreen flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Delivered & Verified
                        </span>
                      )}
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
        <div className="card-warm p-6 space-y-6">
          <div className="border-b border-lightBorder pb-3">
            <h3 className="font-serif font-bold text-xl text-forest">Dijkstra Shortest Route Engine</h3>
            <p className="text-xs text-mutedText mt-1">
              Calculate optimal road distances across regional hubs (Erode, Perundurai, Bhavani, Chithode, Gobichettipalayam).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
            <div>
              <label className="block font-bold text-darkText uppercase tracking-wider mb-1.5">
                Origin Node
              </label>
              <select
                value={routeOrigin}
                onChange={(e) => setRouteOrigin(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-lightBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              >
                {roadNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nodeName} ({n.areaName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-darkText uppercase tracking-wider mb-1.5">
                Destination Node
              </label>
              <select
                value={routeDest}
                onChange={(e) => setRouteDest(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-lightBorder rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest"
              >
                {roadNodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.nodeName} ({n.areaName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculateRoute}
              disabled={calculatingRoute}
              className="py-2.5 bg-forest text-white font-semibold text-sm rounded-xl hover:bg-primaryGreen transition-colors shadow-sm disabled:opacity-50"
            >
              {calculatingRoute ? 'Computing Dijkstra...' : 'Calculate Optimal Path'}
            </button>
          </div>

          {activeRoute && (
            <div className="p-5 bg-cream-50 rounded-2xl border border-lightBorder space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-forest text-sm">Optimal Dijkstra Route</span>
                <span className="font-bold text-orangeAccent text-sm">{activeRoute.totalDistanceKm} km</span>
              </div>
              <p className="text-mutedText">
                <strong>Waypoints:</strong> {activeRoute.orderedNodeNames?.join(' → ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="max-w-xl card-warm p-6 space-y-6 text-xs">
          <h3 className="font-serif font-bold text-lg text-forest border-b border-lightBorder pb-2">
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
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
      )}

      {/* OTP VERIFICATION MODAL */}
      <Modal
        isOpen={otpVerifyModalOpen}
        onClose={() => setOtpVerifyModalOpen(false)}
        title="Verify Recipient Handover OTP"
      >
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-xs text-left">
          <p className="text-mutedText">
            Ask the recipient for the 6-digit verification code shown on their dashboard upon handing over the meals:
          </p>

          <div>
            <label className="font-bold uppercase tracking-wider text-darkText block mb-1">
              Enter 6-Digit Recipient OTP *
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={inputOtp}
              onChange={(e) => setInputOtp(e.target.value)}
              placeholder="e.g. 482910"
              className="w-full px-4 py-3 border-2 border-forest/30 rounded-xl font-mono text-center text-2xl tracking-widest font-bold focus:outline-none focus:border-forest"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOtpVerifyModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-lightBorder font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifyingOtp || inputOtp.length < 6}
              className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-primaryGreen text-white font-bold disabled:opacity-50"
            >
              {verifyingOtp ? 'Verifying...' : 'Verify & Complete Run'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
