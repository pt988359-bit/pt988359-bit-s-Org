import { BaseRepository } from './BaseRepository';
import { SellRequest } from '../../types';

export class SellRequestRepository extends BaseRepository<SellRequest> {
  constructor() {
    super('sell_requests');
  }
}

export const defaultSellRequestRepository = new SellRequestRepository();
