-- MySQL Script generated by MySQL Workbench
-- Wed Dec 18 10:39:34 2024
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema tektonian
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `tektonian` ;

-- -----------------------------------------------------
-- Schema tektonian
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `tektonian` DEFAULT CHARACTER SET utf8 ;
USE `tektonian` ;

-- -----------------------------------------------------
-- Table `tektonian`.`User`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`User` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`User` (
  `user_id` BINARY(16) NOT NULL DEFAULT (uuid_to_bin(uuid())),
  `username` VARCHAR(64) NULL,
  `email` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image` VARCHAR(255) NULL,
  `nationality` VARCHAR(2) NULL,
  `working_country` VARCHAR(2) NULL,
  `roles` JSON NULL COMMENT 'To implement RBAC based access control, `roles` are needed.\n\nWe can filter unauthorized requests with role entity without querying database.\n\nOnce verification has been occurred user’s roles must be changed!!!!',
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC) VISIBLE);


-- -----------------------------------------------------
-- Table `tektonian`.`Account`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`Account` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`Account` (
  `user_id` BINARY(16) NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `provider` VARCHAR(255) NOT NULL,
  `providerAccountId` VARCHAR(255) NOT NULL,
  `refresh_token` VARCHAR(255) NULL,
  `access_token` VARCHAR(255) NULL,
  `expires_at` INT NULL,
  `token_type` VARCHAR(255) NULL,
  `scope` VARCHAR(255) NULL,
  `id_token` VARCHAR(2048) NULL,
  `session_state` VARCHAR(255) NULL,
  `password` VARCHAR(32) NULL,
  `salt` VARCHAR(7) NULL,
  PRIMARY KEY (`provider`, `providerAccountId`),
  INDEX `user_id_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_account_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `tektonian`.`User` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `tektonian`.`VerificationToken`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`VerificationToken` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`VerificationToken` (
  `identifier` VARCHAR(255) NOT NULL COMMENT 'User’s email address\nDidn’t set to foreign key but it is 1:N relationship.\nDue to users forgetting or failures during the sign-in flow, you might end up with unwanted rows in your database. You might want to periodically clean these up to avoid filling up your database with unnecessary data.',
  `token` VARCHAR(255) NOT NULL,
  `expires` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `token_type` VARCHAR(45) NOT NULL COMMENT 'Verification token can be used for various types of entities\n\nFor example: verification for corporation user, organization user, and student user \n\nSo there could be four types. \nnull: default type when user sign in\nstudent: when user verifies itself is student\norgz: ``\nCorp: ``',
  PRIMARY KEY (`identifier`, `token`));


-- -----------------------------------------------------
-- Table `tektonian`.`Corporation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`Corporation` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`Corporation` (
  `corp_id` INT NOT NULL AUTO_INCREMENT,
  `corp_name` VARCHAR(255) NOT NULL,
  `nationality` VARCHAR(4) NOT NULL,
  `corp_domain` VARCHAR(255) NULL,
  `ceo_name` VARCHAR(255) NULL,
  `corp_address` VARCHAR(255) NULL,
  `phone_number` VARCHAR(255) NULL,
  `corp_num` BIGINT UNSIGNED NOT NULL,
  `biz_num` BIGINT UNSIGNED NULL,
  `biz_started_at` DATE NULL,
  `corp_status` TINYINT NULL,
  `biz_type` VARCHAR(255) NULL,
  `logo_image` VARCHAR(255) NULL,
  `site_url` VARCHAR(255) NULL,
  PRIMARY KEY (`corp_id`));


-- -----------------------------------------------------
-- Table `tektonian`.`Organization`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`Organization` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`Organization` (
  `orgn_id` INT NOT NULL AUTO_INCREMENT,
  `orgn_code` INT UNSIGNED NULL,
  `nationality` VARCHAR(4) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `short_name` VARCHAR(255) NULL,
  `orgn_status` VARCHAR(255) NULL,
  `phone_number` VARCHAR(32) NULL,
  `site_url` VARCHAR(255) NULL,
  `orgn_type` VARCHAR(255) NULL,
  PRIMARY KEY (`orgn_id`));


-- -----------------------------------------------------
-- Table `tektonian`.`Consumer`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`Consumer` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`Consumer` (
  `consumer_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` BINARY(16) NULL,
  `corp_id` INT NULL,
  `orgn_id` INT NULL,
  `consumer_type` VARCHAR(255) NOT NULL,
  `consumer_email` VARCHAR(255) NOT NULL,
  `consumer_verified` TIMESTAMP NULL DEFAULT NULL COMMENT 'Consumer can have three types \n\nnormal: normal user\ncorp: user works at corporation / so corporation entity can have multiple providers\norgn: user works at organization /  ``',
  `phone_number` VARCHAR(32) NOT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`consumer_id`),
  INDEX `user_id_idx` (`user_id` ASC) VISIBLE,
  INDEX `corp_id_idx` (`corp_id` ASC) VISIBLE,
  INDEX `orgn_id_idx` (`orgn_id` ASC) VISIBLE,
  CONSTRAINT `user_id_fk`
    FOREIGN KEY (`user_id`)
    REFERENCES `tektonian`.`User` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  CONSTRAINT `corp_id_fk`
    FOREIGN KEY (`corp_id`)
    REFERENCES `tektonian`.`Corporation` (`corp_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `orgn_id_fk`
    FOREIGN KEY (`orgn_id`)
    REFERENCES `tektonian`.`Organization` (`orgn_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `tektonian`.`Student`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`Student` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`Student` (
  `student_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` BINARY(16) NOT NULL,
  `name_glb` JSON NOT NULL,
  `birth_date` DATE NOT NULL,
  `email_verified` TIMESTAMP NULL DEFAULT NULL COMMENT 'email_verified field could be set if one of the `AcademicHistory` entity of students has been verified',
  `phone_number` VARCHAR(32) NOT NULL,
  `emergency_contact` VARCHAR(32) NOT NULL,
  `gender` TINYINT NOT NULL,
  `image` VARCHAR(255) NOT NULL DEFAULT '',
  `has_car` TINYINT NOT NULL DEFAULT 0,
  `keyword_list` JSON NOT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  INDEX `user_id_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_student_user_id`
    FOREIGN KEY (`user_id`)
    REFERENCES `tektonian`.`User` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `tektonian`.`School`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`School` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`School` (
  `school_id` INT NOT NULL,
  `school_name` VARCHAR(255) NOT NULL,
  `school_name_glb` JSON NOT NULL,
  `country_code` VARCHAR(4) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `coordinate` POINT NOT NULL COMMENT 'School can have multiple campus\n',
  `hompage_url` VARCHAR(255) NULL,
  `email_domain` VARCHAR(45) NULL,
  `phone_number` VARCHAR(45) NULL,
  PRIMARY KEY (`school_id`));


-- -----------------------------------------------------
-- Table `tektonian`.`AcademicHistory`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`AcademicHistory` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`AcademicHistory` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `school_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `degree` VARCHAR(255) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` VARCHAR(255) NOT NULL,
  `faculty` VARCHAR(255) NOT NULL,
  `school_email` VARCHAR(255) NULL,
  `is_attending` TINYINT NULL DEFAULT 0 COMMENT 'Whether a student is attending a school now or not.\n\nIf a Student is connected to multiple AcademicHistory, only one is_attending should be set true.\n\nUser can have multiple AcademicHistory, but s/he must be attending only one school.\n\n',
  PRIMARY KEY (`id`),
  INDEX `school_id_idx` (`school_id` ASC) VISIBLE,
  INDEX `student_id_idx` (`student_id` ASC) VISIBLE,
  CONSTRAINT `fk_aca_school_id`
    FOREIGN KEY (`school_id`)
    REFERENCES `tektonian`.`School` (`school_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_aca_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `tektonian`.`Student` (`student_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `tektonian`.`LanguageExam`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`LanguageExam` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`LanguageExam` (
  `exam_id` INT NOT NULL,
  `exam_name_glb` JSON NOT NULL,
  `exam_results` JSON NOT NULL COMMENT 'If a test is class type then the classes of a result of the test should be listed',
  `lang_country_code` VARCHAR(2) NOT NULL,
  PRIMARY KEY (`exam_id`));


-- -----------------------------------------------------
-- Table `tektonian`.`ExamHistory`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`ExamHistory` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`ExamHistory` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `student_id` INT NOT NULL,
  `exam_id` INT NOT NULL,
  `exam_result` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `student_id_idx` (`student_id` ASC) VISIBLE,
  INDEX `exam_id_idx` (`exam_id` ASC) VISIBLE,
  CONSTRAINT `fk_his_student_id`
    FOREIGN KEY (`student_id`)
    REFERENCES `tektonian`.`Student` (`student_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_his_exam_id`
    FOREIGN KEY (`exam_id`)
    REFERENCES `tektonian`.`LanguageExam` (`exam_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `tektonian`.`Request`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`Request` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`Request` (
  `request_id` INT NOT NULL AUTO_INCREMENT,
  `consumer_id` INT NOT NULL,
  `provider_ids` JSON NULL COMMENT 'Provider ids of students',
  `title` VARCHAR(255) NOT NULL,
  `head_count` TINYINT UNSIGNED NOT NULL,
  `reward_price` INT NOT NULL,
  `currency` VARCHAR(2) NOT NULL,
  `content` TEXT NOT NULL,
  `are_needed` JSON NULL,
  `are_required` JSON NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `address` VARCHAR(255) NULL,
  `address_coordinate` POINT NULL,
  `provide_food` BINARY NOT NULL DEFAULT 0,
  `provide_trans_exp` BINARY NOT NULL DEFAULT 0,
  `prep_material` JSON NULL,
  `request_status` TINYINT NULL COMMENT 'There could be various statuses of a request.\n\nFor example\n\nPosted: consumer wrote a request but not paid\nPaid: consumer paid for a request\nOutdated: No provider(s) contracted with a consumer\nContracted: provider(s) contracted with a consumer\nFinished: work has been done!\nFailed: Contraction didn’t work properly\n',
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `corp_id` INT NULL COMMENT 'Have no idea that this field could be utilized late;;',
  `orgn_id` INT NULL COMMENT 'Have no idea that this field could be utilized late;;',
  PRIMARY KEY (`request_id`),
  INDEX `consumer_id_idx` (`consumer_id` ASC) VISIBLE,
  CONSTRAINT `consumer_id_fk`
    FOREIGN KEY (`consumer_id`)
    REFERENCES `tektonian`.`Consumer` (`consumer_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `tektonian`.`CorporationReview`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`CorporationReview` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`CorporationReview` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `consumer_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `corp_id` INT NOT NULL,
  `request_id` INT NOT NULL,
  `request_url` VARCHAR(255) NOT NULL,
  `review_text` TEXT NOT NULL,
  `prep_requirement` VARCHAR(255) NOT NULL,
  `sense_of_achive` TINYINT NOT NULL,
  `work_atmosphere` TINYINT NOT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `tektonian`.`StudentReview`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`StudentReview` ;

CREATE TABLE IF NOT EXISTS `tektonian`.`StudentReview` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `corp_id` INT NULL COMMENT 'Have no idea that this field could be utilized late;;',
  `orgn_id` INT NULL COMMENT 'Have no idea that this field could be utilized late;;',
  `consumer_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `request_id` INT NOT NULL,
  `request_url` VARCHAR(255) NOT NULL,
  `was_late` TINYINT NOT NULL,
  `was_proactive` TINYINT NOT NULL,
  `was_diligent` TINYINT NOT NULL,
  `commu_ability` TINYINT NOT NULL,
  `lang_fluent` TINYINT NOT NULL,
  `goal_fulfillment` TINYINT NOT NULL,
  `want_cowork` TINYINT NOT NULL,
  `praise` TEXT NOT NULL,
  `need_improve` TEXT NOT NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`));

USE `tektonian` ;

-- -----------------------------------------------------
-- Placeholder table for view `tektonian`.`RequestOfUser`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tektonian`.`RequestOfUser` (`user_id` INT, `username` INT, `image` INT, `nationality` INT, `working_country` INT, `consumer_type` INT, `consumer_email` INT, `phone_number` INT, `request_id` INT, `consumer_id` INT, `title` INT, `head_count` INT, `reward_price` INT, `currency` INT, `content` INT, `are_needed` INT, `are_required` INT, `start_date` INT, `end_date` INT, `address` INT, `address_coordinate` INT, `provide_food` INT, `provide_trans_exp` INT, `prep_material` INT, `created_at` INT, `status` INT, `start_time` INT, `end_time` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tektonian`.`UserOfCorporation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tektonian`.`UserOfCorporation` (`user_id` INT, `username` INT, `email` INT, `image` INT, `user_nationality` INT, `user_working_country` INT, `roles` INT, `corp_id` INT, `corp_name` INT, `corp_nationality` INT, `corp_domain` INT, `ceo_name` INT, `corp_address` INT, `phone_number` INT, `corp_num` INT, `biz_num` INT, `biz_started_at` INT, `corp_status` INT, `biz_type` INT, `logo_image` INT, `site_url` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tektonian`.`AcademicHistoryWithSchool`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tektonian`.`AcademicHistoryWithSchool` (`id` INT, `student_id` INT, `degree` INT, `start_date` INT, `end_date` INT, `status` INT, `faculty` INT, `school_email` INT, `is_attending` INT, `school_id` INT, `school_name` INT, `school_name_glb` INT, `country_code` INT, `address` INT, `coordinate` INT, `hompage_url` INT, `email_domain` INT, `phone_number` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tektonian`.`RequestOfCorporation`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tektonian`.`RequestOfCorporation` (`request_id` INT, `consumer_id` INT, `title` INT, `head_count` INT, `reward_price` INT, `currency` INT, `content` INT, `are_needed` INT, `are_required` INT, `start_date` INT, `end_date` INT, `address` INT, `address_coordinate` INT, `provide_food` INT, `provide_trans_exp` INT, `prep_material` INT, `created_at` INT, `request_status` INT, `start_time` INT, `end_time` INT, `corp_id` INT, `corp_name` INT, `corp_domain` INT, `nationality` INT, `corp_address` INT, `phone_number` INT, `logo_image` INT, `site_url` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tektonian`.`ExamHistoryWithLanguageExam`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tektonian`.`ExamHistoryWithLanguageExam` (`student_id` INT, `exam_result` INT, `exam_id` INT, `exam_name_glb` INT, `exam_results` INT, `lang_country_code` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tektonian`.`FullStudentProfile`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tektonian`.`FullStudentProfile` (`student_id` INT, `user_id` INT, `name_glb` INT, `birth_date` INT, `created_at` INT, `email_verified` INT, `phone_number` INT, `emergency_contact` INT, `gender` INT, `image` INT, `has_car` INT, `keyword_list` INT, `academic` INT, `language` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tektonian`.`StudentWithCurrentSchool`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tektonian`.`StudentWithCurrentSchool` (`user_id` INT, `name_glb` INT, `birth_date` INT, `student_phone_number` INT, `emergency_contact` INT, `gender` INT, `image` INT, `has_car` INT, `keyword_list` INT);

-- -----------------------------------------------------
-- Placeholder table for view `tektonian`.`FullReviewInfoOfCorp`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tektonian`.`FullReviewInfoOfCorp` (`corp_id` INT, `corp_name` INT, `nationality` INT, `corp_domain` INT, `ceo_name` INT, `corp_address` INT, `phone_number` INT, `corp_num` INT, `biz_num` INT, `biz_started_at` INT, `corp_status` INT, `biz_type` INT, `logo_image` INT, `site_url` INT, `reviews` INT, `requests` INT);

-- -----------------------------------------------------
-- View `tektonian`.`RequestOfUser`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`RequestOfUser`;
DROP VIEW IF EXISTS `tektonian`.`RequestOfUser` ;
USE `tektonian`;
CREATE  OR REPLACE VIEW `RequestOfUser` AS
    SELECT 
        `u`.`user_id` AS `user_id`,
        `u`.`username` AS `username`,
        `u`.`image` AS `image`,
        `u`.`nationality` as `nationality`,
        `u`.`working_country` as `working_country`,
        `c`.`consumer_type` AS `consumer_type`,
        `c`.`consumer_email` AS `consumer_email`,
        `c`.`phone_number` AS `phone_number`,
        `r`.`request_id` AS `request_id`,
        `r`.`consumer_id` AS `consumer_id`,
        `r`.`title` AS `title`,
        `r`.`head_count` AS `head_count`,
        `r`.`reward_price` AS `reward_price`,
        `r`.`currency` AS `currency`,
        `r`.`content` AS `content`,
        `r`.`are_needed` AS `are_needed`,
        `r`.`are_required` AS `are_required`,
        `r`.`start_date` AS `start_date`,
        `r`.`end_date` AS `end_date`,
        `r`.`address` AS `address`,
        `r`.`address_coordinate` AS `address_coordinate`,
        `r`.`provide_food` AS `provide_food`,
        `r`.`provide_trans_exp` AS `provide_trans_exp`,
        `r`.`prep_material` AS `prep_material`,
        `r`.`created_at` AS `created_at`,
        `r`.`request_status` AS `status`,
        `r`.`start_time` AS `start_time`,
        `r`.`end_time` AS `end_time`
    FROM
        ((`user` `u`
        JOIN `consumer` `c` ON ((`u`.`user_id` = `c`.`user_id`)))
        JOIN `request` `r` ON ((`c`.`consumer_id` = `r`.`consumer_id`)));

-- -----------------------------------------------------
-- View `tektonian`.`UserOfCorporation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`UserOfCorporation`;
DROP VIEW IF EXISTS `tektonian`.`UserOfCorporation` ;
USE `tektonian`;
CREATE  OR REPLACE VIEW `UserOfCorporation` AS
    SELECT 
        `u`.`user_id` AS `user_id`,
        `u`.`username` AS `username`,
        `u`.`email` AS `email`,
        `u`.`image` AS `image`,
        `u`.`nationality` AS `user_nationality`,
        `u`.`working_country` AS `user_working_country`,
        `u`.`roles` AS `roles`,
        `corp`.`corp_id` AS `corp_id`,
        `corp`.`corp_name` AS `corp_name`,
        `corp`.`nationality` AS `corp_nationality`,
        `corp`.`corp_domain` AS `corp_domain`,
        `corp`.`ceo_name` AS `ceo_name`,
        `corp`.`corp_address` AS `corp_address`,
        `corp`.`phone_number` AS `phone_number`,
        `corp`.`corp_num` AS `corp_num`,
        `corp`.`biz_num` AS `biz_num`,
        `corp`.`biz_started_at` AS `biz_started_at`,
        `corp`.`corp_status` AS `corp_status`,
        `corp`.`biz_type` AS `biz_type`,
        `corp`.`logo_image` AS `logo_image`,
        `corp`.`site_url` AS `site_url`
    FROM
        ((`user` `u`
        JOIN `consumer` `c` ON ((`u`.`user_id` = `c`.`user_id`)))
        JOIN `corporation` `corp` ON ((`c`.`corp_id` = `corp`.`corp_id`)));

-- -----------------------------------------------------
-- View `tektonian`.`AcademicHistoryWithSchool`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`AcademicHistoryWithSchool`;
DROP VIEW IF EXISTS `tektonian`.`AcademicHistoryWithSchool` ;
USE `tektonian`;
CREATE  OR REPLACE VIEW `AcademicHistoryWithSchool` AS
    SELECT 
        `a`.`id` AS `id`,
        `a`.`student_id` AS `student_id`,
        `a`.`degree` AS `degree`,
        `a`.`start_date` AS `start_date`,
        `a`.`end_date` AS `end_date`,
        `a`.`status` AS `status`,
        `a`.`faculty` AS `faculty`,
        `a`.`school_email` AS `school_email`,
        `a`.`is_attending` as `is_attending`,
        `s`.`school_id` AS `school_id`,
        `s`.`school_name` AS `school_name`,
        `s`.`school_name_glb` AS `school_name_glb`,
        `s`.`country_code` AS `country_code`,
        `s`.`address` AS `address`,
        `s`.`coordinate` AS `coordinate`,
        `s`.`hompage_url` AS `hompage_url`,
        `s`.`email_domain` AS `email_domain`,
        `s`.`phone_number` AS `phone_number`
    FROM
        (`academichistory` `a`
        JOIN `school` `s` ON ((`a`.`school_id` = `s`.`school_id`)));

-- -----------------------------------------------------
-- View `tektonian`.`RequestOfCorporation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`RequestOfCorporation`;
DROP VIEW IF EXISTS `tektonian`.`RequestOfCorporation` ;
USE `tektonian`;
CREATE  OR REPLACE VIEW `RequestOfCorporation` AS
    SELECT 
        `r`.`request_id` AS `request_id`,
        `r`.`consumer_id` AS `consumer_id`,
        `r`.`title` AS `title`,
        `r`.`head_count` AS `head_count`,
        `r`.`reward_price` AS `reward_price`,
        `r`.`currency` AS `currency`,
        `r`.`content` AS `content`,
        `r`.`are_needed` AS `are_needed`,
        `r`.`are_required` AS `are_required`,
        `r`.`start_date` AS `start_date`,
        `r`.`end_date` AS `end_date`,
        `r`.`address` AS `address`,
        `r`.`address_coordinate` AS `address_coordinate`,
        `r`.`provide_food` AS `provide_food`,
        `r`.`provide_trans_exp` AS `provide_trans_exp`,
        `r`.`prep_material` AS `prep_material`,
        `r`.`created_at` AS `created_at`,
        `r`.`request_status` AS `request_status`,
        `r`.`start_time` AS `start_time`,
        `r`.`end_time` AS `end_time`,
        `corp`.`corp_id` AS `corp_id`,
        `corp`.`corp_name` AS `corp_name`,
        `corp`.`corp_domain` AS `corp_domain`,
        `corp`.`nationality` AS `nationality`,
        `corp`.`corp_address` AS `corp_address`,
        `corp`.`phone_number` AS `phone_number`,
        `corp`.`logo_image` AS `logo_image`,
        `corp`.`site_url` AS `site_url`
    FROM
        ((`request` `r`
        JOIN `consumer` `c` ON ((`c`.`consumer_id` = `r`.`consumer_id`)))
        JOIN `corporation` `corp` ON ((`corp`.`corp_id` = `c`.`corp_id`)));

-- -----------------------------------------------------
-- View `tektonian`.`ExamHistoryWithLanguageExam`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`ExamHistoryWithLanguageExam`;
DROP VIEW IF EXISTS `tektonian`.`ExamHistoryWithLanguageExam` ;
USE `tektonian`;
CREATE  OR REPLACE VIEW `ExamHistoryWithLanguageExam` AS
    SELECT 
        `e`.`student_id` AS `student_id`,
        `e`.`exam_result` AS `exam_result`,
        `l`.`exam_id` AS `exam_id`,
        `l`.`exam_name_glb` AS `exam_name_glb`,
        `l`.`exam_results` AS `exam_results`,
        `l`.`lang_country_code` AS `lang_country_code`
    FROM
        (`examhistory` `e`
        JOIN `languageexam` `l` ON ((`e`.`exam_id` = `l`.`exam_id`)));

-- -----------------------------------------------------
-- View `tektonian`.`FullStudentProfile`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`FullStudentProfile`;
DROP VIEW IF EXISTS `tektonian`.`FullStudentProfile` ;
USE `tektonian`;
CREATE  OR REPLACE VIEW `FullStudentProfile` AS
    SELECT 
        `s`.`student_id` AS `student_id`,
        `s`.`user_id` AS `user_id`,
        `s`.`name_glb` AS `name_glb`,
        `s`.`birth_date` AS `birth_date`,
        `s`.`created_at` AS `created_at`,
        `s`.`email_verified` AS `email_verified`,
        `s`.`phone_number` AS `phone_number`,
        `s`.`emergency_contact` AS `emergency_contact`,
        `s`.`gender` AS `gender`,
        `s`.`image` AS `image`,
        `s`.`has_car` AS `has_car`,
        `s`.`keyword_list` AS `keyword_list`,
        `academicjson`.`academic` AS `academic`,
        `langjson`.`language` AS `language`
    FROM
        ((`student` `s`
        LEFT JOIN (SELECT 
            JSON_ARRAYAGG(JSON_OBJECT('school_id', `academichistorywithschool`.`id`, 'degree', `academichistorywithschool`.`degree`, 'start_date', `academichistorywithschool`.`start_date`, 'end_date', `academichistorywithschool`.`end_date`, 'status', `academichistorywithschool`.`status`, 'faculty', `academichistorywithschool`.`faculty`, 'school_name', `academichistorywithschool`.`school_name`, 'school_name_glb', `academichistorywithschool`.`school_name_glb`, 'country_code', `academichistorywithschool`.`country_code`, 'address', `academichistorywithschool`.`address`, 'coordinate', `academichistorywithschool`.`coordinate`, 'hompage_url', `academichistorywithschool`.`hompage_url`, 'phone_number', `academichistorywithschool`.`phone_number`)) AS `academic`,
                `academichistorywithschool`.`student_id` AS `student_id`
        FROM
            `academichistorywithschool`
        GROUP BY `academichistorywithschool`.`student_id`) `academicjson` ON ((`s`.`student_id` = `academicjson`.`student_id`)))
        LEFT JOIN (SELECT 
            JSON_ARRAYAGG(JSON_OBJECT('exam_result', `examhistorywithlanguageexam`.`exam_result`, 'exam_name_glb', `examhistorywithlanguageexam`.`exam_name_glb`,'exam_results', `examhistorywithlanguageexam`.`exam_results`, 'lang_country_code', `examhistorywithlanguageexam`.`lang_country_code`, 'exam_id', `examhistorywithlanguageexam`.`exam_id`)) AS `language`,
                `examhistorywithlanguageexam`.`student_id` AS `student_id`
        FROM
            `examhistorywithlanguageexam`
        GROUP BY `examhistorywithlanguageexam`.`student_id`) `langjson` ON ((`s`.`student_id` = `langjson`.`student_id`)));

-- -----------------------------------------------------
-- View `tektonian`.`StudentWithCurrentSchool`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`StudentWithCurrentSchool`;
DROP VIEW IF EXISTS `tektonian`.`StudentWithCurrentSchool` ;
USE `tektonian`;
CREATE  OR REPLACE VIEW `StudentWithCurrentSchool` AS
select distinct
	s.user_id as user_id,
    s.name_glb as name_glb,
    s.birth_date as birth_date,
    s.phone_number as student_phone_number,
    s.emergency_contact as emergency_contact,
    s.gender as gender,
    s.image as image,
    s.has_car as has_car,
    s.keyword_list as keyword_list,
    a.*
from Student s

join academichistorywithschool a on a.student_id = s.student_id

where a.is_attending = 1;

-- -----------------------------------------------------
-- View `tektonian`.`FullReviewInfoOfCorp`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `tektonian`.`FullReviewInfoOfCorp`;
DROP VIEW IF EXISTS `tektonian`.`FullReviewInfoOfCorp` ;
USE `tektonian`;
CREATE OR REPLACE VIEW FullReviewInfoOfCorp AS
SELECT 
    c.corp_id,
    c.corp_name,
    c.nationality,
    c.corp_domain,
    c.ceo_name,
    c.corp_address,
    c.phone_number,
    c.corp_num,
    c.biz_num,
    c.biz_started_at,
    c.corp_status,
    c.biz_type,
    c.logo_image,
    c.site_url,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', cr.id,
            'consumer_id', cr.consumer_id,
            'student_id', cr.student_id,
            'request_id', cr.request_id,
            'request_url', cr.request_url,
            'review_text', cr.review_text,
            'prep_requirement', cr.prep_requirement,
            'work_atmosphere', cr.work_atmosphere,
            'sense_of_achive', cr.sense_of_achive,
            'created_at', cr.created_at,
            'updated_at', cr.updated_at
        )
    ) AS reviews,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'request_id', r.request_id,
            'consumer_id', r.consumer_id,
            'title', r.title,
            'head_count', r.head_count,
            'reward_price', r.reward_price,
            'currency', r.currency,
            'content', r.content,
            'are_needed', r.are_needed,
            'are_required', r.are_required,
            'start_date', r.start_date,
            'end_date', r.end_date,
            'address', r.address,
            'address_coordinate', r.address_coordinate,
            'provide_food', r.provide_food,
            'provide_trans_exp', r.provide_trans_exp,
            'prep_material', r.prep_material,
            'request_status', r.request_status,
            'start_time', r.start_time,
            'end_time', r.end_time,
            'created_at', r.created_at,
            'updated_at', r.updated_at
        )
    ) AS requests

FROM 
    Corporation c
LEFT JOIN 
    CorporationReview cr ON c.corp_id = cr.corp_id
LEFT JOIN 
    Request r ON cr.request_id = r.request_id -- CorporationReview와 Request를 request_id로 연결
GROUP BY 
    c.corp_id;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
