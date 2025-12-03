import request from "supertest"
import mongoose from "mongoose";
import app from '../src/app'
import User from "../src/models/User";
import Service from "../src/models/Service";
import Booking from "../src/models/Booking";
import dotenv from "dotenv";
dotenv.config();


let authToken;
let adminToken;
let serviceId;
let userId;

describe('Event Booking API Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create test users
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });

    const user = await User.create({
      name: 'User Test',
      email: 'user@test.com',
      password: 'password123',
      role: 'user'
    });

    userId = user._id;

    // Get tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminRes.body.data.token;

    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'password123' });
    authToken = userRes.body.data.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Services API', () => {
    it('should create a new service (admin)', async () => {
      const serviceData = {
        title: 'Test Service',
        description: 'Test description',
        category: 'venue',
        pricePerDay: 1000,
        location: 'Test Location',
        contactInfo: {
          email: 'test@test.com',
          phone: '1234567890',
          address: 'Test Address'
        }
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service).toHaveProperty('title', serviceData.title);
      serviceId = response.body.data.service._id;
    });

    it('should get all services', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.services)).toBe(true);
    });

    it('should get service by ID', async () => {
      const response = await request(app)
        .get(`/api/services/${serviceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service).toHaveProperty('_id', serviceId);
    });
  });

  describe('Bookings API', () => {
    it('should create a booking', async () => {
      const bookingData = {
        serviceId: serviceId,
        startDate: '2024-12-15',
        endDate: '2024-12-17',
        guestsCount: 10
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.booking).toHaveProperty('status', 'pending');
    });

    it('should get user bookings', async () => {
      const response = await request(app)
        .get('/api/users/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
    });
  });

  describe('Admin API', () => {
    it('should get platform stats', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toHaveProperty('totalUsers');
    });

    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });
  });
});