import Dexie, { type Table } from 'dexie';
import { type User, type ClassSession, type Announcement, type Product, type Booking, type PromotionPlan, type SiteSettings, type TatameArea, type FinancialTransaction, type TransactionCategory } from './types';

// FIX: Switched to the recommended class-based approach for Dexie with TypeScript.
// This correctly types the database instance, including all tables and Dexie's methods,
// resolving errors where properties like '.version()' or '.transaction()' were not found.
export class BJJAgendaDB extends Dexie {
  users!: Table<User, number>;
  classes!: Table<ClassSession, number>;
  announcements!: Table<Announcement, number>;
  products!: Table<Product, number>;
  bookings!: Table<Booking, number>;
  promotions!: Table<PromotionPlan, number>;
  siteSettings!: Table<SiteSettings, number>;
  tatameAreas!: Table<TatameArea, string>;
  financialTransactions!: Table<FinancialTransaction, number>;
  financialCategories!: Table<TransactionCategory, number>;

  constructor() {
    super('bjjAgendaDB');
    this.version(1).stores({
      users: '++id, &email, role',
      classes: '++id, day',
      announcements: '++id, date',
      products: '++id, category',
      bookings: '++id, &bookingKey, date, tatameId, userId',
      promotions: '++id, name',
      siteSettings: 'id',
      tatameAreas: 'id',
      financialTransactions: '++id, date, type, categoryId',
      financialCategories: '++id, name, type',
    });
  }
}

export const db = new BJJAgendaDB();
