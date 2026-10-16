import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { donationsApi, allocationsApi } from '../api/client';
import { FoodCard } from '../components/FoodCard';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { 
  Search, 
  Utensils, 
  Clock, 
  Truck, 
  ArrowUpDown 
} from 'lucide-react';

export const AvailableFoodPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDiet, setSelectedDiet] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');
  const [expiringSoonOnly, setExpiringSoonOnly] = useState(false);
  const [sortBy, setSortBy] = useState('URGENCY');

  // Request modal state
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState(10);
  const [estimatedDistance, setEstimatedDistance] = useState(5.5);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await donationsApi.getAvailable();
      setDonations(data || []);
    } catch (err) {
      addToast('error', err.message || 'Could not load available food items');
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

  const handleOpenRequest = (donation) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'RECIPIENT') {
      addToast('info', 'Only registered Recipients (Shelters, Orphanages) can claim portions.');
      return;
    }
    setSelectedDonation(donation);
    setRequestQuantity(Math.min(25, Number(donation.remainingQuantity)));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    if (requestQuantity <= 0) {
      addToast('error', 'Requested quantity must be greater than zero');
      return;
    }
    if (requestQuantity > Number(selectedDonation.remainingQuantity)) {
      addToast('error', `Cannot claim more than ${selectedDonation.remainingQuantity} available portions`);
      return;
    }

    try {
      setSubmittingRequest(true);
      await allocationsApi.request({
        donationId: selectedDonation.id,
        requestedQuantity: requestQuantity,
        distanceKm: estimatedDistance,
      });

      addToast('success', `Successfully claimed ${requestQuantity} portions of ${selectedDonation.foodName}!`);
      setSelectedDonation(null);
      loadDonations();
    } catch (err) {
      addToast('error', err.message || 'Failed to submit allocation request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Filter & sorting pipeline
  const filteredDonations = donations
    .filter((d) => {
      const matchSearch =
        (d.foodName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.donorOrganizationName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.pickupAddress || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || d.foodCategory === selectedCategory;

      const matchDiet = selectedDiet === 'ALL' || d.foodType === selectedDiet;
      const matchState = selectedState === 'ALL' || d.stateType === selectedState;
      const matchExpiring = !expiringSoonOnly || ((d.minutesRemaining ?? 999) < 180 && (d.minutesRemaining ?? 0) > 0);

      return matchSearch && matchCategory && matchDiet && matchState && matchExpiring;
    })
    .sort((a, b) => {
      if (sortBy === 'URGENCY') {
        return (a.minutesRemaining ?? 999) - (b.minutesRemaining ?? 999);
      }
      if (sortBy === 'QUANTITY') {
        return Number(b.remainingQuantity || 0) - Number(a.remainingQuantity || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const categories = [
    { label: 'All Categories', value: 'ALL' },
    { label: 'Rice & Meals', value: 'RICE_AND_MEALS' },
    { label: 'Bread & Bakery', value: 'BREAD_AND_BAKERY' },
    { label: 'Fruits & Veg', value: 'FRUITS_AND_VEGETABLES' },
    { label: 'Packaged Food', value: 'PACKAGED_FOOD' },
    { label: 'Snacks', value: 'SNACKS' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Toast toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-lightBorder pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Available Surplus Food
          </h1>
          <p className="text-mutedText text-sm mt-1">
            Real-time surplus food listings ready for recipient claim and redistribution in Erode.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-softGreen text-forest border border-softGreen">
          <Utensils className="w-4 h-4 text-primaryGreen" />
          <span>{donations.length} Active Listings</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-warm p-5 space-y-4">
        
        {/* Top search & sort row */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-mutedText" />
            <input
              type="text"
              placeholder="Search by food name, donor restaurant, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-lightBorder bg-cream-50 text-darkText text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-mutedText whitespace-nowrap">
              <ArrowUpDown className="w-4 h-4" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-lightBorder bg-cream-50 text-darkText text-sm font-medium focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <option value="URGENCY">Urgency (Consume Deadline)</option>
              <option value="QUANTITY">Highest Quantity</option>
              <option value="NEWEST">Newly Listed</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setSelectedCategory(c.value)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.value
                  ? 'bg-forest text-white'
                  : 'bg-cream-100 text-mutedText hover:bg-cream-200 hover:text-darkText'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Sub-filters (Diet, State, Expiring Soon) */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-lightBorder/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-mutedText font-semibold">Diet:</span>
            {['ALL', 'VEGETARIAN', 'NON_VEGETARIAN'].map((diet) => (
              <button
                key={diet}
                onClick={() => setSelectedDiet(diet)}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  selectedDiet === diet ? 'bg-forest text-white' : 'bg-cream-100 text-mutedText hover:bg-cream-200'
                }`}
              >
                {diet === 'ALL' ? 'Any' : diet === 'VEGETARIAN' ? 'Veg Only' : 'Non-Veg'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-mutedText font-semibold">Type:</span>
            {['ALL', 'COOKED', 'PACKAGED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  selectedState === st ? 'bg-forest text-white' : 'bg-cream-100 text-mutedText hover:bg-cream-200'
                }`}
              >
                {st === 'ALL' ? 'Any' : st === 'COOKED' ? 'Cooked' : 'Packaged'}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer ml-auto text-darkText font-medium">
            <input
              type="checkbox"
              checked={expiringSoonOnly}
              onChange={(e) => setExpiringSoonOnly(e.target.checked)}
              className="rounded text-forest focus:ring-forest w-4 h-4"
            />
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orangeAccent" />
              Expiring Soon (&lt; 3h)
            </span>
          </label>
        </div>

      </div>

      {/* Grid of Food Listings */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-warm p-6 h-72 animate-pulse bg-cream-100" />
          ))}
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="card-warm p-16 text-center space-y-3">
          <Utensils className="w-12 h-12 text-forest/20 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-forest">No matching food donations found</h3>
          <p className="text-sm text-mutedText max-w-sm mx-auto">
            Try resetting your filters or search keywords to browse all available surplus listings.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedDiet('ALL');
              setSelectedState('ALL');
              setExpiringSoonOnly(false);
            }}
            className="text-xs font-semibold text-primaryGreen hover:underline mt-2 inline-block"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((d) => (
            <FoodCard key={d.id} donation={d} onRequestClick={handleOpenRequest} />
          ))}
        </div>
      )}

      {/* REQUEST PORTIONS MODAL */}
      {selectedDonation && (
        <Modal
          isOpen={!!selectedDonation}
          onClose={() => setSelectedDonation(null)}
          title={`Claim Portions: ${selectedDonation.foodName}`}
        >
          <form onSubmit={handleSubmitRequest} className="space-y-5 text-left">
            <div className="p-3.5 rounded-xl bg-cream-50 border border-lightBorder text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-mutedText">Donor Kitchen:</span>
                <span className="font-semibold text-darkText">{selectedDonation.donorOrganizationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Available Portions:</span>
                <span className="font-bold text-forest">
                  {selectedDonation.remainingQuantity} {selectedDonation.quantityUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mutedText">Consume-Before:</span>
                <span className="font-medium text-darkText">
                  {new Date(selectedDonation.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-mutedText">
                  Portions to Claim
                </label>
                <span className="text-xs font-bold text-forest">
                  {requestQuantity} {selectedDonation.quantityUnit}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={Number(selectedDonation.remainingQuantity)}
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(Number(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-mutedText mt-1">
                <span>1 portion</span>
                <span>{selectedDonation.remainingQuantity} portions</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Truck className="w-4 h-4 text-orangeAccent shrink-0 mt-0.5" />
              <span>
                <strong>15 km Transport Rule:</strong> Under 15 km, donor/volunteers deliver. Over 15 km, recipient self-collects.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setSelectedDonation(null)}
                className="px-4 py-2 border border-lightBorder rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-5 py-2 bg-forest hover:bg-primaryGreen text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {submittingRequest ? 'Claiming...' : 'Confirm Claim'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
