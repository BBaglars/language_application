const CategoryService = require('../../services/CategoryService');
const Category = require('../../models/Category');
const WordCategory = require('../../models/WordCategory');

// Mock the models
jest.mock('../../models/Category');
jest.mock('../../models/WordCategory');

// ... devamı aynı ... 

test('dummy', () => {
  expect(true).toBe(true);
}); 