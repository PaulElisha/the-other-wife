CREATE TYPE "public"."auth_type" AS ENUM('email', 'phone_number');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('inactive', 'active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('customer', 'vendor', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_token" varchar(255),
	"email_token_ms" varchar(255),
	"refresh_token" varchar(255),
	"refresh_token_ms" varchar(255),
	"password" varchar(255),
	"phone_number" varchar(255),
	"status" "status" DEFAULT 'inactive',
	"user_type" "user_type" DEFAULT 'customer',
	"auth_type" "auth_type" DEFAULT 'email',
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"lastLogin" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"address" varchar(255),
	"label" varchar(255),
	"city" varchar(255),
	"state" varchar(255),
	"country" varchar(255),
	"postal_code" varchar(255),
	"latitude" integer,
	"longitude" integer,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"meal_id" integer NOT NULL,
	"price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"total_price" integer,
	CONSTRAINT "cart_items_cart_id_meal_id_unique" UNIQUE("cart_id","meal_id")
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"total_amount" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"address_id" integer,
	"profile_image" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"category_name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"available" varchar DEFAULT 'pending',
	"available_from" varchar(255) NOT NULL,
	"available_till" varchar(255) NOT NULL,
	"primary_image" varchar(255) NOT NULL,
	"additional_images" varchar(255)[],
	"tags" varchar(255)[] NOT NULL,
	"prep_time" varchar(255),
	"serving_size" varchar(255),
	"additional_data" varchar(255),
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"address_id" integer,
	"business_name" varchar(255),
	"business_desc" varchar(255),
	"business_logo" varchar(255),
	"approved_by" integer,
	"approval_status" varchar(255),
	"approved_at" timestamp,
	"rejection" varchar(255),
	"additional_data" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"slug" varchar(255),
	"description" text,
	"icon" varchar(255),
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mealcategories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255),
	"description" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;