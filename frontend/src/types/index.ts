export type Role = 'DONOR' | 'RECIPIENT' | 'VEHICLE_VOLUNTEER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  organizationName?: string;
  latitude?: number;
  longitude?: number;
  profileDetails?: Record<string, any>;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  role: Role;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  organizationName?: string;
  latitude?: number;
  longitude?: number;
  profileDetails?: Record<string, any>;
}

export type FoodType = 'VEGETARIAN' | 'NON_VEGETARIAN';
export type StateType = 'COOKED' | 'PACKAGED';
export type DonationStatus = 'AVAILABLE' | 'PARTIALLY_ALLOCATED' | 'FULLY_ALLOCATED' | 'PICKED_UP' | 'DELIVERED' | 'EXPIRED' | 'CANCELLED';

export interface FoodDonation {
  id: number;
  donorProfileId: number;
  donorOrganizationName: string;
  donorContact: string;
  donorPhone: string;
  foodName: string;
  foodCategory: string;
  foodType: FoodType;
  stateType: StateType;
  totalQuantity: number;
  allocatedQuantity: number;
  remainingQuantity: number;
  quantityUnit: string;
  preparationTime: string;
  consumeBefore: string;
  minutesRemaining?: number;
  storageRequirements?: string;
  allergenInformation?: string;
  pickupAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  status: DonationStatus;
  donationStatus?: DonationStatus;
  createdAt: string;
}

export type AllocationStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
export type TransportResponsibility = 'DONOR_OR_VOLUNTEER' | 'RECIPIENT_OR_VOLUNTEER';

export interface FoodAllocation {
  id: number;
  donationId: number;
  foodName: string;
  foodCategory: string;
  donorOrganizationName: string;
  recipientProfileId: number;
  recipientOrganizationName: string;
  requestedQuantity: number;
  allocatedQuantity: number;
  quantityUnit: string;
  distanceKm: number;
  transportResponsibility: TransportResponsibility;
  status: AllocationStatus;
  allocationStatus?: AllocationStatus;
  deliveryId?: number;
  delivery?: Delivery;
  foodDonation?: FoodDonation;
  createdAt: string;
}

export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface Delivery {
  id: number;
  allocationId: number;
  status: DeliveryStatus;
  deliveryStatus?: DeliveryStatus;
  distanceKm: number;
  estimatedDistanceKm?: number;
  transportResponsibility: TransportResponsibility;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryDeadline: string;
  foodName: string;
  foodCategory: string;
  allocatedQuantity: number;
  quantityUnit: string;
  donorOrganizationName: string;
  donorPhone: string;
  recipientOrganizationName: string;
  recipientContactPerson: string;
  recipientPhone: string;
  assignedVolunteerId?: number;
  assignedVolunteerName?: string;
  volunteerPhone?: string;
  vehicleType?: string;
  vehicleRegistration?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  plainOtpForRecipient?: string;
  createdAt?: string;
}

export interface RoadNode {
  id: number;
  nodeCode: string;
  nodeName: string;
  areaName: string;
  city?: string;
  latitude: number;
  longitude: number;
}

export interface RoadEdge {
  id: number;
  sourceNode: RoadNode;
  targetNode: RoadNode;
  roadName: string;
  distanceKm: number;
  isBidirectional: boolean;
}

export interface RouteSegment {
  fromNodeCode: string;
  fromNodeName: string;
  toNodeCode: string;
  toNodeName: string;
  roadName: string;
  distanceKm: number;
}

export interface RouteResponse {
  sourceNodeId: number;
  targetNodeId: number;
  sourceName: string;
  targetName: string;
  totalDistanceKm: number;
  orderedNodeCodes: string[];
  orderedNodeNames: string[];
  pathNodes?: RoadNode[];
  segments: RouteSegment[];
  reachable: boolean;
  disclaimer: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notificationType: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  read: boolean;
  isRead?: boolean;
  createdAt: string;
}

export interface ImpactSummary {
  totalPortionsDonated: number;
  totalPortionsAllocated: number;
  totalPortionsDelivered: number;
  totalPortionsWasted: number;
  estimatedWastePrevented: number;
  totalDonationsCount: number;
  completedDeliveriesCount: number;
  activeVolunteersCount: number;
  activeRecipientsCount: number;
}

export interface WasteRecord {
  id: number;
  donationId: number;
  foodName: string;
  donorOrganizationName: string;
  quantity: number;
  quantityUnit: string;
  wasteReason: string;
  disposalMethod: string;
  notes?: string;
  recordedAt: string;
}

export interface VolunteerReward {
  id: number;
  pointsAwarded: number;
  pointsEarned?: number;
  reason: string;
  badgeName?: string;
  notes?: string;
  awardedAt: string;
  createdAt?: string;
}

export interface Vehicle {
  id?: number;
  vehicleType: string;
  registrationNumber: string;
  capacityValue?: number;
  capacity?: number;
  capacityUnit: string;
  serviceRadiusKm?: number;
  isAvailable?: boolean;
  isActive: boolean;
}
