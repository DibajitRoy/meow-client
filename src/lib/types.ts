export type PublicUser = { id: string; name: string; image: string | null };

export type Cat = {
  _id: string;
  name: string;
  breed?: string;
  age?: number;
  gender: "male" | "female" | "unknown";
  weight?: number;
  feedingSchedule?: string;
  careInstructions?: string;
  medicalNotes?: string;
  vaccinated: boolean;
  emergencyContact?: string;
  photo?: string;
};

export type BookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export type Booking = {
  _id: string;
  ownerId: string;
  sitterId: string;
  catId: string;
  serviceType?: string;
  cat: {
    name: string;
    breed: string | null;
    age: number | null;
    photo: string | null;
    feedingSchedule: string | null;
    careInstructions: string | null;
    medicalNotes: string | null;
    emergencyContact: string | null;
  };
  from: string;
  to: string;
  nights: number;
  pricePerDay: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  note: string | null;
  status: BookingStatus;
  createdAt: string;
  owner?: (PublicUser & { phone?: string | null; email?: string }) | null;
  sitter?: (PublicUser & { phone?: string | null; email?: string }) | null;
  reviewed?: boolean;
};

export type Review = {
  _id: string;
  bookingId: string;
  rating: number;
  comment: string;
  photos: string[];
  status: "visible" | "reported" | "hidden";
  createdAt: string;
  owner?: PublicUser | null;
  sitter?: PublicUser | null;
};
export type SitterListItem = {
  id: string;
  name: string;
  photo: string | null;
  city: string;
  pricePerDay: number;
  experienceYears: number;
  services: string[];
  bio: string;
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
};

export type SitterDetail = SitterListItem & {
  address: string | null;
  gallery: string[];
};

export type PublicReview = {
  _id: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
  owner: PublicUser | null;
};

export type Unavailable = { from: string; to: string; type: "booked" | "unavailable" | "holiday" };
export type SitterProfile = {
  bio: string;
  city: string;
  address?: string;
  pricePerDay: number;
  experienceYears: number;
  services: string[];
  photo?: string;
  gallery: string[];
  acceptingBookings: boolean;
  verificationStatus: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  ratingAvg: number;
  ratingCount: number;
};

export type AvailabilityBlock = {
  _id: string;
  from: string;
  to: string;
  status: "unavailable" | "holiday";
  note?: string;
};
