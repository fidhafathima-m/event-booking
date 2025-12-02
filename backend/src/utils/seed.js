import mongoose from 'mongoose';
import User from '../models/User.js';
import Service from '../models/Service.js'
import dotenv from "dotenv"
dotenv.config()

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      phone: '+1234567890',
      role: 'admin'
    });

    // Create provider user
    const provider = await User.create({
      name: 'Service Provider',
      email: 'provider@example.com',
      password: 'provider123',
      phone: '+1987654321',
      role: 'provider'
    });

    // Create regular user
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123',
      phone: '+1122334455',
      role: 'user'
    });

    console.log('👥 Created users');

    // Sample services data
    const services = [
      {
        title: 'Grand Wedding Hall',
        description: 'Elegant wedding hall with capacity for 500 guests, perfect for grand weddings.',
        category: 'venue',
        pricePerDay: 5000,
        location: 'New York, NY',
        provider: provider._id,
        contactInfo: {
          email: 'venue@example.com',
          phone: '+1234567890',
          address: '123 Wedding St, New York, NY'
        },
        images: ['venue1.jpg', 'venue2.jpg'],
        features: ['Air Conditioning', 'Parking', 'Catering Kitchen', 'Stage'],
        capacity: 500,
        rating: 4.8,
        tags: ['luxury', 'indoor', 'grand']
      },
      {
        title: 'Delicious Catering Services',
        description: 'Professional catering for all types of events with customizable menus.',
        category: 'caterer',
        pricePerDay: 2000,
        location: 'Los Angeles, CA',
        provider: provider._id,
        contactInfo: {
          email: 'catering@example.com',
          phone: '+1987654321',
          address: '456 Food Ave, Los Angeles, CA'
        },
        images: ['catering1.jpg', 'catering2.jpg'],
        features: ['Vegetarian Options', 'Vegan Options', 'Custom Menu', 'Serving Staff'],
        rating: 4.6,
        tags: ['food', 'catering', 'professional']
      },
      {
        title: 'Professional Wedding Photography',
        description: 'Award-winning wedding photography team with 10+ years of experience.',
        category: 'photographer',
        pricePerDay: 1500,
        location: 'Chicago, IL',
        provider: provider._id,
        contactInfo: {
          email: 'photo@example.com',
          phone: '+1122334455',
          address: '789 Photo St, Chicago, IL'
        },
        images: ['photo1.jpg', 'photo2.jpg'],
        features: ['Full Day Coverage', 'Edited Photos', 'Online Gallery', 'Print Rights'],
        rating: 4.9,
        tags: ['photography', 'professional', 'creative']
      }
    ];

    // Create services
    await Service.insertMany(services);
    console.log('Created services');

    console.log('Database seeded successfully');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Provider: provider@example.com / provider123');
    console.log('User: user@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();