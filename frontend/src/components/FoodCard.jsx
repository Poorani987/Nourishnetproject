import React from 'react';
import { StatusBadge } from './StatusBadge';
import { 
  Clock, 
  MapPin, 
  Building2, 
  Truck 
} from 'lucide-react';

export const FoodCard = ({
  donation,
  onRequestClick,
  showRequestButton = true,
}) => {
  const isExpiringSoon = (donation.minutesRemaining ?? 999) < 180 && (donation.minutesRemaining ?? 0) > 0;
  const isExpired = (donation.minutesRemaining ?? 0) <= 0 || donation.status === 'EXPIRED';

  const formatRemainingTime = (minutes) => {
    if (minutes === undefined || minutes <= 0) return 'Expired';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m left`;
    return `${hours}h ${mins}m left`;
  };

  return (
    <div className="card-warm p-6 flex flex-col justify-between group hover:border-forest/40 transition-all">
      <div>
        {/* Top Header: Veg/Non-veg + Category + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {/* Standard Indian Veg / Non-Veg emblem */}
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                donation.foodType === 'VEGETARIAN' ? 'border-emerald-600' : 'border-red-600'
              }`}
              title={donation.foodType}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  donation.foodType === 'VEGETARIAN' ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              />
            </div>

            <span className="text-xs font-semibold tracking-wider uppercase text-mutedText">
              {(donation.foodCategory || 'MEALS').replace(/_/g, ' ')}
            </span>

            {donation.stateType && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-cream-200 text-darkText font-medium">
                {donation.stateType}
              </span>
            )}
          </div>

          <StatusBadge status={donation.status} />
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-bold text-forest group-hover:text-primaryGreen transition-colors line-clamp-1">
          {donation.foodName}
        </h3>

        {/* Donor */}
        <div className="flex items-center gap-1.5 text-xs text-mutedText mt-1.5 font-medium">
          <Building2 className="w-3.5 h-3.5 text-forest shrink-0" />
          <span className="truncate">{donation.donorOrganizationName}</span>
        </div>

        {/* Portions & Expiry Pill */}
        <div className="grid grid-cols-2 gap-3 my-4 py-3 px-3.5 bg-cream-50 rounded-xl border border-lightBorder/80">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-mutedText font-semibold block">
              Available
            </span>
            <span className="font-serif text-lg font-bold text-forest">
              {donation.remainingQuantity} <span className="text-xs font-sans font-normal text-mutedText">{donation.quantityUnit || 'portions'}</span>
            </span>
            <span className="text-[10px] text-mutedText/80 block">
              of {donation.totalQuantity} total
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-mutedText font-semibold block">
              Fresh Until
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className={`w-3.5 h-3.5 ${isExpiringSoon ? 'text-orangeAccent' : isExpired ? 'text-red-600' : 'text-primaryGreen'}`} />
              <span className={`text-xs font-bold ${isExpiringSoon ? 'text-orangeAccent animate-pulse' : isExpired ? 'text-red-600' : 'text-primaryGreen'}`}>
                {formatRemainingTime(donation.minutesRemaining)}
              </span>
            </div>
            {donation.consumeBefore && (
              <span className="text-[10px] text-mutedText/80 block mt-0.5">
                Expiry: {new Date(donation.consumeBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {donation.preparationTime && (
              <span className="text-[10px] text-mutedText/70 block">
                Cooked: {new Date(donation.preparationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Pickup Location */}
        <div className="space-y-1.5 text-xs text-mutedText mb-4">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-forest/70 shrink-0" />
            <span className="truncate">{donation.pickupAddress}</span>
          </div>
        </div>

        {/* 15km transport rule note */}
        <div className="flex items-center gap-1.5 text-[11px] text-forest/80 bg-softGreen/30 px-2.5 py-1.5 rounded-lg border border-softGreen/50 mb-4">
          <Truck className="w-3.5 h-3.5 text-primaryGreen shrink-0" />
          <span><strong>15 km Rule:</strong> ≤15 km volunteer pickup, &gt;15 km recipient arranged</span>
        </div>
      </div>

      {/* Action Button */}
      {showRequestButton && (
        <button
          onClick={() => onRequestClick && onRequestClick(donation)}
          disabled={isExpired || donation.remainingQuantity <= 0}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
            isExpired || donation.remainingQuantity <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              : 'bg-forest hover:bg-primaryGreen text-white hover:shadow'
          }`}
        >
          <span>{donation.remainingQuantity <= 0 ? 'Fully Claimed' : isExpired ? 'Expired' : 'Claim Food Portions'}</span>
        </button>
      )}
    </div>
  );
};
