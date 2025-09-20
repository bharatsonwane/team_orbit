import { Request, Response, NextFunction } from 'express';
import Lookup from '../services/lookup.service';

export const retrieveLookupList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await Lookup.retrieveLookupList(req.db);
    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
};

export const getLookupTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await Lookup.getLookupTypeById(req.db, parseInt(id));
    res.status(200).send(data);
  } catch (error) {
    next(error);
  }
};
