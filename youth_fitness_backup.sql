/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badge_definitions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `points_reward` int(11) DEFAULT 50,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_badge_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `badge_definitions` VALUES (1,'FIRST_WORKOUT','First Steps','Complete your first workout',NULL,50,1,'2026-02-16 17:12:28'),(2,'HYDRATION_HERO','Hydration Hero','Drink 8 cups of water for 7 days straight',NULL,150,1,'2026-02-16 17:12:28'),(3,'WEEK_WARRIOR','Week Warrior','Complete 7 workouts in a week',NULL,50,1,'2026-02-16 17:12:28'),(4,'SLEEP_CHAMPION','Sleep Champion','Get 8+ hours of sleep for 7 days straight',NULL,150,1,'2026-02-16 17:12:28'),(5,'POINT_MASTER','Point Master','Earn 1000 points',NULL,50,1,'2026-02-16 17:12:28'),(6,'CONSISTENCY_KING','Consistency King','Work out 5 days a week for 4 weeks',NULL,400,1,'2026-02-16 17:12:28'),(7,'FITNESS_FANATIC','Fitness Fanatic','Complete 100 workouts',NULL,500,1,'2026-02-16 17:12:28'),(8,'WELLNESS_WIZARD','Wellness Wizard','Log wellness metrics for 100 days',NULL,50,1,'2026-02-16 17:12:28'),(9,'streak_7','Week Warrior','Maintain a 7-day activity streak','🔥',100,1,'2026-02-25 16:42:36'),(10,'streak_30','Monthly Master','Maintain a 30-day activity streak','⭐',300,1,'2026-02-25 16:42:36'),(11,'wellness_warrior','Wellness Warrior','Log wellness data for 30 days','💪',200,1,'2026-02-25 16:42:36'),(12,'nutrition_ninja','Nutrition Ninja','Log meals for 30 days','🥗',200,1,'2026-02-25 16:42:36'),(13,'early_bird','Early Bird','Complete 10 morning workouts','🌅',100,1,'2026-02-25 16:42:36');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coach_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `coach_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `assigned_by_admin_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_assignment` (`user_id`),
  KEY `idx_coach_id` (`coach_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_assigned_at` (`assigned_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `coach_assignments` VALUES (1,5,7,6,'2026-06-17 13:17:05','2026-06-17 13:17:05');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coach_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `coach_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sender_role` enum('coach','user') NOT NULL,
  `message_type` enum('text','image','video','file','voice') NOT NULL DEFAULT 'text',
  `content` text DEFAULT NULL,
  `voice_url` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_url` varchar(1000) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_coach_user` (`coach_id`,`user_id`),
  KEY `idx_user_unread` (`user_id`,`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coach_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `goals` text NOT NULL,
  `preferred_style` varchar(255) DEFAULT NULL,
  `special_requirements` text DEFAULT NULL,
  `status` enum('pending','assigned','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_status_created` (`status`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `coach_requests` VALUES (1,7,'i want guidance on the workout i do','lose 10kgs this month ','motivational',NULL,'assigned','2026-06-17 13:16:13','2026-06-17 13:17:05');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `daily_wellness_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `log_date` date NOT NULL,
  `water_ml` int(10) unsigned DEFAULT NULL,
  `sleep_hours` decimal(4,2) DEFAULT NULL,
  `mood_score` tinyint(4) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `steps` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_daily_wellness_user_date` (`user_id`,`log_date`),
  KEY `idx_daily_wellness_date` (`log_date`),
  KEY `idx_daily_wellness_user_date` (`user_id`,`log_date`),
  CONSTRAINT `fk_daily_wellness_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `daily_wellness_logs` VALUES (1,4,'2026-06-15',2000,8.00,2,NULL,'2026-06-15 18:16:59','2026-06-15 18:30:50',0),(18,7,'2026-06-17',1500,4.00,NULL,NULL,'2026-06-17 12:23:23','2026-06-17 12:23:32',0),(27,7,'2026-07-01',1250,NULL,NULL,NULL,'2026-07-01 17:10:03','2026-07-01 17:10:08',0);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercise_reminder_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `reminder_id` bigint(20) unsigned DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_exercise_logs_user` (`user_id`),
  KEY `fk_exercise_logs_reminder` (`reminder_id`),
  CONSTRAINT `fk_exercise_logs_reminder` FOREIGN KEY (`reminder_id`) REFERENCES `reminders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_exercise_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `exercise_reminder_logs` VALUES (1,4,NULL,'2026-06-15 18:06:07'),(2,4,NULL,'2026-06-15 18:06:07'),(3,5,NULL,'2026-06-15 18:58:45'),(4,6,NULL,'2026-06-15 18:59:10'),(5,6,NULL,'2026-06-15 18:59:10'),(6,7,NULL,'2026-06-17 09:08:32'),(7,7,NULL,'2026-06-17 09:08:32'),(8,6,NULL,'2026-06-17 12:24:06'),(9,6,NULL,'2026-06-17 12:24:06'),(10,5,NULL,'2026-06-17 13:04:08'),(11,5,NULL,'2026-06-17 13:04:08'),(12,8,NULL,'2026-06-17 13:07:35'),(13,8,NULL,'2026-06-17 13:07:35'),(14,7,NULL,'2026-07-01 17:04:27'),(15,7,NULL,'2026-07-01 17:04:27');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_unread` (`user_id`,`is_read`),
  KEY `idx_user_created` (`user_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `notifications` VALUES (1,6,'coach_request','New Coach Request','Lucy Mwongeli has requested a coach. Please review and assign one.','/dashboard',0,'2026-06-17 13:16:13'),(2,7,'coach_assigned','Coach Assigned!','A coach has been assigned to support your fitness journey.','/profile',0,'2026-06-17 13:17:05'),(3,5,'coach_assigned','New Athlete Assigned','A new athlete has been assigned to you. Visit your dashboard.','/dashboard',0,'2026-06-17 13:17:05');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `otp_verifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent_youth_relationships` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint(20) unsigned NOT NULL,
  `youth_id` bigint(20) unsigned NOT NULL,
  `relationship_type` varchar(50) DEFAULT 'parent',
  `verification_code` varchar(10) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_relationship` (`parent_id`,`youth_id`),
  UNIQUE KEY `verification_code` (`verification_code`),
  KEY `idx_parent_youth_parent` (`parent_id`),
  KEY `idx_parent_youth_youth` (`youth_id`),
  CONSTRAINT `fk_parent_relationship` FOREIGN KEY (`parent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_youth_relationship` FOREIGN KEY (`youth_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `parent_youth_relationships` VALUES (1,8,7,'parent','HYXGOI',1,'2026-06-17 13:08:35','2026-06-17 13:13:35');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `point_transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `points_delta` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `reason_code` varchar(100) NOT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` bigint(20) unsigned DEFAULT NULL,
  `occurred_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_points_user_time` (`user_id`,`occurred_at`),
  KEY `idx_points_reason` (`reason_code`),
  CONSTRAINT `fk_point_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `point_transactions` VALUES (1,4,3,'Logged meal','meal',1,'',NULL,NULL,'2026-06-15 18:16:51','2026-06-15 18:16:51'),(2,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:16:59','2026-06-15 18:16:59'),(3,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:16:59','2026-06-15 18:16:59'),(4,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:16:59','2026-06-15 18:16:59'),(5,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:16:59','2026-06-15 18:16:59'),(6,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:17:00','2026-06-15 18:17:00'),(7,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:17:00','2026-06-15 18:17:00'),(8,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:17:00','2026-06-15 18:17:00'),(9,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:17:00','2026-06-15 18:17:00'),(10,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:17:04','2026-06-15 18:17:04'),(11,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:17:05','2026-06-15 18:17:05'),(12,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:17:06','2026-06-15 18:17:06'),(13,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:17:10','2026-06-15 18:17:10'),(14,4,10,'Completed workout','workout',1,'',NULL,NULL,'2026-06-15 18:17:35','2026-06-15 18:17:35'),(15,4,50,'Earned badge: FIRST_WORKOUT','badge',1,'',NULL,NULL,'2026-06-15 18:17:35','2026-06-15 18:17:35'),(16,4,10,'Completed workout','workout',2,'',NULL,NULL,'2026-06-15 18:17:35','2026-06-15 18:17:35'),(17,4,10,'Completed workout','workout',3,'',NULL,NULL,'2026-06-15 18:17:35','2026-06-15 18:17:35'),(18,4,10,'Completed workout','workout',4,'',NULL,NULL,'2026-06-15 18:17:35','2026-06-15 18:17:35'),(19,4,10,'Completed workout','workout',5,'',NULL,NULL,'2026-06-15 18:17:35','2026-06-15 18:17:35'),(20,4,10,'Completed workout','workout',6,'',NULL,NULL,'2026-06-15 18:17:35','2026-06-15 18:17:35'),(21,4,10,'Completed workout','workout',7,'',NULL,NULL,'2026-06-15 18:30:23','2026-06-15 18:30:23'),(22,4,10,'Completed workout','workout',8,'',NULL,NULL,'2026-06-15 18:30:23','2026-06-15 18:30:23'),(23,4,10,'Completed workout','workout',9,'',NULL,NULL,'2026-06-15 18:30:23','2026-06-15 18:30:23'),(24,4,10,'Completed workout','workout',10,'',NULL,NULL,'2026-06-15 18:30:23','2026-06-15 18:30:23'),(25,4,10,'Completed workout','workout',11,'',NULL,NULL,'2026-06-15 18:30:23','2026-06-15 18:30:23'),(26,4,10,'Completed workout','workout',12,'',NULL,NULL,'2026-06-15 18:30:23','2026-06-15 18:30:23'),(27,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:30:35','2026-06-15 18:30:35'),(28,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:30:37','2026-06-15 18:30:37'),(29,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:30:39','2026-06-15 18:30:39'),(30,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:30:40','2026-06-15 18:30:40'),(31,4,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-15 18:30:50','2026-06-15 18:30:50'),(32,7,10,'Completed workout','workout',13,'',NULL,NULL,'2026-06-17 12:23:13','2026-06-17 12:23:13'),(33,7,50,'Earned badge: FIRST_WORKOUT','badge',1,'',NULL,NULL,'2026-06-17 12:23:13','2026-06-17 12:23:13'),(34,7,10,'Completed workout','workout',14,'',NULL,NULL,'2026-06-17 12:23:13','2026-06-17 12:23:13'),(35,7,10,'Completed workout','workout',15,'',NULL,NULL,'2026-06-17 12:23:13','2026-06-17 12:23:13'),(36,7,10,'Completed workout','workout',16,'',NULL,NULL,'2026-06-17 12:23:14','2026-06-17 12:23:14'),(37,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:23','2026-06-17 12:23:23'),(38,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:23','2026-06-17 12:23:23'),(39,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:24','2026-06-17 12:23:24'),(40,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:25','2026-06-17 12:23:25'),(41,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:27','2026-06-17 12:23:27'),(42,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:28','2026-06-17 12:23:28'),(43,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:31','2026-06-17 12:23:31'),(44,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:32','2026-06-17 12:23:32'),(45,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-06-17 12:23:32','2026-06-17 12:23:32'),(46,7,10,'Completed workout','workout',17,'',NULL,NULL,'2026-06-17 13:48:35','2026-06-17 13:48:35'),(47,7,10,'Completed workout','workout',18,'',NULL,NULL,'2026-06-17 13:48:35','2026-06-17 13:48:35'),(48,7,10,'Completed workout','workout',19,'',NULL,NULL,'2026-06-17 13:48:35','2026-06-17 13:48:35'),(49,7,10,'Completed workout','workout',20,'',NULL,NULL,'2026-06-17 13:48:35','2026-06-17 13:48:35'),(50,7,10,'Completed workout','workout',21,'',NULL,NULL,'2026-07-01 17:09:52','2026-07-01 17:09:52'),(51,7,10,'Completed workout','workout',22,'',NULL,NULL,'2026-07-01 17:09:52','2026-07-01 17:09:52'),(52,7,10,'Completed workout','workout',23,'',NULL,NULL,'2026-07-01 17:09:52','2026-07-01 17:09:52'),(53,7,10,'Completed workout','workout',24,'',NULL,NULL,'2026-07-01 17:09:52','2026-07-01 17:09:52'),(54,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-07-01 17:10:03','2026-07-01 17:10:03'),(55,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-07-01 17:10:03','2026-07-01 17:10:03'),(56,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-07-01 17:10:06','2026-07-01 17:10:06'),(57,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-07-01 17:10:07','2026-07-01 17:10:07'),(58,7,5,'Logged wellness data','wellness',NULL,'',NULL,NULL,'2026-07-01 17:10:08','2026-07-01 17:10:08');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reminders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `reminder_type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `scheduled_time` time DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_triggered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_reminders_user` (`user_id`),
  KEY `idx_reminders_active` (`is_active`,`reminder_type`),
  CONSTRAINT `fk_reminders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `roles` VALUES (1,'youth','Default role for youth users','2026-02-16 17:12:21','2026-02-16 17:12:21'),(2,'coach','Fitness coach role','2026-02-16 17:12:21','2026-02-16 17:12:21'),(3,'admin','System administrator role','2026-02-16 17:12:21','2026-02-16 17:12:21'),(4,'parent','Parent role for monitoring youth activities','2026-02-20 17:42:34','2026-02-20 17:42:34');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_badges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `badge_id` bigint(20) unsigned NOT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `source_event_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_badge_once` (`user_id`,`badge_id`),
  KEY `fk_user_badges_badge` (`badge_id`),
  KEY `idx_user_badges_user` (`user_id`,`earned_at`),
  CONSTRAINT `fk_user_badges_badge` FOREIGN KEY (`badge_id`) REFERENCES `badge_definitions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_user_badges_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `user_badges` VALUES (1,4,1,'2026-06-15 18:17:35',NULL),(2,7,1,'2026-06-17 12:23:13',NULL);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_meals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `meal_date` date NOT NULL,
  `meal_type` enum('breakfast','lunch','dinner','snack') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `calories_kcal` int(10) unsigned DEFAULT NULL,
  `protein_g` decimal(6,2) DEFAULT NULL,
  `carbs_g` decimal(6,2) DEFAULT NULL,
  `fat_g` decimal(6,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_meals_unique_per_type` (`user_id`,`meal_date`,`meal_type`),
  KEY `idx_user_meals_user_date` (`user_id`,`meal_date`),
  CONSTRAINT `fk_user_meals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `user_meals` VALUES (1,4,'2026-06-15','snack','guj',77,NULL,NULL,NULL,'2026-06-15 18:16:51','2026-06-15 18:16:51');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_profiles` (
  `user_id` bigint(20) unsigned NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','non_binary','prefer_not_say') DEFAULT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'UTC',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fitness_level` varchar(50) DEFAULT NULL,
  `goal_weight_kg` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `user_profiles` VALUES (1,'Karen','Mumbua','2004-01-01',NULL,NULL,NULL,'UTC','2026-06-15 17:34:01','2026-06-15 17:34:01','Beginner',NULL),(2,'cynthia','muli','2004-01-01',NULL,NULL,NULL,'UTC','2026-06-15 17:40:29','2026-06-15 17:40:29','Beginner',NULL),(3,'Karen','Mumbua','2014-01-01',NULL,NULL,NULL,'UTC','2026-06-15 17:52:01','2026-06-15 17:52:01','Beginner',NULL),(4,'Erick','Muli','1998-01-01',NULL,175.00,51.00,'UTC','2026-06-15 18:05:35','2026-06-15 18:29:48','Intermediate',NULL),(5,'Cynthia','M',NULL,NULL,NULL,NULL,'UTC','2026-06-15 18:57:43','2026-06-15 18:57:43',NULL,NULL),(6,'Josy','P',NULL,NULL,NULL,NULL,'UTC','2026-06-15 18:57:43','2026-06-15 18:57:43',NULL,NULL),(7,'Lucy','Mwongeli','2004-01-01',NULL,160.00,66.00,'UTC','2026-06-17 09:07:31','2026-06-17 12:08:29','Beginner',NULL),(8,'Abel','Moman',NULL,NULL,NULL,NULL,'UTC','2026-06-17 13:06:42','2026-06-17 13:06:42',NULL,NULL);
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `user_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_user_roles_role` (`role_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `user_roles` VALUES (1,1,'2026-06-15 17:34:01'),(2,1,'2026-06-15 17:40:30'),(3,1,'2026-06-15 17:52:01'),(4,1,'2026-06-15 18:05:35'),(5,2,'2026-06-15 18:57:43'),(6,3,'2026-06-15 18:57:43'),(7,1,'2026-06-17 09:07:31'),(8,4,'2026-06-17 13:06:42');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_streaks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `streak_type` enum('wellness','workout') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `length_days` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_streaks_user_type` (`user_id`,`streak_type`,`start_date`),
  KEY `idx_user_streaks_active` (`user_id`,`streak_type`,`end_date`),
  CONSTRAINT `fk_user_streaks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_workout_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `workout_id` bigint(20) unsigned NOT NULL,
  `program_id` bigint(20) unsigned DEFAULT NULL,
  `performed_at` datetime NOT NULL,
  `duration_min` decimal(5,2) DEFAULT NULL,
  `perceived_exertion` tinyint(4) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_user_workout_logs_program` (`program_id`),
  KEY `idx_user_workout_logs_user_time` (`user_id`,`performed_at`),
  KEY `idx_user_workout_logs_workout_time` (`workout_id`,`performed_at`),
  CONSTRAINT `fk_user_workout_logs_program` FOREIGN KEY (`program_id`) REFERENCES `weekly_programs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_user_workout_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_workout_logs_workout` FOREIGN KEY (`workout_id`) REFERENCES `workout_library` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `user_workout_logs` VALUES (1,4,12,NULL,'2026-06-15 21:17:35',10.00,NULL,'Calories burned: 70','2026-06-15 18:17:35'),(2,4,11,NULL,'2026-06-15 21:17:35',10.00,NULL,'Calories burned: 70','2026-06-15 18:17:35'),(3,4,9,NULL,'2026-06-15 21:17:35',10.00,NULL,'Calories burned: 70','2026-06-15 18:17:35'),(4,4,8,NULL,'2026-06-15 21:17:35',10.00,NULL,'Calories burned: 70','2026-06-15 18:17:35'),(5,4,10,NULL,'2026-06-15 21:17:35',10.00,NULL,'Calories burned: 70','2026-06-15 18:17:35'),(6,4,15,NULL,'2026-06-15 21:17:35',10.00,NULL,'Calories burned: 70','2026-06-15 18:17:35'),(7,4,9,NULL,'2026-06-15 21:30:23',10.00,NULL,'Calories burned: 70','2026-06-15 18:30:23'),(8,4,11,NULL,'2026-06-15 21:30:23',10.00,NULL,'Calories burned: 70','2026-06-15 18:30:23'),(9,4,8,NULL,'2026-06-15 21:30:23',10.00,NULL,'Calories burned: 70','2026-06-15 18:30:23'),(10,4,10,NULL,'2026-06-15 21:30:23',10.00,NULL,'Calories burned: 70','2026-06-15 18:30:23'),(11,4,12,NULL,'2026-06-15 21:30:23',10.00,NULL,'Calories burned: 70','2026-06-15 18:30:23'),(12,4,5,NULL,'2026-06-15 21:30:23',10.00,NULL,'Calories burned: 70','2026-06-15 18:30:23'),(13,7,6,NULL,'2026-06-17 15:23:13',10.00,NULL,'Calories burned: 50','2026-06-17 12:23:13'),(14,7,3,NULL,'2026-06-17 15:23:13',10.00,NULL,'Calories burned: 50','2026-06-17 12:23:13'),(15,7,7,NULL,'2026-06-17 15:23:13',10.00,NULL,'Calories burned: 50','2026-06-17 12:23:13'),(16,7,2,NULL,'2026-06-17 15:23:14',10.00,NULL,'Calories burned: 50','2026-06-17 12:23:14'),(17,7,7,NULL,'2026-06-17 16:48:35',10.00,NULL,'Calories burned: 50','2026-06-17 13:48:35'),(18,7,3,NULL,'2026-06-17 16:48:35',10.00,NULL,'Calories burned: 50','2026-06-17 13:48:35'),(19,7,4,NULL,'2026-06-17 16:48:35',10.00,NULL,'Calories burned: 50','2026-06-17 13:48:35'),(20,7,2,NULL,'2026-06-17 16:48:35',10.00,NULL,'Calories burned: 50','2026-06-17 13:48:35'),(21,7,5,NULL,'2026-07-01 20:09:52',10.00,NULL,'Calories burned: 50','2026-07-01 17:09:52'),(22,7,7,NULL,'2026-07-01 20:09:52',10.00,NULL,'Calories burned: 50','2026-07-01 17:09:52'),(23,7,3,NULL,'2026-07-01 20:09:52',10.00,NULL,'Calories burned: 50','2026-07-01 17:09:52'),(24,7,1,NULL,'2026-07-01 20:09:52',10.00,NULL,'Calories burned: 50','2026-07-01 17:09:52');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `phone_verified` tinyint(1) DEFAULT 0,
  `email_verification_code` varchar(6) DEFAULT NULL,
  `phone_verification_code` varchar(6) DEFAULT NULL,
  `verification_code_expires_at` timestamp NULL DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('pending','active','suspended','deleted') NOT NULL DEFAULT 'active',
  `primary_role_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_phone` (`phone_number`),
  KEY `fk_users_primary_role` (`primary_role_id`),
  KEY `idx_users_phone` (`phone_number`),
  CONSTRAINT `fk_users_primary_role` FOREIGN KEY (`primary_role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `users` VALUES (1,'mumbuakaren54@gmail.com','0116143438',0,0,NULL,NULL,NULL,'$2b$10$k.2Usy9XmXR/7uw8Y8ID4OaSrdIi.3K2eKCyTlzs3V9lTDgGtZeUe','',1,'2026-06-15 17:34:01','2026-06-15 17:34:01',NULL),(2,'blessingcynthia296@gmail.com','0769292828',0,0,NULL,NULL,NULL,'$2b$10$n6Nvvz0we7GtLSzo5aLpzONBj1TE9UKp4bSl964WwoamO5UCytxs6','',1,'2026-06-15 17:40:29','2026-06-15 17:40:29',NULL),(3,'katiwasavage@gmail.com','0116143439',0,0,NULL,NULL,NULL,'$2b$10$q7ptnsrVX2X/sfhuSM1I6eJXG.3rhKKn2FLkzyhjm9rS.iSoaArSO','active',1,'2026-06-15 17:52:01','2026-06-15 17:52:26',NULL),(4,'mulicynthia3@gmail.com','0712122927',0,0,NULL,NULL,NULL,'$2b$10$ft1GVOFuMkox70mR.I5VteMWpQ9GbXztiMdyYE5kqK.MFXpBsPYQK','active',1,'2026-06-15 18:05:35','2026-06-15 18:16:19','2026-06-15 18:16:19'),(5,'coach@afyafit.com',NULL,0,0,NULL,NULL,NULL,'$2b$10$J82Zk00.bGVMooosH9Bi1OB4IDwrngW0JkUe4un21L3Bjqd87Abty','active',2,'2026-06-15 18:57:43','2026-06-17 13:04:08','2026-06-17 13:04:08'),(6,'admin@afyafit.com',NULL,0,0,NULL,NULL,NULL,'$2b$10$2AHKdZ62dCaxqJ18dh4u/O4TUBK6T2l5gXHuqvktF7VvFZEICSNkS','active',3,'2026-06-15 18:57:43','2026-06-17 13:23:15','2026-06-17 13:23:15'),(7,'lucymwongeli08@gmail.com','0732838218',0,0,NULL,NULL,NULL,'$2b$10$24H3EDdpW2inu.M4dPJ0SeYS1qtKfscIx.KX.va1Crh7tYTUqPhIi','active',1,'2026-06-17 09:07:31','2026-07-01 17:09:16','2026-07-01 17:09:16'),(8,'kmwendwa763@gmail.com','0753478867',0,0,NULL,NULL,NULL,'$2b$10$C2zfp1uPOyZLU1KZTzMmGeS0XIMjrw/b3saOvig2E7MJZx7U57ney','active',4,'2026-06-17 13:06:42','2026-06-17 13:09:13','2026-06-17 13:09:13');
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workout_library` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'easy',
  `video_url` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_workout_library_name` (`name`),
  KEY `fk_workout_library_creator` (`created_by`),
  CONSTRAINT `fk_workout_library_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
INSERT INTO `workout_library` VALUES (1,'Jumping Jacks','Full body cardio exercise','easy','https://www.youtube.com/watch?v=UpH7rm0cYbM',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(2,'Push-ups','Upper body strength builder','easy','https://www.youtube.com/watch?v=IODxDxX7oi4',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(3,'Squats','Lower body strength exercise','easy','https://www.youtube.com/watch?v=YaXPRqUwItQ',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(4,'Plank','Core strengthening exercise','easy','https://www.youtube.com/watch?v=pSHjTRCQxIw',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(5,'Lunges','Leg and glute workout','easy','https://www.youtube.com/watch?v=QOVaEwmq6Uk',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(6,'Mountain Climbers','Cardio and core exercise','easy','https://www.youtube.com/watch?v=nmwgirgXLYM',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(7,'Burpees','Full body high intensity exercise','easy','https://www.youtube.com/watch?v=auBLPXO8Fww',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(8,'Pull-ups','Advanced upper body exercise','medium','https://www.youtube.com/watch?v=eGo4IYlbE5g',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(9,'Diamond Push-ups','Advanced push-up variation','medium','https://www.youtube.com/watch?v=J0DnG1_S92I',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(10,'Jump Squats','Explosive lower body exercise','medium','https://www.youtube.com/watch?v=CVaEhXetLAM',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(11,'Side Plank','Core and stability exercise','medium','https://www.youtube.com/watch?v=K2VljzCC16g',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(12,'Pike Push-ups','Shoulder strength builder','medium','https://www.youtube.com/watch?v=3UWi44yN-wM',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(13,'Muscle-ups','Advanced calisthenics movement','hard','https://www.youtube.com/watch?v=1fN7Yq-wdCQ',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(14,'Handstand Push-ups','Elite upper body exercise','hard','https://www.youtube.com/watch?v=KjI2Zf9Z2hE',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(15,'Pistol Squats','Single leg advanced squat','hard','https://www.youtube.com/watch?v=YA3TYJ3C20I',NULL,1,'2026-02-16 17:27:37','2026-02-16 17:27:37'),(16,'Wall Push-ups','Chest','','XeN4pEZZJNI',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(17,'Knee Push-ups','Chest','','jWxvty2KROs',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(18,'Arm Circles','Shoulders','','KJWio8yP1ns',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(19,'Tricep Dips (Chair)','Arms','','tKjcgfu44sI',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(20,'Bodyweight Squats','Legs','','aclHkVaku9U',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(21,'Standing Lunges','Legs','','QOVaHwm-Q6U',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(22,'Calf Raises','Legs','','gwLzBJYoWlI',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(23,'Step-ups','Legs','','aajhW7DD1EA',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(24,'Glute Bridges','Legs','','wPM8icPu6H8',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(25,'Basic Plank','Core','','pSHjTRCQxIw',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(26,'Dead Bug','Core','','g_BYB0R-4Ws',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(27,'Bird Dog','Core','','wiFNA3sqjCA',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(28,'Bicycle Crunches','Core','','9FGilxCbdz8',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(29,'Marching in Place','Cardio','','cMYOHojvJCQ',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(30,'Side Steps','Cardio','','vuw_paFqzI0',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(31,'Butt Kicks','Cardio','','R7MRFj_Vhqo',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(32,'High Knees','Cardio','','YA_h8W_SgGQ',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(33,'Standard Push-ups','Chest','','IODxDxX7oi4',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(34,'Wide Push-ups','Chest','','InAmmMa9J8s',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(35,'Decline Push-ups','Chest','','SKPab2YC8BE',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(36,'Bulgarian Split Squats','Legs','','2C-uNgKwPLE',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(37,'Walking Lunges','Legs','','L8fvypPrzzs',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(38,'Single Leg Deadlift','Legs','','vfKwjT5-86k',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(39,'Sumo Squats','Legs','','qJbelx-VHl0',NULL,1,'2026-03-04 10:52:45','2026-03-04 10:52:45'),(40,'Russian Twists','Core','','wkD8rjkodUI',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(41,'Leg Raises','Core','','JB2oyawG9KI',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(42,'Plank to Downward Dog','Core','','kCWYBVIUE7E',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(43,'V-ups','Core','','7UVgs18Y1P4',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(44,'Jumping Lunges','Legs','','Y8Eb5eeXPuQ',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(45,'Skater Hops','Cardio','','qjfz8oCBW8s',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(46,'Plank Jacks','Core','','aZTHYi7eKKI',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(47,'Clapping Push-ups','Chest','','qABfS61JpDs',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(48,'Archer Push-ups','Chest','','y-K5gu_WLH8',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(49,'Pseudo Planche Push-ups','Chest','','od1NMY-Ql3k',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(50,'One-Arm Push-ups','Chest','','Uk2LQ6KPDXQ',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(51,'Jump Lunges','Legs','','Y8Eb5eeXPuQ',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(52,'Shrimp Squats','Legs','','BWf-8Nh_386',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(53,'Box Jumps','Legs','','NBY9-kTuHEk',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(54,'Nordic Curls','Legs','','YQHD8FA0Ih8',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(55,'Dragon Flags','Core','','moyFIvRrS0s',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(56,'L-sit Hold','Core','','IUZJrTBkKBM',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(57,'Hanging Leg Raises','Core','','Pr1ieGZ5atk',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(58,'Ab Wheel Rollouts','Core','','EXm0BYpbTkw',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(59,'Windshield Wipers','Core','','GP1MW3kx6Oo',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(60,'Burpee Box Jumps','Full Body','','K792a0HfBMI',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(61,'Tuck Planche Hold','Core','','VmohR5Pqsqw',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(62,'Explosive Burpees','Full Body','','JZQA08SlJnM',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46'),(63,'Sprawls','Full Body','','K792a0HfBMI',NULL,1,'2026-03-04 10:52:46','2026-03-04 10:52:46');
