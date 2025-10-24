import { Request, Response } from 'express';
import { createPin, getNearbyPins } from './pins';

// Mock the database
jest.mock('../lib/db', () => ({
  db: {
    query: jest.fn()
  }
}));

describe('Pins Routes', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
  });

  describe('createPin', () => {
    it('should create a pin with valid data', async () => {
      const { db } = require('../lib/db');
      db.query.mockResolvedValueOnce({
        rows: [{ id: 'test-id' }]
      });

      mockRequest = {
        body: {
          name: 'Test Pin',
          lat: 40.7128,
          lng: -74.0060
        }
      };

      await createPin(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        id: 'test-id',
        status: 'created'
      });
    });

    it('should return 400 for invalid data', async () => {
      mockRequest = {
        body: {
          name: '',
          lat: 91, // Invalid latitude
          lng: -74.0060
        }
      };

      await createPin(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'ValidationError',
        message: expect.any(String)
      });
    });
  });

  describe('getNearbyPins', () => {
    it('should return nearby pins', async () => {
      const { db } = require('../lib/db');
      db.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'pin-1',
            name: 'Test Pin 1',
            lat: 40.7128,
            lng: -74.0060,
            distance_m: 100.5
          }
        ]
      });

      mockRequest = {
        query: {
          near: '40.7128,-74.0060',
          radius: '1000'
        }
      };

      await getNearbyPins(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith([
        {
          id: 'pin-1',
          name: 'Test Pin 1',
          lat: 40.7128,
          lng: -74.0060,
          distance_m: 100.5
        }
      ]);
    });

    it('should return 400 for missing parameters', async () => {
      mockRequest = {
        query: {}
      };

      await getNearbyPins(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'ValidationError',
        message: 'Missing required parameters: near and radius'
      });
    });
  });
});
