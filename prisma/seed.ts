import { PrismaClient, UserRole, Status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {
      passwordHash: hashedPassword, // Update password if user exists
    },
    create: {
      email: 'admin@muktsarngo.com',
      phone: '+919876543210',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const hashedPassword2 = await bcrypt.hash('password', 12);

  const adminUser2 = await prisma.user.upsert({
    where: { phone: '+919876543211' },
    update: {
      passwordHash: hashedPassword2, // Update password if user exists
    },
    create: {
      email: 'admin2@muktsarngo.com',
      phone: '+919876543211',
      passwordHash: hashedPassword2,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create team members
  const teamMembers = [
    {
      name: 'Sanam Batra',
      role: 'Founder & President',
      position: 'Chief Executive Officer',
      email: 'sanam@muktsarngo.com',
      phone: '+91 8146052682',
      description: 'Visionary leader dedicated to community service and social change.',
      sortOrder: 1,
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Medical Director',
      position: 'Chief Medical Officer',
      email: 'rajesh@muktsarngo.com',
      phone: '+91 9876543210',
      description: 'Experienced physician overseeing all medical initiatives.',
      sortOrder: 2,
    },
    {
      name: 'Priya Sharma',
      role: 'Operations Manager',
      position: 'Head of Operations',
      email: 'priya@muktsarngo.com',
      phone: '+91 9876543211',
      description: 'Ensuring smooth operations and coordination of all activities.',
      sortOrder: 3,
    },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.upsert({
      where: { name: member.name },
      update: {},
      create: member,
    });
  }

  console.log('✅ Team members created');

  // Create sample blood camps
  const bloodCamps = [
    {
      title: 'Blood Donation Camp - Community Center',
      description: 'Join us for a blood donation drive to help save lives in our community.',
      campDate: new Date('2024-12-25'),
      startTime: '09:00',
      endTime: '17:00',
      location: 'Community Center',
      address: '123 Main Street, Sri Muktsar Sahib, Punjab, India',
      targetUnits: 100,
      collectedUnits: 0,
      status: Status.UPCOMING,
      contactPerson: 'Dr. Rajesh Kumar',
      contactPhone: '+91 9876543210',
      registrationLink: 'https://forms.google.com/blood-camp-registration',
      createdBy: adminUser.id,
    },
    {
      title: 'Emergency Blood Drive - Hospital',
      description: 'Urgent blood donation drive to support local hospital needs.',
      campDate: new Date('2024-11-15'),
      startTime: '08:00',
      endTime: '16:00',
      location: 'City Hospital',
      address: '456 Hospital Road, Sri Muktsar Sahib, Punjab, India',
      targetUnits: 150,
      collectedUnits: 120,
      status: Status.COMPLETED,
      contactPerson: 'Dr. Sarah Johnson',
      contactPhone: '+91 9876543212',
      createdBy: adminUser.id,
    },
  ];

  for (const camp of bloodCamps) {
    await prisma.bloodCamp.create({
      data: camp,
    });
  }

  console.log('✅ Blood camps created');

  // Create sample medical camps
  const medicalCamps = [
    {
      title: 'Free Medical Camp - Rural Health Initiative',
      description: 'Comprehensive health checkup and treatment for rural communities.',
      campDate: new Date('2024-12-20'),
      startTime: '08:00',
      endTime: '16:00',
      location: 'Village Community Center',
      address: 'Village Khokhar, Sri Muktsar Sahib, Punjab, India',
      services: ['General Checkup', 'Blood Pressure', 'Diabetes Screening', 'Eye Checkup'],
      capacity: 200,
      registeredCount: 0,
      status: Status.UPCOMING,
      contactPerson: 'Dr. Priya Sharma',
      contactPhone: '+91 9876543213',
      createdBy: adminUser.id,
    },
    {
      title: 'Women\'s Health Camp',
      description: 'Specialized health camp focusing on women\'s health and wellness.',
      campDate: new Date('2024-10-30'),
      startTime: '09:00',
      endTime: '15:00',
      location: 'Women\'s Community Hall',
      address: '789 Women\'s Street, Sri Muktsar Sahib, Punjab, India',
      services: ['Gynecological Checkup', 'Breast Cancer Screening', 'Nutrition Counseling'],
      capacity: 150,
      registeredCount: 145,
      status: Status.COMPLETED,
      contactPerson: 'Dr. Anjali Verma',
      contactPhone: '+91 9876543214',
      createdBy: adminUser.id,
    },
  ];

  for (const camp of medicalCamps) {
    await prisma.medicalCamp.create({
      data: camp,
    });
  }

  console.log('✅ Medical camps created');

  // Create content pages
  const contentPages = [
    {
      pageName: 'home',
      title: 'Muktsar NGO',
      subtitle: 'Saving Lives, Serving Community',
      description: 'Our NGO is committed to saving lives and improving health through essential services.',
      content: {
        heroTitle: 'Muktsar NGO',
        heroSubtitle: 'Saving Lives, Serving Community',
        aboutText: 'Our NGO is committed to saving lives and improving health through essential services.',
        values: ['Compassion', 'Integrity', 'Service', 'Excellence', 'Community'],
      },
      metaTitle: 'Muktsar NGO - Saving Lives, Serving Community',
      metaDescription: 'Join Muktsar NGO in our mission to save lives through blood donation drives, medical camps, and community service.',
      updatedBy: adminUser.id,
    },
    {
      pageName: 'about',
      title: 'About Us',
      subtitle: 'Our Mission & Vision',
      description: 'Learn more about our organization, mission, and the impact we make in the community.',
      content: {
        mission: 'To save lives and improve health through blood donation drives and medical camps.',
        vision: 'A healthier community where everyone has access to essential healthcare services.',
        history: 'Founded with a vision to serve the community and save lives.',
      },
      metaTitle: 'About Muktsar NGO - Our Mission & Vision',
      metaDescription: 'Learn about Muktsar NGO\'s mission to save lives through community service and healthcare initiatives.',
      updatedBy: adminUser.id,
    },
  ];

  for (const page of contentPages) {
    await prisma.contentPage.upsert({
      where: { pageName: page.pageName },
      update: {},
      create: page,
    });
  }

  console.log('✅ Content pages created');

  // Create statistics
  const statistics = [
    {
      metricName: 'Blood Units Collected',
      metricValue: '500+',
      description: 'Total blood units collected through our camps',
      recordedDate: new Date(),
    },
    {
      metricName: 'People Served',
      metricValue: '2000+',
      description: 'Total people served through medical camps',
      recordedDate: new Date(),
    },
    {
      metricName: 'Camps Organized',
      metricValue: '50+',
      description: 'Total camps organized since inception',
      recordedDate: new Date(),
    },
    {
      metricName: 'Volunteers',
      metricValue: '100+',
      description: 'Active volunteers supporting our mission',
      recordedDate: new Date(),
    },
  ];

  for (const stat of statistics) {
    await prisma.statistic.upsert({
      where: { metricName: stat.metricName },
      update: {},
      create: stat,
    });
  }

  console.log('✅ Statistics created');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
