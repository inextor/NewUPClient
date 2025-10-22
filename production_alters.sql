-- Production Database ALTER statements for Checkout feature
-- Date: 2025-10-21
-- Run this on production database: mysql -u[user] -p[pass] UPDatabase < production_alters.sql

-- ==================================================================
-- CART TABLE: Rename column to match code
-- ==================================================================
ALTER TABLE `cart`
CHANGE COLUMN `ecommerce_item` `ecommerce_item_id` INT(11) NOT NULL;

-- ==================================================================
-- ORDER_ITEM TABLE: Add variation and update unique constraint
-- ==================================================================

-- Step 1: Drop the old unique constraint
ALTER TABLE `order_item`
DROP INDEX `unique_order_item`;

-- Step 2: Add variation column
ALTER TABLE `order_item`
ADD COLUMN `variation` VARCHAR(50) NULL AFTER `ecommerce_item_id`;

-- Step 3: Create new unique constraint including variation
-- This allows the same product in different sizes in the same order
ALTER TABLE `order_item`
ADD UNIQUE KEY `unique_order_item` (`order_id`, `ecommerce_item_id`, `variation`);

-- ==================================================================
-- VERIFICATION QUERIES (run these to verify changes)
-- ==================================================================
-- DESCRIBE `cart`;
-- DESCRIBE `order_item`;
-- SHOW CREATE TABLE `cart`;
-- SHOW CREATE TABLE `order_item`;
