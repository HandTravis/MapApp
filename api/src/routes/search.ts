import { Request, Response } from 'express';

interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
}

// Mock POI data
const mockPOIs: POI[] = [
  {
    id: 'poi_1',
    name: 'Starbucks Coffee',
    lat: 40.7128,
    lng: -74.0060,
    category: 'coffee shop'
  },
  {
    id: 'poi_2',
    name: 'McDonald\'s',
    lat: 40.7589,
    lng: -73.9851,
    category: 'restaurant'
  },
  {
    id: 'poi_3',
    name: 'Central Park',
    lat: 40.7829,
    lng: -73.9654,
    category: 'park'
  },
  {
    id: 'poi_4',
    name: 'Times Square',
    lat: 40.7580,
    lng: -73.9855,
    category: 'landmark'
  },
  {
    id: 'poi_5',
    name: 'Brooklyn Bridge',
    lat: 40.7061,
    lng: -73.9969,
    category: 'landmark'
  },
  {
    id: 'poi_6',
    name: 'Dunkin\' Donuts',
    lat: 40.7505,
    lng: -73.9934,
    category: 'coffee shop'
  },
  {
    id: 'poi_7',
    name: 'Subway',
    lat: 40.7614,
    lng: -73.9776,
    category: 'restaurant'
  },
  {
    id: 'poi_8',
    name: 'High Line Park',
    lat: 40.7480,
    lng: -74.0048,
    category: 'park'
  }
];

export function searchPOIs(req: Request, res: Response): void {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Search query is required and must not be empty'
      });
      return;
    }
    
    const query = q.trim().toLowerCase();
    
    // Simple text search in name and category
    const results = mockPOIs.filter(poi => 
      poi.name.toLowerCase().includes(query) ||
      poi.category.toLowerCase().includes(query)
    );
    
    res.json(results);
  } catch (error) {
    console.error('Error searching POIs:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to search POIs'
    });
  }
}
