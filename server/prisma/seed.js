const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed Charities
  const charities = [
    {
      name: 'Golf for Good Foundation',
      description: 'Introducing underserved youth to golf and life skills through mentorship programs. We believe every child deserves the opportunity to experience the discipline, integrity, and joy that golf brings. Our programs operate in 12 cities across the country.',
      image_url: 'https://placehold.co/400x300/1a1a27/6c5ce7?text=Golf+for+Good',
      website_url: 'https://example.com/golfforgood',
      is_featured: true,
      events: [{ title: 'Youth Golf Day 2026', date: 'May 15, 2026', description: 'Annual golf day for underprivileged youth at Pine Valley.' }]
    },
    {
      name: 'Green Fairways Trust',
      description: 'Environmental conservation through sustainable golf course management. We work with courses worldwide to reduce water usage, eliminate harmful pesticides, and create wildlife habitats. Over 200 courses have adopted our Green Course certification.',
      image_url: 'https://placehold.co/400x300/1a1a27/00cec9?text=Green+Fairways',
      website_url: 'https://example.com/greenfairways',
      is_featured: true,
      events: [{ title: 'Eco Golf Summit', date: 'June 20, 2026', description: 'Annual summit on sustainable golf practices.' }]
    },
    {
      name: 'Swing for Hope',
      description: 'Mental health support programs for athletes and communities. Golf can be a powerful tool for mindfulness and mental wellbeing. Our certified counselors use golf-based therapy to help veterans, first responders, and at-risk individuals.',
      image_url: 'https://placehold.co/400x300/1a1a27/fdcb6e?text=Swing+for+Hope',
      website_url: 'https://example.com/swingforhope',
      is_featured: true,
      events: null
    },
    {
      name: 'First Tee Global',
      description: 'Building game changers by introducing young people to golf and its inherent values. Through after-school and summer programs, we teach kids core values like honesty, integrity, and perseverance.',
      image_url: 'https://placehold.co/400x300/1a1a27/a29bfe?text=First+Tee',
      website_url: 'https://example.com/firsttee',
      is_featured: false,
      events: null
    },
    {
      name: 'Birdies for the Brave',
      description: 'Supporting military members and their families through golf events and community programs. We organize charity tournaments that raise funds for veterans\' healthcare and transition services.',
      image_url: 'https://placehold.co/400x300/1a1a27/55efc4?text=Birdies+Brave',
      website_url: 'https://example.com/birdiesbrave',
      is_featured: false,
      events: [{ title: 'Veterans Charity Classic', date: 'July 4, 2026', description: 'Annual charity tournament honoring our veterans.' }]
    },
    {
      name: 'Drive Against Hunger',
      description: 'Using the golf community to fight food insecurity. Every birdie made at our charity events equals meals donated to local food banks. Last year we provided over 50,000 meals to families in need.',
      image_url: 'https://placehold.co/400x300/1a1a27/e17055?text=Drive+Hunger',
      website_url: 'https://example.com/driveagainsthunger',
      is_featured: false,
      events: null
    }
  ];

  for (const c of charities) {
    await prisma.charity.create({ data: c });
  }
  console.log('✅ Seeded 6 Charities');

  // 2. Fetch the ID of the first charity to assign to test users
  const firstCharity = await prisma.charity.findFirst();

  // 3. Seed Users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Admin123!', salt);
  const userPassword = await bcrypt.hash('User123!', salt);

  const admin = await prisma.profile.create({
    data: {
      full_name: 'Admin User',
      email: 'admin@golfgives.com',
      password: hashedPassword,
      role: 'admin',
      subscription_status: 'none'
    }
  });
  console.log('✅ Seeded Admin User (admin@golfgives.com / Admin123!)');

  const user = await prisma.profile.create({
    data: {
      full_name: 'Test Setup User',
      email: 'user1@golfgives.com',
      password: userPassword,
      role: 'user',
      charity_id: firstCharity?.id || null,
      charity_percentage: 15,
      subscription_status: 'active',
      subscription_plan: 'monthly',
      subscription_start: new Date(),
      subscription_end: new Date(new Date().setMonth(new Date().getMonth() + 1))
    }
  });
  console.log('✅ Seeded Test User (user1@golfgives.com / User123!) (Active Sub)');

  // 4. Seed Random Scores for Test User
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const playDate = new Date(today);
    playDate.setDate(playDate.getDate() - (i * 2));
    await prisma.score.create({
      data: {
        user_id: user.id,
        score: Math.floor(Math.random() * 20) + 20, // Random score between 20-39
        played_date: playDate
      }
    });
  }
  console.log('✅ Seeded 5 Scores for Test User');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
