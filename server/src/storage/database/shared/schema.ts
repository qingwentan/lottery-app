import { pgTable, serial, varchar, timestamp, integer, boolean, text, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable(
	"users",
	{
		id: serial().primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		employee_id: varchar("employee_id", { length: 50 }).notNull().unique(), // 工号
		role: varchar("role", { length: 20 }).notNull().default("employee"), // employee（员工）、leader（领导）、admin（管理员）
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("users_employee_id_idx").on(table.employee_id),
		index("users_role_idx").on(table.role),
	]
);

// 抽奖活动表
export const lotteryEvents = pgTable(
	"lottery_events",
	{
		id: serial().primaryKey(),
		title: varchar("title", { length: 200 }).notNull(),
		description: text("description"),
		is_active: boolean("is_active").default(true).notNull(),
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("lottery_events_is_active_idx").on(table.is_active),
	]
);

// 奖项表
export const prizes = pgTable(
	"prizes",
	{
		id: serial().primaryKey(),
		event_id: integer("event_id").notNull().references(() => lotteryEvents.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 200 }).notNull(), // 奖项名称，如"一等奖"
		level: integer("level").notNull(), // 奖项等级，1=一等奖，2=二等奖，3=三等奖
		quantity: integer("quantity").notNull().default(1), // 奖项数量
		remaining_quantity: integer("remaining_quantity").notNull(), // 剩余数量
		description: text("description"), // 奖项描述
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
		updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("prizes_event_id_idx").on(table.event_id),
		index("prizes_level_idx").on(table.level),
	]
);

// 中奖记录表
export const winnerRecords = pgTable(
	"winner_records",
	{
		id: serial().primaryKey(),
		event_id: integer("event_id").notNull().references(() => lotteryEvents.id, { onDelete: "cascade" }),
		prize_id: integer("prize_id").notNull().references(() => prizes.id, { onDelete: "cascade" }),
		user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
		created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	},
	(table) => [
		index("winner_records_event_id_idx").on(table.event_id),
		index("winner_records_prize_id_idx").on(table.prize_id),
		index("winner_records_user_id_idx").on(table.user_id),
	]
);
