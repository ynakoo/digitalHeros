-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `avatar_url` VARCHAR(191) NULL DEFAULT 'https://placehold.co/100x100?text=User',
    `charity_id` VARCHAR(191) NULL,
    `charity_percentage` INTEGER NOT NULL DEFAULT 10,
    `subscription_status` VARCHAR(191) NOT NULL DEFAULT 'none',
    `subscription_plan` VARCHAR(191) NULL,
    `subscription_start` DATETIME(3) NULL,
    `subscription_end` DATETIME(3) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'user',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `charities` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NOT NULL DEFAULT 'https://placehold.co/400x300?text=Charity',
    `website_url` VARCHAR(191) NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `events` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scores` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `played_date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `scores_user_id_idx`(`user_id`),
    INDEX `scores_played_date_idx`(`played_date`),
    UNIQUE INDEX `scores_user_id_played_date_key`(`user_id`, `played_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draws` (
    `id` VARCHAR(191) NOT NULL,
    `draw_date` DATETIME(3) NOT NULL,
    `draw_month` INTEGER NOT NULL,
    `draw_year` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `draw_type` VARCHAR(191) NOT NULL DEFAULT 'random',
    `winning_numbers` JSON NOT NULL,
    `total_pool_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `jackpot_rollover` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `active_subscribers` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `published_at` DATETIME(3) NULL,

    INDEX `draws_status_idx`(`status`),
    INDEX `draws_draw_date_idx`(`draw_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draw_winners` (
    `id` VARCHAR(191) NOT NULL,
    `draw_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `match_type` VARCHAR(191) NOT NULL,
    `matched_numbers` JSON NOT NULL,
    `prize_amount` DECIMAL(12, 2) NOT NULL,
    `verification_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `proof_image_url` VARCHAR(191) NULL,
    `payment_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `draw_winners_draw_id_idx`(`draw_id`),
    INDEX `draw_winners_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `donations` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `charity_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `donations_user_id_idx`(`user_id`),
    INDEX `donations_charity_id_idx`(`charity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prize_pools` (
    `id` VARCHAR(191) NOT NULL,
    `draw_id` VARCHAR(191) NOT NULL,
    `match_5_pool` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `match_4_pool` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `match_3_pool` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `jackpot_carried` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `prize_pools_draw_id_key`(`draw_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_charity_id_fkey` FOREIGN KEY (`charity_id`) REFERENCES `charities`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scores` ADD CONSTRAINT `scores_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draw_winners` ADD CONSTRAINT `draw_winners_draw_id_fkey` FOREIGN KEY (`draw_id`) REFERENCES `draws`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draw_winners` ADD CONSTRAINT `draw_winners_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donations` ADD CONSTRAINT `donations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `donations` ADD CONSTRAINT `donations_charity_id_fkey` FOREIGN KEY (`charity_id`) REFERENCES `charities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prize_pools` ADD CONSTRAINT `prize_pools_draw_id_fkey` FOREIGN KEY (`draw_id`) REFERENCES `draws`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
