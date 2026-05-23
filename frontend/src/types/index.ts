export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: Role;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  _count?: {
    memberships: number;
    contributions: number;
    medicalRequests: number;
  };
}

export type TontineType = 'PUBLIC' | 'PRIVATE';
export type TontineStatus = 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'FINISHED';
export type TontineFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY';

export interface Tontine {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: TontineType;
  status: TontineStatus;
  frequency: TontineFrequency;
  contributionAmount: number;
  currency: string;
  maxMembers?: number;
  startDate: string;
  endDate?: string;
  rules?: string;
  coverImageUrl?: string;
  ownerId: string;
  owner: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  createdAt: string;
  memberRole?: MembershipRole;
  memberships?: Membership[];
  _count?: {
    memberships: number;
    contributions: number;
    medicalRequests: number;
  };
}

export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'LEFT' | 'SUSPENDED';
export type MembershipRole = 'MEMBER' | 'ADMIN' | 'CREATOR';

export interface Membership {
  id: string;
  userId: string;
  tontineId: string;
  status: MembershipStatus;
  role: MembershipRole;
  joinedAt?: string;
  leftAt?: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'email'>;
  tontine?: Pick<Tontine, 'id' | 'name' | 'slug' | 'status'>;
}

export type ContributionStatus = 'PAID' | 'UNPAID' | 'LATE';

export interface Contribution {
  id: string;
  userId: string;
  tontineId: string;
  amount: number;
  currency: string;
  status: ContributionStatus;
  dueDate: string;
  paidAt?: string;
  periodLabel: string;
  notes?: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  tontine?: Pick<Tontine, 'id' | 'name' | 'slug'>;
  payment?: Pick<Payment, 'id' | 'status' | 'method'>;
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CASH' | 'CARD';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  reference: string;
  description?: string;
  transactionId?: string;
  processedAt?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  contribution?: Contribution;
}

export type MedicalRequestStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED';

export interface MedicalRequest {
  id: string;
  userId: string;
  tontineId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: MedicalRequestStatus;
  diagnosis?: string;
  hospitalName?: string;
  documentUrls: string[];
  rejectionReason?: string;
  votingDeadline?: string;
  disbursedAt?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  tontine?: Pick<Tontine, 'id' | 'name' | 'slug'>;
  votes?: Vote[];
  voteStats?: { for: number; against: number; abstain: number };
  _count?: { votes: number };
}

export type VoteChoice = 'FOR' | 'AGAINST' | 'ABSTAIN';

export interface Vote {
  id: string;
  userId: string;
  medicalRequestId: string;
  choice: VoteChoice;
  comment?: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export type NotificationType =
  | 'TONTINE_INVITE' | 'MEMBERSHIP_APPROVED' | 'MEMBERSHIP_REJECTED'
  | 'CONTRIBUTION_DUE' | 'CONTRIBUTION_LATE' | 'CONTRIBUTION_PAID'
  | 'MEDICAL_REQUEST_CREATED' | 'MEDICAL_REQUEST_APPROVED' | 'MEDICAL_REQUEST_REJECTED'
  | 'VOTE_OPENED' | 'VOTE_CLOSED' | 'PAYMENT_RECEIVED' | 'PAYMENT_FAILED' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  tontineId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
