import Dexie, { type Table } from 'dexie';
import { type User, type ClassSession, type Announcement, type Product, type Booking, type PromotionPlan, type SiteSettings, type TatameArea, type FinancialTransaction, type TransactionCategory } from './types';

// FIX: Replaced Dexie subclassing with a direct instance creation and type assertion.
// The class-based approach caused type resolution errors where inherited methods
// like `.version()` and `.transaction()` were not found on the subclass instance.
export const db = new Dexie('bjjAgendaDB') as Dexie & {
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
};

// By incrementing the version to 3 and simplifying the users schema, we force
// browsers with an old, corrupted DB schema to create a new, clean one.
// This is the definitive fix for the "UpgradeError: Not yet support for changing primary key".
db.version(3).stores({
  users: '++id, email, role', // Simplified schema to be more robust
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