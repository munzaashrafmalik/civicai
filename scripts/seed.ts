import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb';
import { User } from '../backend/database/users/user.model';
import { Organization } from '../backend/database/organizations/organization.model';
import { Complaint } from '../backend/database/complaints/complaint.model';

const organizations = [
  {
    name: 'Karachi Metropolitan Corporation',
    nameUrdu: 'کراچی میٹروپولٹن کارپوریشن',
    city: 'Karachi',
    email: 'complaints@kmc.gos.pk',
    phone: '+92-21-99214000',
    address: 'KMC Building, M.A. Jinnah Road, Karachi',
    categories: ['garbage', 'drainage', 'road_damage', 'streetlight', 'pothole'],
    isActive: true,
  },
  {
    name: 'Lahore Waste Management Company',
    nameUrdu: 'لاہور ویسٹ مینیجمنٹ کمپنی',
    city: 'Lahore',
    email: 'complaints@lwmc.com.pk',
    phone: '+92-42-111-596-596',
    address: 'LWMC Head Office, 45-A, Shahrah-e-Quaid-e-Azam, Lahore',
    categories: ['garbage', 'drainage'],
    isActive: true,
  },
  {
    name: 'Islamabad Capital Territory Administration',
    nameUrdu: 'اسلام آباد کیپٹل ٹیریٹری انتظامیہ',
    city: 'Islamabad',
    email: 'ict.complaints@ictadministration.gov.pk',
    phone: '+92-51-9205000',
    address: 'ICT Administration, Sector G-5/2, Islamabad',
    categories: ['pothole', 'streetlight', 'traffic_signal', 'road_damage', 'water_leakage'],
    isActive: true,
  },
  {
    name: 'Rawalpindi Water & Sanitation Agency',
    nameUrdu: 'راولپنڈی واٹر اینڈ سینیٹیشن ایجنسی',
    city: 'Rawalpindi',
    email: 'complaints@wasa.rawalpindi.gop.pk',
    phone: '+92-51-9270000',
    address: 'WASA Head Office, Committee Chowk, Rawalpindi',
    categories: ['water_leakage', 'drainage'],
    isActive: true,
  },
  {
    name: 'Faisalabad Waste Management Company',
    nameUrdu: 'فیصل آباد ویسٹ مینیجمنٹ کمپنی',
    city: 'Faisalabad',
    email: 'info@fwmc.com.pk',
    phone: '+92-41-9230000',
    address: 'FWMC Office, Jail Road, Faisalabad',
    categories: ['garbage', 'drainage'],
    isActive: true,
  },
  {
    name: 'Multan Water & Sanitation Agency',
    nameUrdu: 'ملتان واٹر اینڈ سینیٹیشن ایجنسی',
    city: 'Multan',
    email: 'complaints@wasa.multan.gop.pk',
    phone: '+92-61-9200000',
    address: 'WASA Multan, LMQ Road, Multan',
    categories: ['water_leakage', 'drainage'],
    isActive: true,
  },
  {
    name: 'Hyderabad Municipal Corporation',
    nameUrdu: 'حیدرآباد میونسپل کارپوریشن',
    city: 'Hyderabad',
    email: 'complaints@hmc.gos.pk',
    phone: '+92-22-9200000',
    address: 'HMC Office, Thandi Sarak, Hyderabad',
    categories: ['garbage', 'drainage', 'streetlight', 'pothole'],
    isActive: true,
  },
  {
    name: 'Peshawar Metropolitan Corporation',
    nameUrdu: 'پشاور میٹروپولٹن کارپوریشن',
    city: 'Peshawar',
    email: 'complaints@pmc.gkp.pk',
    phone: '+92-91-9211000',
    address: 'PMC Building, Saddar Road, Peshawar',
    categories: ['garbage', 'drainage', 'streetlight', 'road_damage', 'pothole'],
    isActive: true,
  },
];

const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin' as const,
    language: 'en' as const,
    phone: '+92-300-0000000',
  },
  {
    name: 'Test User 1',
    email: 'user1@example.com',
    password: 'user123',
    role: 'citizen' as const,
    language: 'ur' as const,
    phone: '+92-300-1111111',
  },
  {
    name: 'Test User 2',
    email: 'user2@example.com',
    password: 'user123',
    role: 'citizen' as const,
    language: 'en' as const,
    phone: '+92-300-2222222',
  },
  {
    name: 'Test User 3',
    email: 'user3@example.com',
    password: 'user123',
    role: 'citizen' as const,
    language: 'ur' as const,
    phone: '+92-300-3333333',
  },
];

const sampleComplaints = [
  {
    title: 'Large pothole on Main Boulevard',
    description: 'A large pothole has formed on Main Boulevard near the intersection with 5th Street. It is causing traffic issues and potential vehicle damage.',
    issueCategory: 'pothole',
    severity: 'high',
    status: 'pending' as const,
    location: {
      latitude: 33.6844,
      longitude: 73.0479,
      address: 'Main Boulevard, Sector F-7, Islamabad',
      city: 'Islamabad',
    },
    images: [],
    aiAnalysis: {
      issueCategory: 'pothole',
      confidence: 0.92,
      severity: 'high',
      description: 'A high severity pothole has been identified at the provided location. The affected area requires inspection and repair to prevent vehicle damage and traffic disruption.',
      suggestedTitle: 'Large pothole on Main Boulevard',
      detectedObjects: ['pothole', 'asphalt', 'road'],
    },
  },
  {
    title: 'Garbage overflowing near market',
    description: 'Garbage bins are overflowing near Raja Bazaar market area. Bad smell and health hazard.',
    issueCategory: 'garbage',
    severity: 'medium',
    status: 'in_progress' as const,
    location: {
      latitude: 33.5651,
      longitude: 73.0169,
      address: 'Raja Bazaar, Rawalpindi',
      city: 'Rawalpindi',
    },
    images: [],
    aiAnalysis: {
      issueCategory: 'garbage',
      confidence: 0.88,
      severity: 'medium',
      description: 'Garbage accumulation has been reported at the location. The area requires cleanup to address health hazards and environmental concerns.',
      suggestedTitle: 'Garbage overflowing near market',
      detectedObjects: ['garbage', 'bins', 'overflow'],
    },
  },
  {
    title: 'Water leakage on Mall Road',
    description: 'Major water leakage from underground pipe on Mall Road. Water flooding the street.',
    issueCategory: 'water_leakage',
    severity: 'critical',
    status: 'resolved' as const,
    location: {
      latitude: 31.5204,
      longitude: 74.3587,
      address: 'Mall Road, Lahore',
      city: 'Lahore',
    },
    images: [],
    aiAnalysis: {
      issueCategory: 'water_leakage',
      confidence: 0.95,
      severity: 'critical',
      description: 'Water leakage detected from underground infrastructure causing water wastage and potential road damage. Urgent repair required.',
      suggestedTitle: 'Water leakage on Mall Road',
      detectedObjects: ['water', 'leakage', 'pipe', 'flooding'],
    },
  },
  {
    title: 'Streetlight not working in Gulberg',
    description: 'Streetlight pole #45 on Gulberg Main Boulevard has been non-functional for 2 weeks.',
    issueCategory: 'streetlight',
    severity: 'low',
    status: 'pending' as const,
    location: {
      latitude: 31.5204,
      longitude: 74.3587,
      address: 'Gulberg Main Boulevard, Lahore',
      city: 'Lahore',
    },
    images: [],
    aiAnalysis: {
      issueCategory: 'streetlight',
      confidence: 0.9,
      severity: 'low',
      description: 'Streetlight malfunction reported in the area. This poses safety concerns during night hours and requires maintenance.',
      suggestedTitle: 'Streetlight not working in Gulberg',
      detectedObjects: ['streetlight', 'pole', 'dark'],
    },
  },
  {
    title: 'Drainage blocked causing flooding',
    description: 'Main drainage line blocked near Karachi University. Heavy rain causes severe flooding.',
    issueCategory: 'drainage',
    severity: 'high',
    status: 'in_progress' as const,
    location: {
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'University Road, Karachi',
      city: 'Karachi',
    },
    images: [],
    aiAnalysis: {
      issueCategory: 'drainage',
      confidence: 0.85,
      severity: 'high',
      description: 'Drainage blockage or overflow reported. This may cause waterlogging and requires immediate attention.',
      suggestedTitle: 'Drainage blocked causing flooding',
      detectedObjects: ['drainage', 'flooding', 'blocked'],
    },
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Complaint.deleteMany({});

    // Insert organizations
    console.log('🏢 Inserting organizations...');
    const createdOrgs = await Organization.insertMany(organizations);
    console.log(`✅ Inserted ${createdOrgs.length} organizations`);

    // Insert users with hashed passwords
    console.log('👥 Inserting test users...');
    const usersWithHash = await Promise.all(
      testUsers.map(async (u) => ({
        name: u.name,
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        role: u.role,
        language: u.language,
        phone: u.phone,
        isActive: true,
        emailVerified: true,
      }))
    );
    const createdUsers = await User.insertMany(usersWithHash);
    console.log(`✅ Inserted ${createdUsers.length} users`);

    // Insert sample complaints (assign to first citizen user)
    console.log('📋 Inserting sample complaints...');
    const userId = createdUsers[1]._id;
    const complaintsWithUser = sampleComplaints.map((c, i) => ({
      ...c,
      complaintId: `CIV-${(Date.now() + i).toString(36).toUpperCase()}`,
      userId,
      assignedOrganization: createdOrgs[i % createdOrgs.length].name,
    }));

    const createdComplaints = await Complaint.insertMany(complaintsWithUser);
    console.log(`✅ Inserted ${createdComplaints.length} sample complaints`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User 1: user1@example.com / user123');
    console.log('User 2: user2@example.com / user123');
    console.log('User 3: user3@example.com / user123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
