
import Dexie, { type Table } from 'dexie';
import { type User, type ClassSession, type Announcement, type Product, type Booking, type TatameArea, type PromotionPlan, type SiteSettings, type TransactionCategory, type FinancialTransaction } from './types';

export class BjjAgendaDB extends Dexie {
  users!: Table<User, number>;
  classes!: Table<ClassSession, number>;
  announcements!: Table<Announcement, number>;
  products!: Table<Product, number>;
  bookings!: Table<Booking, string>;
  tatameAreas!: Table<TatameArea, string>;
  promotions!: Table<PromotionPlan, number>;
  siteSettings!: Table<SiteSettings, number>;
  financialTransactions!: Table<FinancialTransaction, number>;
  financialCategories!: Table<TransactionCategory, number>;

  constructor() {
    super('bjjAgendaDB');
    this.version(1).stores({
      users: '++id, &email, role',
      classes: '++id, day',
      announcements: '++id, date',
      products: '++id, category',
      bookings: 'id, tatameId, userId, date',
      tatameAreas: 'id',
      promotions: '++id',
      siteSettings: 'id',
      financialTransactions: '++id, date, type, categoryId',
      financialCategories: '++id, type',
    });
  }

  async resetDatabase() {
    await this.transaction('rw', this.tables, async () => {
      await Promise.all(this.tables.map(table => table.clear()));
    });
  }
}

export const db = new BjjAgendaDB();
