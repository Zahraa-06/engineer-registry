const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('../app')
const server = app.listen(8081, () => console.log('Testing Engineers on PORT 8081'))
const User = require('../models/user')
const Engineer = require('../models/engineer')
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

describe('Engineer API Tests', () => {
  let user, token

  beforeEach(async () => {
    user = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    })
    await user.save()
    token = await user.generateAuthToken()
  })

  describe('GET /api/engineers', () => {
    test('should get all engineers for authenticated user', async () => {
      // Create some engineers for the user
      const engineer1 = new Engineer({
        name: 'Fatema',
        specialty: 'Electronics',
        yearsExperience: 2,
        available: true
      })
      const engineer2 = new Engineer({
        name: 'Sara',
        specialty: 'Chemical',
        yearsExperience: 10,
        available: false
      })
      await engineer1.save()
      await engineer2.save()

      // Add engineers to user
      user.engineers.addToSet(engineer1._id, engineer2._id)
      await user.save()

      const response = await request(app)
        .get('/api/engineers')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('specialty')
      expect(response.body[0]).toHaveProperty('yearsExperience')
      expect(response.body[0]).toHaveProperty('available')
    })

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/engineers')
        .expect(401)

      expect(response.text).toBe('Not authorized')
    })
  })

  describe('GET /api/engineers/:id', () => {
    test('should get single engineer by id', async () => {
      const engineer = new Engineer({
       name: 'Fatema',
        specialty: 'Electronics',
        yearsExperience: 2,
        available: true
      })
      await engineer.save()

      const response = await request(app)
        .get(`/api/engineers/${engineer._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('name', 'Fatema')
      expect(response.body).toHaveProperty('specialty', 'Electronics')
      expect(response.body).toHaveProperty('yearsExperience', 2)
      expect(response.body).toHaveProperty('available', true)
    })

    test('should return 400 for non-existent engineer', async () => {
      const fakeId = new mongoose.Types.ObjectId()

      const response = await request(app)
        .get(`/api/engineers/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400)

      expect(response.body).toHaveProperty('message')
    })
  })

  describe('POST /api/engineers', () => {
    test('should create new engineer successfully', async () => {
      const engineerData = {
        name: 'Mohamed',
        specialty: 'Mechanical',
        yearsExperience: 4,
        available: true
      }

      const response = await request(app)
        .post('/api/engineers')
        .set('Authorization', `Bearer ${token}`)
        .send(engineerData)
        .expect(201)

      expect(response.body).toHaveProperty('name', engineerData.name)
      expect(response.body).toHaveProperty('specialty', engineerData.specialty)
      expect(response.body).toHaveProperty('yearsExperience', engineerData.yearsExperience)
      expect(response.body).toHaveProperty('available', engineerData.available)

      // Verify engineer was added to user's engineers array
      const updatedUser = await User.findById(user._id).populate('engineers')
      expect(updatedUser.engineers).toHaveLength(1)
      expect(updatedUser.engineers[0].name).toBe(engineerData.name)
    })

    test('should handle checkbox conversion correctly', async () => {
      const engineerData = {
        name: 'Maryam',
        specialty: 'Electrical',
        yearsExperience: 5,
        available: 'on' // Checkbox sends 'on' when checked
      }

      const response = await request(app)
        .post('/api/engineers')
        .set('Authorization', `Bearer ${token}`)
        .send(engineerData)
        .expect(201)

      expect(response.body).toHaveProperty('available', true)
    })

    test('should return 401 without token', async () => {
      const engineerData = {
        name: 'Sakina',
        specialty: 'Electrical',
        yearsExperience: 7,
        available: true 
      }

      const response = await request(app)
        .post('/api/engineers')
        .send(engineerData)
        .expect(401)

      expect(response.text).toBe('Not authorized')
    })
  })

  describe('PUT /api/engineers/:id', () => {
    test('should update engineer successfully', async () => {
      const engineer = new Engineer({
        name: 'Fatema',
        specialty: 'Electronics',
        yearsExperience: 2,
        available: true
      })
      await engineer.save()

      const updateData = {
        name: 'Luluwa',
        specialty: 'Instrumentation',
        yearsExperience: 23,
        available: true
      }

      const response = await request(app)
        .put(`/api/engineers/${engineer._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('name', updateData.name)
      expect(response.body).toHaveProperty('specialty', updateData.specialty)
      expect(response.body).toHaveProperty('yearsExperience', updateData.yearsExperience)
      expect(response.body).toHaveProperty('available', updateData.available)
    })

    test('should handle checkbox conversion in updates', async () => {
      const engineer = new Engineer({
        name: 'Fatema',
        specialty: 'Electronics',
        yearsExperience: 2,
        available: true
      })
      await engineer.save()

      const updateData = {
        name: 'Fatema',
        specialty: 'Electronics',
        yearsExperience: 2,
        available: 'on'
      }

      const response = await request(app)
        .put(`/api/engineers/${engineer._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toHaveProperty('available', true)
    })
  })

  describe('DELETE /api/engineers/:id', () => {
    test('should delete engineer successfully', async () => {
      const engineer = new Engineer({
        name: 'Fatema',
        specialty: 'Electronics',
        yearsExperience: 2,
        available: true
      })
      await engineer.save()

      const response = await request(app)
        .delete(`/api/engineers/${engineer._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', 'Engineer successfully deleted')

      // Verify engineer is actually deleted
      const deletedEngineer = await Engineer.findById(engineer._id)
      expect(deletedEngineer).toBeNull()
    })

    test('should return 401 without token', async () => {
      const engineer = new Engineer({
        name: 'Fatema',
        specialty: 'Electronics',
        yearsExperience: 2,
        available: true
      })
      await engineer.save()

      const response = await request(app)
        .delete(`/api/engineers/${engineer._id}`)
        .expect(401)

      expect(response.text).toBe('Not authorized')
    })
  })
}) 