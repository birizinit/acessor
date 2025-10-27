// Database schema using Drizzle ORM - referenced from blueprint:javascript_database
import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  supabaseId: uuid("supabase_id").unique(), // Referência ao usuário do Supabase Auth
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  profileImage: text("profile_image"),
  apiToken: text("api_token"), // Token da API externa (MyBroker)
  phone: text("phone"),
  cpf: text("cpf"),
  birthDate: text("birth_date"),
  country: text("country"),
  city: text("city"),
  gender: text("gender"),
  language: text("language").default("pt-br"),
  preferences: text("preferences"), // JSON string para preferências
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
