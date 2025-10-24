import { Request, Response } from 'express';

export function healthHandler(req: Request, res: Response): void {
  res.status(200).send('ok');
}

export function readyHandler(req: Request, res: Response): void {
  res.status(200).send('ready');
}
