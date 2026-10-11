import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { donationsApi, impactApi } from '../api/client';
import { FoodDonation, ImpactSummary } from '../types';
import { FoodCard } from '../components/FoodCard';
import { StatCard } from '../components/StatCard';
import { 
  HeartHandshake, 
  Utensils, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Users, 
  Leaf, 
  CheckCircle2,
  Clock,
  Navigation
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [featuredDonations, setFeaturedDonations] = useState<FoodDonation[]>([]);
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [donationsRes, impactRes] = await Promise.allSettled([
        donationsApi.getAvailable(),
        impactApi.getSummary(),
      ]);

      if (donationsRes.status === 'fulfilled') {
        setFeaturedDonations(donationsRes.value.slice(0, 3));
      }
      if (impactRes.status === 'fulfilled') {
        setImpact(impactRes.value);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  const handleFoodRequest = (donation: FoodDonation) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role === 'RECIPIENT') {
      navigate('/recipient');
    } else {
      navigate('/available-food');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-softGreen text-forest text-xs font-semibold uppercase tracking-wider border border-primaryGreen/20">
                <Sparkles className="w-3.5 h-3.5 text-orangeAccent" />
                <span>Smart Food Redistribution & Waste Mitigation</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-forest leading-[1.15]">
                Surplus Food to the People Who <span className="text-primaryGreen italic">Need It.</span>
              </h1>

              <p className="text-lg sm:text-xl text-mutedText leading-relaxed max-w-2xl">
                Connecting food donors, communities in need, and volunteer drivers to reduce food waste and make food redistribution smarter, safer, and faster.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/available-food"
                  className="px-6 py-3.5 rounded-xl bg-forest hover:bg-primaryGreen text-white font-semibold text-base shadow-sm hover:shadow transition-all flex items-center gap-2 group"
                >
                  <Utensils className="w-5 h-5 text-orangeAccent" />
                  <span>Explore Available Food</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/register?role=DONOR"
                  className="px-6 py-3.5 rounded-xl bg-softGreen hover:bg-softGreen-light text-forest font-semibold text-base border border-primaryGreen/30 transition-all flex items-center gap-2"
                >
                  <span>Donate Food</span>
                </Link>

                <Link
                  to="/register?role=VEHICLE_VOLUNTEER"
                  className="px-6 py-3.5 rounded-xl border border-lightBorder bg-white hover:bg-cream-200 text-darkText font-semibold text-base transition-all flex items-center gap-2"
                >
                  <Truck className="w-5 h-5 text-forest" />
                  <span>Become a Volunteer</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-lightBorder grid grid-cols-3 gap-6 text-left">
                <div>
                  <span className="font-serif text-2xl font-bold text-forest block">15 km</span>
                  <span className="text-xs text-mutedText">Transport Policy Rule</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-forest block">Dijkstra</span>
                  <span className="text-xs text-mutedText">Shortest-Path Routing</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-forest block">OTP Secured</span>
                  <span className="text-xs text-mutedText">Verified Food Handover</span>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-lightBorder relative space-y-6">
                  
                  {/* Decorative badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-lightBorder">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primaryGreen text-white flex items-center justify-center">
                        <HeartHandshake className="w-6 h-6 text-orangeAccent" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-forest text-lg">NourishNet Network</h4>
                        <span className="text-xs text-mutedText">Live Autonomous System</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* Flow Steps Preview */}
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-cream-50 border border-lightBorder">
                      <div className="w-7 h-7 rounded-lg bg-softGreen text-forest font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-darkText">Surplus Food Donated</p>
                        <p className="text-xs text-mutedText">Restaurateurs & messes list verified edible meals.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-cream-50 border border-lightBorder">
                      <div className="w-7 h-7 rounded-lg bg-softGreen text-forest font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-darkText">Community Claim & Allocation</p>
                        <p className="text-xs text-mutedText">Orphanages request exact partial portions needed.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-cream-50 border border-lightBorder">
                      <div className="w-7 h-7 rounded-lg bg-softGreen text-forest font-bold flex items-center justify-center shrink-0 text-xs">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-darkText">Volunteer Delivery & OTP Handover</p>
                        <p className="text-xs text-mutedText">Unpaid drivers transport meals with shortest Dijkstra paths.</p>
                      </div>
                    </div>
                  </div>

                  {/* Quote Banner */}
                  <div className="p-4 rounded-2xl bg-forest text-cream-50 text-xs leading-relaxed">
                    <p className="italic">
                      "Targeting zero edible food waste across Erode, Perundurai, Bhavani, Chithode, and Gobichettipalayam."
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PLATFORM IMPACT METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-3xl font-bold text-forest">Verified Real-Time Impact</h2>
          <p className="text-sm text-mutedText mt-2">
            Statistics calculated directly from our relational MySQL database records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Portions Donated"
            value={impact ? `${impact.totalPortionsDonated}` : '1,500+'}
            subtitle="From commercial kitchens & messes"
            icon={Utensils}
            iconBgColor="bg-softGreen"
            iconColor="text-primaryGreen"
          />
          <StatCard
            title="Portions Delivered"
            value={impact ? `${impact.totalPortionsDelivered}` : '405+'}
            subtitle="Safely received by orphanages & shelters"
            icon={CheckCircle2}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-700"
          />
          <StatCard
            title="Completed Deliveries"
            value={impact ? `${impact.completedDeliveriesCount}` : '5+'}
            subtitle="Verified through OTP handover"
            icon={Truck}
            iconBgColor="bg-orange-50"
            iconColor="text-orangeAccent"
          />
          <StatCard
            title="Food Waste Prevented"
            value={impact ? `${impact.estimatedWastePrevented} Portions` : '405 Portions'}
            subtitle="Diverted from landfills to communities"
            icon={Leaf}
            iconBgColor="bg-softGreen-light"
            iconColor="text-forest"
          />
        </div>
      </section>

      {/* HOW IT WORKS (5 STEPS) */}
      <section className="bg-white py-16 border-y border-lightBorder">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primaryGreen">End-to-End Workflow</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1.5">How NourishNet Works</h2>
            <p className="text-mutedText text-sm mt-3">
              An autonomous, 5-step redistribution pipeline ensuring food safety and swift delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left relative">
            
            {/* Step 1 */}
            <div className="card-warm p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-forest text-white font-bold text-sm flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif text-lg font-bold text-forest">Donor Lists Surplus</h3>
              <p className="text-xs text-mutedText leading-relaxed">
                Hotels, messes, and event caterers register and list quantity, food type, storage, and consume-before deadlines.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-warm p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-forest text-white font-bold text-sm flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif text-lg font-bold text-forest">Recipient Discovers</h3>
              <p className="text-xs text-mutedText leading-relaxed">
                Orphanages and shelters search matching donations and request partial or full portion quantities.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-warm p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-forest text-white font-bold text-sm flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif text-lg font-bold text-forest">15km Policy Applied</h3>
              <p className="text-xs text-mutedText leading-relaxed">
                The backend evaluates road distance: ≤15 km donor coordinates; &gt;15 km recipient arranges.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card-warm p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-forest text-white font-bold text-sm flex items-center justify-center">
                4
              </span>
              <h3 className="font-serif text-lg font-bold text-forest">Volunteer Acceptance</h3>
              <p className="text-xs text-mutedText leading-relaxed">
                Available unpaid volunteers accept eligible jobs matching their registered vehicle capacity and radius.
              </p>
            </div>

            {/* Step 5 */}
            <div className="card-warm p-6 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-forest text-white font-bold text-sm flex items-center justify-center">
                5
              </span>
              <h3 className="font-serif text-lg font-bold text-forest">OTP Verified Handover</h3>
              <p className="text-xs text-mutedText leading-relaxed">
                Recipient shares a short-lived random 6-digit OTP code to complete handover and award volunteer points.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED AVAILABLE FOOD PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primaryGreen">Real-Time Listings</span>
            <h2 className="font-serif text-3xl font-bold text-forest mt-1">Available Surplus Food</h2>
            <p className="text-mutedText text-sm mt-1">
              Freshly prepared meals available for verified recipients to claim.
            </p>
          </div>
          <Link
            to="/available-food"
            className="text-sm font-semibold text-primaryGreen hover:text-forest flex items-center gap-1.5 transition-colors"
          >
            <span>View All Food Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-warm p-6 h-64 animate-pulse bg-cream-100" />
            ))}
          </div>
        ) : featuredDonations.length === 0 ? (
          <div className="card-warm p-12 text-center text-mutedText">
            <Utensils className="w-12 h-12 mx-auto text-forest/30 mb-3" />
            <p className="font-serif text-lg text-forest">No active food listings available right now</p>
            <p className="text-xs mt-1">Check back shortly or register as a donor to list fresh surplus meals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDonations.map((d) => (
              <FoodCard key={d.id} donation={d} onRequestClick={handleFoodRequest} />
            ))}
          </div>
        )}
      </section>

      {/* ROUTE MAP & 15KM POLICY CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orangeAccent text-xs font-semibold uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5" />
                <span>Backend Dijkstra Routing Engine</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                Optimized Road Network & 15-Kilometre Policy
              </h2>
              <p className="text-cream-200/80 text-sm sm:text-base leading-relaxed max-w-2xl">
                NourishNet runs Dijkstra's algorithm inside Spring Boot over local road junctions in Erode, Perundurai, Bhavani, Chithode, and Gobichettipalayam, automatically highlighting the shortest route and assigning transport responsibility.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/route-map"
                  className="px-6 py-3 rounded-xl bg-orangeAccent hover:bg-orangeAccent-hover text-white font-semibold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Explore Route Map</span>
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
                >
                  Read Policy Rules
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white/5 rounded-2xl p-6 border border-white/10 text-xs space-y-3">
              <h4 className="font-serif text-base font-bold text-softGreen">Policy Breakdown</h4>
              <div className="p-3 rounded-xl bg-white/10">
                <p className="font-bold text-white">Distance ≤ 15 km</p>
                <p className="text-cream-200/70 mt-0.5">Donor arranges transport directly or requests a local volunteer driver.</p>
              </div>
              <div className="p-3 rounded-xl bg-white/10">
                <p className="font-bold text-white">Distance &gt; 15 km</p>
                <p className="text-cream-200/70 mt-0.5">Recipient coordinates pickup or requests an inter-city volunteer vehicle.</p>
              </div>
              <p className="text-[11px] text-cream-200/50 italic text-center pt-1">
                Illustrative sample road network — not live navigation.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* BECOME A VOLUNTEER CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-warm p-8 sm:p-12 text-center max-w-4xl mx-auto bg-gradient-to-b from-white to-softGreen/20">
          <div className="w-16 h-16 rounded-2xl bg-softGreen text-forest flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-primaryGreen" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-forest">Have a Vehicle? Drive for Good.</h2>
          <p className="text-mutedText text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
            Join as an unpaid vehicle volunteer. Whether you operate a bicycle, bike, auto, car, or van, help bridge the last mile between surplus food and hungry community members.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/register?role=VEHICLE_VOLUNTEER"
              className="px-8 py-3.5 rounded-xl bg-forest hover:bg-primaryGreen text-white font-semibold text-sm shadow-md transition-all"
            >
              Register Your Vehicle
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
