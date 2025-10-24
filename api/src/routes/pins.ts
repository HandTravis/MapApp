import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { toPoint, validateCoordinates, parseNearParameter, NearbyPin } from '../lib/geo';

const CreatePinSchema = z.object({
  name: z.string().min(1).max(255),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function createPin(req: Request, res: Response): Promise<void> {
  try {
    const body = CreatePinSchema.parse(req.body);
    
    validateCoordinates(body.lat, body.lng);
    
    const point = toPoint(body.lat, body.lng);
    const result = await db.query(
      `INSERT INTO pins (name, geom) VALUES ($1, ${point}) RETURNING id`,
      [body.name]
    );
    
    const pinId = result.rows[0].id;
    
    res.status(201).json({
      id: pinId,
      status: 'created'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'ValidationError',
        message: error.errors[0].message
      });
      return;
    }
    
    if (error instanceof Error) {
      res.status(400).json({
        error: 'ValidationError',
        message: error.message
      });
      return;
    }
    
    console.error('Error creating pin:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to create pin'
    });
  }
}

export async function getNearbyPins(req: Request, res: Response): Promise<void> {
  try {
    const { near, radius } = req.query;
    
    if (!near || !radius) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Missing required parameters: near and radius'
      });
      return;
    }
    
    const { lat, lng } = parseNearParameter(near as string);
    const radiusMeters = parseInt(radius as string, 10);
    
    if (isNaN(radiusMeters) || radiusMeters < 1 || radiusMeters > 10000) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Radius must be a number between 1 and 10000 meters'
      });
      return;
    }
    
    const centerPoint = toPoint(lat, lng);
    
    const result = await db.query(`
      SELECT 
        id,
        name,
        ST_Y(geom::geometry) as lat,
        ST_X(geom::geometry) as lng,
        ST_Distance(geom, ${centerPoint}) as distance_m
      FROM pins 
      WHERE ST_DWithin(geom, ${centerPoint}, $1)
      ORDER BY distance_m ASC
    `, [radiusMeters]);
    
    const pins: NearbyPin[] = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      lat: parseFloat(row.lat),
      lng: parseFloat(row.lng),
      distance_m: parseFloat(row.distance_m)
    }));
    
    res.json(pins);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        error: 'ValidationError',
        message: error.message
      });
      return;
    }
    
    console.error('Error fetching nearby pins:', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to fetch nearby pins'
    });
  }
}
