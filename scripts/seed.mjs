import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicai';

const organizations = [
  { name: 'Karachi Metropolitan Corporation', nameUrdu: 'کراچی میٹروپولٹن کارپوریشن', city: 'Karachi', email: 'complaints@kmc.gos.pk', phone: '+92-21-99214000', address: 'KMC Building, M.A. Jinnah Road, Karachi', categories: ['garbage', 'drainage', 'road_damage', 'streetlight'], coordinates: { lat: 24.8607, lng: 67.0011 }, isActive: true },
  { name: 'Lahore Waste Management Company', nameUrdu: 'لاہور ویسٹ مینیجمنٹ کمپنی', city: 'Lahore', email: 'complaints@lwmc.com.pk', phone: '+92-42-111-596-596', address: 'LWMC Head Office, 45-A, Shahrah-e-Quaid-e-Azam, Lahore', categories: ['garbage', 'drainage'], coordinates: { lat: 31.5204, lng: 74.3587 }, isActive: true },
  { name: 'Islamabad Capital Territory Administration', nameUrdu: 'اسلام آباد کیپٹل ٹیریٹری انتظامیہ', city: 'Islamabad', email: 'ict.complaints@ictadministration.gov.pk', phone: '+92-51-9205000', address: 'ICT Administration, Sector G-5/2, Islamabad', categories: ['pothole', 'streetlight', 'traffic_signal', 'road_damage', 'water_leakage'], coordinates: { lat: 33.6844, lng: 73.0479 }, isActive: true },
  { name: 'Rawalpindi Water & Sanitation Agency', nameUrdu: 'راولپنڈی واٹر اینڈ سینیٹیشن ایجنسی', city: 'Rawalpindi', email: 'complaints@wasa.rawalpindi.gop.pk', phone: '+92-51-9270000', address: 'WASA Head Office, Committee Chowk, Rawalpindi', categories: ['water_leakage', 'drainage'], coordinates: { lat: 33.5651, lng: 73.0169 }, isActive: true },
  { name: 'Faisalabad Waste Management Company', nameUrdu: 'فیصل آباد ویسٹ مینیجمنٹ کمپنی', city: 'Faisalabad', email: 'info@fwmc.com.pk', phone: '+92-41-9230000', address: 'FWMC Office, Jail Road, Faisalabad', categories: ['garbage', 'drainage'], coordinates: { lat: 31.4504, lng: 73.1350 }, isActive: true },
  { name: 'Multan Water & Sanitation Agency', nameUrdu: 'ملتان واٹر اینڈ سینیٹیشن ایجنسی', city: 'Multan', email: 'complaints@wasa.multan.gop.pk', phone: '+92-61-9200000', address: 'WASA Multan, LMQ Road, Multan', categories: ['water_leakage', 'drainage'], coordinates: { lat: 30.1575, lng: 71.5249 }, isActive: true },
  { name: 'Hyderabad Municipal Corporation', nameUrdu: ' حیدرآباد میونسپل کارپوریشن', city: 'Hyderabad', email: 'complaints@hmc.gos.pk', phone: '+92-22-9200000', address: 'HMC Office, Thandi Sarak, Hyderabad', categories: ['garbage', 'drainage', 'streetlight', 'pothole'], coordinates: { lat: 25.3792, lng: 68.3683 }, isActive: true },
  { name: 'Gujranwala Waste Management Company', nameUrdu: 'گوجرانوالہ ویسٹ مینیجمنٹ کمپنی', city: 'Gujranwala', email: 'info@gwmc.com.pk', phone: '+92-55-9200000', address: 'GWMC Office, GT Road, Gujranwala', categories: ['garbage', 'drainage'], coordinates: { lat: 32.1877, lng: 74.1945 }, isActive: true },
  { name: 'Peshawar Metropolitan Corporation', nameUrdu: 'پشاور میٹروپولٹن کارپوریشن', city: 'Peshawar', email: 'complaints@pmc.gkp.pk', phone: '+92-91-9211000', address: 'PMC Building, Saddar Road, Peshawar', categories: ['garbage', 'drainage', 'streetlight', 'road_damage', 'pothole'], coordinates: { lat: 34.0151, lng: 71.5249 }, isActive: true },
  { name: 'Quetta Metropolitan Corporation', nameUrdu: 'کوئٹہ میٹروپولٹن کارپوریشن', city: 'Quetta', email: 'complaints@qmc.gob.pk', phone: '+92-81-9201000', address: 'QMC Office, Zarghoon Road, Quetta', categories: ['garbage', 'water_leakage', 'drainage', 'streetlight'], coordinates: { lat: 30.1798, lng: 66.9750 }, isActive: true },
  { name: 'Sialkot Municipal Corporation', nameUrdu: 'سیالکوٹ میونسپل کارپوریشن', city: 'Sialkot', email: 'complaints@smc.gop.pk', phone: '+92-52-9200000', address: 'SMC Office, Kachehri Road, Sialkot', categories: ['garbage', 'drainage', 'streetlight', 'pothole'], coordinates: { lat: 32.4945, lng: 74.5229 }, isActive: true },
  { name: 'Bahawalpur Waste Management Company', nameUrdu: 'بہاولپور ویسٹ مینیجمنٹ کمپنی', city: 'Bahawalpur', email: 'info@bwmc.com.pk', phone: '+92-62-9200000', address: 'BWMC Office, Circular Road, Bahawalpur', categories: ['garbage', 'drainage'], coordinates: { lat: 29.3956, lng: 71.6722 }, isActive: true },
];

const testUsers = [
  { name: 'Admin User', email: 'admin@example.com', plainPassword: 'admin123', role: 'admin', language: 'en', phone: '+92-300-0000000' },
  { name: 'Test User 1', email: 'user1@example.com', plainPassword: 'user123', role: 'citizen', language: 'ur', phone: '+92-300-1111111' },
  { name: 'Test User 2', email: 'user2@example.com', plainPassword: 'user123', role: 'citizen', language: 'en', phone: '+92-300-2222222' },
  { name: 'Test User 3', email: 'user3@example.com', plainPassword: 'user123', role: 'citizen', language: 'ur', phone: '+92-300-3333333' },
];

const sampleComplaints = [
  { title: 'Large pothole on Main Boulevard', description: 'A large pothole has formed on Main Boulevard near the intersection with 5th Street. It is causing traffic issues and potential vehicle damage.', issueCategory: 'pothole', severity: 'high', status: 'pending', location: { latitude: 33.6844, longitude: 73.0479, address: 'Main Boulevard, Sector F-7, Islamabad', city: 'Islamabad' }, images: [], aiAnalysis: { confidence: 0.92, detectedObjects: ['pothole', 'asphalt', 'road'], suggestedTitle: 'Large pothole on Main Boulevard', modelVersion: '1.0.0' } },
  { title: 'Garbage overflowing near market', description: 'Garbage bins are overflowing near Raja Bazaar market area. Bad smell and health hazard.', issueCategory: 'garbage', severity: 'medium', status: 'in_progress', location: { latitude: 33.5651, longitude: 73.0169, address: 'Raja Bazaar, Rawalpindi', city: 'Rawalpindi' }, images: [], aiAnalysis: { confidence: 0.88, detectedObjects: ['garbage', 'bins', 'overflow'], suggestedTitle: 'Garbage overflowing near market', modelVersion: '1.0.0' } },
  { title: 'Water leakage on Mall Road', description: 'Major water leakage from underground pipe on Mall Road. Water flooding the street.', issueCategory: 'water_leakage', severity: 'critical', status: 'resolved', location: { latitude: 31.5204, longitude: 74.3587, address: 'Mall Road, Lahore', city: 'Lahore' }, images: [], aiAnalysis: { confidence: 0.95, detectedObjects: ['water', 'leakage', 'pipe', 'flooding'], suggestedTitle: 'Water leakage on Mall Road', modelVersion: '1.0.0' } },
  { title: 'Streetlight not working in Gulberg', description: 'Streetlight pole #45 on Gulberg Main Boulevard has been non-functional for 2 weeks.', issueCategory: 'streetlight', severity: 'low', status: 'pending', location: { latitude: 31.5204, longitude: 74.3587, address: 'Gulberg Main Boulevard, Lahore', city: 'Lahore' }, images: [], aiAnalysis: { confidence: 0.9, detectedObjects: ['streetlight', 'pole', 'dark'], suggestedTitle: 'Streetlight not working in Gulberg', modelVersion: '1.0.0' } },
  { title: 'Drainage blocked causing flooding', description: 'Main drainage line blocked near Karachi University. Heavy rain causes severe flooding.', issueCategory: 'drainage', severity: 'high', status: 'in_progress', location: { latitude: 24.8607, longitude: 67.0011, address: 'University Road, Karachi', city: 'Karachi' }, images: [], aiAnalysis: { confidence: 0.85, detectedObjects: ['drainage', 'flooding', 'blocked'], suggestedTitle: 'Drainage blocked causing flooding', modelVersion: '1.0.0' } },
];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  passwordHash: String,
  language: { type: String, enum: ['en', 'ur'], default: 'en' },
  role: { type: String, enum: ['citizen', 'admin', 'organization'], default: 'citizen' },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  lastLoginAt: Date,
}, { timestamps: true });

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameUrdu: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  categories: [String],
  city: { type: String, required: true },
  address: String,
  isActive: { type: Boolean, default: true },
  apiEndpoint: String,
  apiKey: String,
  contactPerson: String,
}, { timestamps: true });

const ComplaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  issueCategory: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'rejected'], default: 'pending' },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
  },
  images: [String],
  voiceTranscript: String,
  aiAnalysis: {
    issueCategory: String,
    confidence: Number,
    severity: String,
    description: String,
    suggestedTitle: String,
    detectedObjects: [String],
  },
  assignedOrganization: String,
  organizationReferenceId: String,
  resolvedAt: Date,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Organization = mongoose.model('Organization', OrganizationSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Organization.deleteMany({});
    await User.deleteMany({});
    await Complaint.deleteMany({});

    // Insert organizations
    console.log('🏢 Inserting organizations...');
    const createdOrgs = await Organization.insertMany(organizations);
    console.log(`✅ Inserted ${createdOrgs.length} organizations`);

    // Insert users
    console.log('👥 Inserting test users...');
    const usersWithHashes = await Promise.all(
      testUsers.map(async (u) => ({
        ...u,
        passwordHash: await bcrypt.hash(u.plainPassword, 10),
        plainPassword: undefined,
      }))
    );
    const createdUsers = await User.insertMany(usersWithHashes);
    console.log(`✅ Inserted ${createdUsers.length} users`);

    // Insert sample complaints (assign to second user - Ahmed)
    console.log('📋 Inserting sample complaints...');
    const userId = createdUsers[1]._id;
    const complaintsWithUser = sampleComplaints.map(c => ({
      ...c,
      userId,
      complaintId: `CIV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      assignedOrgId: createdOrgs[Math.floor(Math.random() * createdOrgs.length)]._id,
      timeline: [
        { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 3), note: 'Complaint submitted' },
        { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 2), note: 'Under review' },
      ],
    }));

    const createdComplaints = await Complaint.insertMany(complaintsWithUser);
    console.log(`✅ Inserted ${createdComplaints.length} sample complaints`);

    // Update organizations with complaint counts
    for (const org of createdOrgs) {
      const count = await Complaint.countDocuments({ assignedOrgId: org._id });
      await Organization.findByIdAndUpdate(org._id, { complaintCount: count });
    }

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