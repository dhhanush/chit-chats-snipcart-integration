import { NextApiRequest, NextApiResponse } from 'next';
import { getShipments } from '../../../utils/chitchats';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const params = new URLSearchParams(req.query);
    console.log(req.query);
    res.status(200).json(
      Array.from({ length: Math.ceil(Math.random() * 10) }, (_, i) => ({
        id: `SHIP-${i}-BATCH-${req.query.batch_id}`,
      }))
    );
  }
}