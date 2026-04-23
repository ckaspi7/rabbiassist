import { z } from 'zod';

// Sanitize filename to prevent path traversal attacks
export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

// User profile validation
export const userProfileSchema = z.object({
  email: z.string().email().max(255),
  phone_number: z.string().max(50).optional().nullable(),
  full_name: z.string().trim().min(1).max(200).optional().nullable(),
  pushover_user_key: z.string().max(100).optional().nullable(),
});

// Reminder validation
export const reminderSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().max(1000, 'Description must be less than 1000 characters').optional().nullable(),
  due_date: z.string().datetime().optional().nullable(),
  source: z.string().trim().min(1, 'Source is required').max(50),
  reminder_type: z.string().max(50).optional().nullable(),
  // Allow additional fields that might be present
}).passthrough();

// Trip validation
export const tripSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  destination: z.string().trim().max(200, 'Destination must be less than 200 characters').optional().nullable(),
  start_date: z.string().date().optional().nullable(),
  end_date: z.string().date().optional().nullable(),
});

// Document validation
export const documentSchema = z.object({
  file_name: z.string().trim().min(1, 'File name is required').max(255, 'File name must be less than 255 characters').transform(sanitizeFilename),
  original_name: z.string().trim().max(255, 'Original name must be less than 255 characters').optional().nullable().transform(val => val ? sanitizeFilename(val) : val),
  type: z.string().max(50).optional().nullable(),
  mime_type: z.string().max(100).optional().nullable(),
});

// Receipt validation
export const receiptSchema = z.object({
  vendor: z.string().trim().max(200, 'Vendor name must be less than 200 characters').optional().nullable(),
  details: z.string().trim().max(1000, 'Details must be less than 1000 characters').optional().nullable(),
  total_amount: z.string().max(50).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  expense_date: z.string().date().optional().nullable(),
});

// Password validation with strong requirements
export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
