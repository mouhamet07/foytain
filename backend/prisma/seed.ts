import { PrismaClient, Role, TontineType, TontineStatus, TontineFrequency, MembershipStatus, MembershipRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@Foytain.com' },
    update: {},
    create: {
      email: 'superadmin@Foytain.com',
      username: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: superAdminPassword,
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });

  // Create Admin
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@Foytain.com' },
    update: {},
    create: {
      email: 'admin@Foytain.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'Foytain',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
      isActive: true,
    },
  });

  // Create sample users
  const userPassword = await bcrypt.hash('User@123456', 12);

  const user1 = await prisma.user.upsert({
    where: { email: 'fatou@example.com' },
    update: {},
    create: {
      email: 'fatou@example.com',
      username: 'fatou_diallo',
      firstName: 'Fatou',
      lastName: 'Diallo',
      phone: '+221771234567',
      passwordHash: userPassword,
      role: Role.USER,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'mamadou@example.com' },
    update: {},
    create: {
      email: 'mamadou@example.com',
      username: 'mamadou_ba',
      firstName: 'Mamadou',
      lastName: 'Ba',
      phone: '+221779876543',
      passwordHash: userPassword,
      role: Role.USER,
      isEmailVerified: true,
      isActive: true,
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'aissatou@example.com' },
    update: {},
    create: {
      email: 'aissatou@example.com',
      username: 'aissatou_sow',
      firstName: 'Aissatou',
      lastName: 'Sow',
      phone: '+221775551234',
      passwordHash: userPassword,
      role: Role.USER,
      isEmailVerified: true,
      isActive: true,
    },
  });

  // Create sample tontines
  const tontine1 = await prisma.tontine.upsert({
    where: { slug: 'solidarite-sante-dakar' },
    update: {},
    create: {
      name: 'Solidarité Santé Dakar',
      slug: 'solidarite-sante-dakar',
      description: 'Tontine médicale pour les membres de la communauté de Dakar. Ensemble, nous pouvons couvrir les frais médicaux de chacun.',
      type: TontineType.PUBLIC,
      status: TontineStatus.ACTIVE,
      frequency: TontineFrequency.MONTHLY,
      contributionAmount: 25000,
      currency: 'XOF',
      maxMembers: 50,
      startDate: new Date('2024-01-01'),
      ownerId: user1.id,
    },
  });

  const tontine2 = await prisma.tontine.upsert({
    where: { slug: 'famille-ba-sante' },
    update: {},
    create: {
      name: 'Famille Ba Santé',
      slug: 'famille-ba-sante',
      description: 'Tontine privée pour la famille Ba et leurs proches.',
      type: TontineType.PRIVATE,
      status: TontineStatus.ACTIVE,
      frequency: TontineFrequency.MONTHLY,
      contributionAmount: 15000,
      currency: 'XOF',
      maxMembers: 20,
      startDate: new Date('2024-02-01'),
      ownerId: user2.id,
    },
  });

  // Create memberships
  await prisma.membership.upsert({
    where: { userId_tontineId: { userId: user1.id, tontineId: tontine1.id } },
    update: {},
    create: {
      userId: user1.id,
      tontineId: tontine1.id,
      status: MembershipStatus.ACTIVE,
      role: MembershipRole.CREATOR,
      joinedAt: new Date('2024-01-01'),
    },
  });

  await prisma.membership.upsert({
    where: { userId_tontineId: { userId: user2.id, tontineId: tontine1.id } },
    update: {},
    create: {
      userId: user2.id,
      tontineId: tontine1.id,
      status: MembershipStatus.ACTIVE,
      role: MembershipRole.MEMBER,
      joinedAt: new Date('2024-01-05'),
    },
  });

  await prisma.membership.upsert({
    where: { userId_tontineId: { userId: user3.id, tontineId: tontine1.id } },
    update: {},
    create: {
      userId: user3.id,
      tontineId: tontine1.id,
      status: MembershipStatus.ACTIVE,
      role: MembershipRole.MEMBER,
      joinedAt: new Date('2024-01-10'),
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`
  ──────────────────────────────────────
  Credentials:
  Super Admin: superadmin@Foytain.com / SuperAdmin@123
  Admin:       admin@Foytain.com / Admin@123456
  User 1:      fatou@example.com / User@123456
  User 2:      mamadou@example.com / User@123456
  ──────────────────────────────────────
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
