import { Organization } from '@/backend/database/organizations/organization.model';
import connectDB from '@/lib/mongodb';

export interface RoutedOrganization {
  id: string;
  name: string;
  nameUrdu?: string;
  email: string;
  phone?: string;
  city: string;
  categories: string[];
}

export interface RoutingResult {
  organization: RoutedOrganization;
  reason: string;
}

interface OrgDoc {
  _id: unknown;
  name: string;
  nameUrdu?: string;
  email: string;
  phone?: string;
  city: string;
  categories: string[];
}

function toRouted(org: OrgDoc): RoutedOrganization {
  return {
    id: String(org._id),
    name: org.name,
    nameUrdu: org.nameUrdu,
    email: org.email,
    phone: org.phone,
    city: org.city,
    categories: org.categories,
  };
}

/**
 * Find the best organization in the database to handle a complaint.
 * Priority: same city + category > same category (any city) > same city (any category).
 */
export async function findOrganizationForComplaint(
  category: string,
  city: string
): Promise<RoutingResult | null> {
  await connectDB();

  const cityLower = city.toLowerCase().trim();

  const exactMatch = await Organization.findOne({
    isActive: true,
    city: cityLower,
    categories: category,
  });
  if (exactMatch) {
    return {
      organization: toRouted(exactMatch),
      reason: `Matched ${category} department in ${cityLower}`,
    };
  }

  const categoryMatch = await Organization.findOne({
    isActive: true,
    categories: category,
  });
  if (categoryMatch) {
    return {
      organization: toRouted(categoryMatch),
      reason: `No ${category} department in ${cityLower}; routed to ${categoryMatch.city}`,
    };
  }

  const cityMatch = await Organization.findOne({
    isActive: true,
    city: cityLower,
  });
  if (cityMatch) {
    return {
      organization: toRouted(cityMatch),
      reason: `No ${category} department available; routed to city department`,
    };
  }

  return null;
}

export async function getAllOrganizations(): Promise<RoutedOrganization[]> {
  await connectDB();
  const orgs = await Organization.find({ isActive: true }).lean();
  return orgs.map(toRouted);
}

export async function getOrganizationById(id: string): Promise<RoutedOrganization | null> {
  await connectDB();
  const org = await Organization.findById(id).lean();
  return org ? toRouted(org) : null;
}

export async function getOrganizationsByCity(city: string): Promise<RoutedOrganization[]> {
  await connectDB();
  const orgs = await Organization.find({ isActive: true, city: city.toLowerCase() }).lean();
  return orgs.map(toRouted);
}

export async function getOrganizationsByCategory(category: string): Promise<RoutedOrganization[]> {
  await connectDB();
  const orgs = await Organization.find({ isActive: true, categories: category }).lean();
  return orgs.map(toRouted);
}

// Forwarding to organization systems is not yet integrated — orgs have no live API endpoints.
// Logged so the handoff is traceable in dev output.
export async function forwardComplaintToOrganization(
  organization: RoutedOrganization,
  complaint: {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    location: { address?: string; latitude: number; longitude: number };
    submittedAt: string;
  }
): Promise<{ success: boolean; referenceId?: string; error?: string }> {
  console.log(
    `[routing] Complaint ${complaint.id} assigned to ${organization.name} (${organization.email}). ` +
    `External forwarding requires an organization API endpoint — none configured.`
  );

  return {
    success: true,
    referenceId: `${organization.id.slice(-6).toUpperCase()}-${complaint.id}`,
  };
}
