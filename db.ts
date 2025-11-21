import Dexie, { type Table } from 'dexie';
import { type User, type ClassSession, type Announcement, type Product, type Booking, type PromotionPlan, type SiteSettings, type TatameArea, type FinancialTransaction, type TransactionCategory } from './types';

// FIX: Reverted to an interface-based Dexie setup with type casting.
// The class-based approach was causing TypeScript errors where methods from the Dexie
// superclass were not being recognized. This approach explicitly types the db instance.
interface BJJAgendaDB extends Dexie {
  users: Table<User, number>;
  classes: Table<ClassSession, number>;
  announcements: Table<Announcement, number>;
  products: Table<Product, number>;
  bookings: Table<Booking, number>;
  promotions: Table<PromotionPlan, number>;
  siteSettings: Table<SiteSettings, number>;
  tatameAreas: Table<TatameArea, string>;
  financialTransactions: Table<FinancialTransaction, number>;
  financialCategories: Table<TransactionCategory, number>;
}

export const db = new Dexie('bjjAgendaDB') as BJJAgendaDB;

db.version(1).stores({
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
