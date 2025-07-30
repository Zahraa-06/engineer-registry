const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('../app')
const server = app.listen(8082, () => console.log('Integration Testing on PORT 8082'))
const User = require('../models/user')
const Engineer = require('../models/engineer')
const { log } = require('console')
let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri(), { useNewUrlParser: true, useUnifiedTopology: true })
})

afterAll(async () => {
  await mongoose.connection.close()
  mongoServer.stop()
  server.close()
})

afterEach(async () => {
  await User.deleteMany({})
  await Engineer.deleteMany({})
})

describe('Integration Tests', () => {
  describe('Complete User and Engineer Flow', () => {
    test('should create user, login, and manage engineers', async () => {
      // Step 1: Create a new user
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201)

      expect(createResponse.body).toHaveProperty('user')
      expect(createResponse.body).toHaveProperty('token')
      const authToken = createResponse.body.token

      // Step 2: Login with the created user
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200)

      expect(loginResponse.body).toHaveProperty('token')
      const loginToken = loginResponse.body.token

      // Step 3: Get user profile
      const profileResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200)

      expect(profileResponse.body.user.name).toBe(userData.name)
      expect(profileResponse.body.user.email).toBe(userData.email)

      // Step 4: Create a engineer
      const engineerData = {
        name: 'Fatema',
        specialty: 'Electronics',
        yearsExperience: 2,
        available: true 
      }

      const createEngineerResponse = await request(app)
        .post('/api/engineers')
        .set('Authorization', `Bearer ${loginToken}`)
        .send(engineerData)
        .expect(201)

      expect(createEngineerResponse.body.name).toBe(engineerData.name)
      expect(createEngineerResponse.body.specialty).toBe(engineerData.specialty)
      expect(createEngineerResponse.body.yearsExperience).toBe(engineerData.yearsExperience)
      expect(createEngineerResponse.body.available).toBe(engineerData.available)      

      const engineerId = createEngineerResponse.body._id

      // Step 5: Get all engineers
      const getEngineersResponse = await request(app)
        .get('/api/engineers')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200)

      expect(Array.isArray(getEngineersResponse.body)).toBe(true)
      expect(getEngineersResponse.body).toHaveLength(1)
      expect(getEngineersResponse.body[0].name).toBe(engineerData.name)

      // Step 6: Get single engineer
      const getEngineerResponse = await request(app)
        .get(`/api/engineers/${engineerId}`)
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200)

      expect(getEngineerResponse.body.name).toBe(engineerData.name)

      // Step 7: Update engineer
      const updateData = {
        name: 'Zainab',
        specialty: 'Telecommunications & Network',
        yearsExperience: 2,
        available: false
      }

      const updateEngineerResponse = await request(app)
        .put(`/api/engineers/${engineerId}`)
        .set('Authorization', `Bearer ${loginToken}`)
        .send(updateData)
        .expect(200)

      expect(updateEngineerResponse.body.name).toBe(updateData.name)
      expect(updateEngineerResponse.body.specialty).toBe(updateData.specialty)
      expect(updateEngineerResponse.body.yearsExperience).toBe(updateData.yearsExperience)
      expect(updateEngineerResponse.body.available).toBe(updateData.available)

      // Step 8: Delete engineer
      const deleteEngineerResponse = await request(app)
        .delete(`/api/engineers/${engineerId}`)
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200)

      expect(deleteEngineerResponse.body.message).toBe('Engineer successfully deleted')

      // Step 9: Verify engineer is deleted
      const getEngineersAfterDeleteResponse = await request(app)
        .get('/api/engineers')
        .set('Authorization', `Bearer ${loginToken}`)
        .expect(200)

      expect(getEngineersAfterDeleteResponse.body).toHaveLength(0)
    })
  })

  describe('Authentication Flow', () => {
    test('should handle authentication errors properly', async () => {
      // Try to access protected route without token
      const noTokenResponse = await request(app)
        .get('/api/engineers')
        .expect(401)

      expect(noTokenResponse.text).toBe('Not authorized')

      // Try to access protected route with invalid token
      const invalidTokenResponse = await request(app)
        .get('/api/engineers')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(invalidTokenResponse.text).toBe('Not authorized')

      // Try to access protected route with malformed token
      const malformedTokenResponse = await request(app)
        .get('/api/engineers')
        .set('Authorization', 'Bearer')
        .expect(401)

      expect(malformedTokenResponse.text).toBe('Not authorized')
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid data gracefully', async () => {
      // Try to create user with invalid data
      const invalidUserResponse = await request(app)
        .post('/api/users')
        .send({})
        .expect(400)

      expect(invalidUserResponse.body).toHaveProperty('message')

      // Try to login with non-existent user
      const invalidLoginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(400)

      expect(invalidLoginResponse.body.message).toBe('Invalid login credentials')
    })
  })
}) 