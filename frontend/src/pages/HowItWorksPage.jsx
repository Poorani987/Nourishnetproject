import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  Utensils, 
  Truck, 
  KeyRound, 
  Leaf, 
  Clock 
} from 'lucide-react';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-left">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-primaryGreen">System Guide & Architecture</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-forest">
          How NourishNet Works
        </h1>
        <p className="text-mutedText text-base leading-relaxed">
          An autonomous platform connecting food surplus to community hunger through verifiable workflows and shortest-path road routing.
        </p>
      </div>

      {/* SECTION 1: THE THREE ROLES */}
      <section className="space-y-6">
        <div className="border-b border-lightBorder pb-3">
          <h2 className="font-serif text-2xl font-bold text-forest">1. Three Coordinated Roles</h2>
          <p className="text-xs text-mutedText mt-1">
            Autonomous peer coordination connecting donors, recipients, and volunteer drivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-warm p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-softGreen text-forest flex items-center justify-center">
              <Utensils className="w-5 h-5 text-primaryGreen" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest">Food Donors</h3>
            <p className="text-xs text-mutedText leading-relaxed">
              Restaurants, hotels, college messes, and banquet caterers. List surplus meals with simple portion counts and freshness deadlines in seconds.
            </p>
          </div>

          <div className="card-warm p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orangeAccent flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest">Recipients</h3>
            <p className="text-xs text-mutedText leading-relaxed">
              Shelters, orphanages, old age homes, and charity pantries. Browse available meals and claim partial or full portions with an instant verification OTP.
            </p>
          </div>

          <div className="card-warm p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-forest">Vehicle Volunteers</h3>
            <p className="text-xs text-mutedText leading-relaxed">
              Civic individuals offering personal vehicles (motorcycle, auto, car, van). Accept delivery runs, follow shortest Dijkstra routes, and verify handovers.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: 15KM TRANSPORT POLICY */}
      <section className="space-y-6">
        <div className="border-b border-lightBorder pb-3">
          <h2 className="font-serif text-2xl font-bold text-forest">2. The 15-Kilometre Transport Policy</h2>
          <p className="text-xs text-mutedText mt-1">
            Governs transport responsibility based on the measured road network distance between donor and recipient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-warm p-6 bg-emerald-50/50 border-emerald-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Route Distance ≤ 15 km</span>
            <h3 className="font-serif text-xl font-bold text-forest">Donor / Local Volunteer</h3>
            <p className="text-xs text-darkText/80 leading-relaxed">
              For local transfers of 15 km or less, the food donor coordinates local delivery directly or an available local volunteer driver steps in.
            </p>
          </div>

          <div className="card-warm p-6 bg-orange-50/50 border-orange-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-800">Route Distance &gt; 15 km</span>
            <h3 className="font-serif text-xl font-bold text-forest">Recipient Arranged Pickup</h3>
            <p className="text-xs text-darkText/80 leading-relaxed">
              For distances exceeding 15 km, the recipient coordinates vehicle pickup or requests an available long-distance volunteer driver.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: DIJKSTRA ROUTING */}
      <section className="space-y-6">
        <div className="border-b border-lightBorder pb-3">
          <h2 className="font-serif text-2xl font-bold text-forest">3. Dijkstra Shortest-Path Algorithm</h2>
          <p className="text-xs text-mutedText mt-1">
            Engineered natively in Java Spring Boot using a weighted graph over Erode regional road nodes and edges.
          </p>
        </div>

        <div className="card-warm p-6 space-y-4">
          <p className="text-sm text-darkText leading-relaxed">
            Rather than relying on third-party commercial navigation, NourishNet implements Dijkstra's algorithm inside the backend using relational tables:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-cream-50 rounded-xl border border-lightBorder">
              <span className="font-bold text-forest block mb-1">road_nodes</span>
              <span>11 Geographic vertices including Erode, Perundurai, Chithode, Bhavani, and Gobichettipalayam.</span>
            </div>
            <div className="p-3 bg-cream-50 rounded-xl border border-lightBorder">
              <span className="font-bold text-forest block mb-1">road_edges</span>
              <span>Bidirectional weighted edges storing road names and surveyed distances in kilometres.</span>
            </div>
            <div className="p-3 bg-cream-50 rounded-xl border border-lightBorder">
              <span className="font-bold text-forest block mb-1">Min-Heap Execution</span>
              <span>PriorityQueue selects minimum distances, returning ordered hops and distance sums.</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DELIVERY WORKFLOW & OTP */}
      <section className="space-y-6">
        <div className="border-b border-lightBorder pb-3">
          <h2 className="font-serif text-2xl font-bold text-forest">4. Delivery Lifecycle & OTP Verification</h2>
          <p className="text-xs text-mutedText mt-1">
            Ensuring physical food handover without unauthorized status alterations.
          </p>
        </div>

        <div className="card-warm p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-forest">
            <span className="px-3 py-1.5 rounded-lg bg-cream-200">PENDING</span>
            <span>→</span>
            <span className="px-3 py-1.5 rounded-lg bg-cream-200">ASSIGNED</span>
            <span>→</span>
            <span className="px-3 py-1.5 rounded-lg bg-cream-200">PICKED_UP</span>
            <span>→</span>
            <span className="px-3 py-1.5 rounded-lg bg-cream-200">IN_TRANSIT</span>
            <span>→</span>
            <span className="px-3 py-1.5 rounded-lg bg-primaryGreen text-white">DELIVERED</span>
          </div>

          <div className="p-4 rounded-xl bg-cream-50 border border-lightBorder text-xs space-y-2 leading-relaxed text-darkText">
            <div className="flex items-center gap-2 font-bold text-forest">
              <KeyRound className="w-4 h-4 text-orangeAccent" />
              <span>Handover Cryptographic Token Flow</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-mutedText pl-1">
              <li>When food is allocated, the backend generates an unpredictable 6-digit random code stored as a BCrypt hash.</li>
              <li>Only the intended Recipient can view the plaintext OTP in their dashboard.</li>
              <li>Upon arrival, the volunteer driver requests the code from the recipient and submits it to `/api/otp/verify`.</li>
              <li>The backend validates the code, marks the delivery DELIVERED, and credits 50 volunteer points.</li>
              <li>Max 5 invalid attempts locks verification to prevent brute-force attacks.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* SECTION 5: FOOD SAFETY & WASTE AUDITING */}
      <section className="space-y-6">
        <div className="border-b border-lightBorder pb-3">
          <h2 className="font-serif text-2xl font-bold text-forest">5. Food Safety & Waste Auditing</h2>
          <p className="text-xs text-mutedText mt-1">
            Zero compromises on food quality. Safe diversion to composting and biogas when food expires.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-warm p-6 space-y-3">
            <div className="flex items-center gap-2 font-serif text-lg font-bold text-forest">
              <Clock className="w-5 h-5 text-primaryGreen" />
              <span>Expiry Feasibility Checks</span>
            </div>
            <p className="text-xs text-mutedText leading-relaxed">
              Donations past their consume-before deadline are automatically blocked from claim. The system validates that proposed deliveries can realistically be completed before safety cutoffs.
            </p>
          </div>

          <div className="card-warm p-6 space-y-3">
            <div className="flex items-center gap-2 font-serif text-lg font-bold text-forest">
              <Leaf className="w-5 h-5 text-primaryGreen" />
              <span>Responsible Waste Logging</span>
            </div>
            <p className="text-xs text-mutedText leading-relaxed">
              Unclaimed or spoiled batches are recorded in `waste_records` with reasons and eco-friendly disposal methods (organic composting, biogas digesters) to maintain complete audit transparency.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="card-warm p-8 text-center bg-forest text-white rounded-3xl space-y-4">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold">Ready to Experience NourishNet?</h3>
        <p className="text-cream-200/80 text-sm max-w-lg mx-auto">
          Explore our available food listings or sign in with sample demonstration accounts.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/available-food"
            className="px-6 py-2.5 rounded-xl bg-orangeAccent hover:bg-orangeAccent-hover text-white font-semibold text-sm transition-all"
          >
            Explore Food
          </Link>
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
          >
            Demo Sign In
          </Link>
        </div>
      </div>

    </div>
  );
};
