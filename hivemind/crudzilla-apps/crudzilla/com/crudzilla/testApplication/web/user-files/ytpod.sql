-- MySQL dump 10.13  Distrib 5.5.32, for debian-linux-gnu (i686)
--
-- Host: localhost    Database: ytpod
-- ------------------------------------------------------
-- Server version	5.5.32-0ubuntu0.12.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clip`
--

DROP TABLE IF EXISTS `clip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clip` (
  `user_id` int(11) NOT NULL,
  `video_id` varchar(64) NOT NULL,
  `id` varchar(64) NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` varchar(256) DEFAULT NULL,
  `start` double DEFAULT '0',
  `end` double DEFAULT '0',
  `color` varchar(16) NOT NULL,
  `userSubmitted` char(8) DEFAULT 'false',
  `submittedByUser` int(11) NOT NULL,
  `approved` char(8) DEFAULT 'false',
  `thumbsup` int(11) DEFAULT '0',
  `thumbsdown` int(11) DEFAULT '0',
  `hiddenId` varchar(128) NOT NULL,
  `start_adjustment` int(11) NOT NULL DEFAULT '0',
  `end_adjustment` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`,`video_id`,`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comment` (
  `user_id` int(11) NOT NULL,
  `video_id` varchar(64) NOT NULL,
  `clip_id` varchar(64) NOT NULL,
  `id` varchar(64) NOT NULL,
  `text` text NOT NULL,
  `posttime` varchar(64) NOT NULL,
  `postedByUser` int(11) NOT NULL,
  `replyTo` varchar(64) DEFAULT '0',
  `approved` char(8) DEFAULT 'false',
  `thumbsup` int(11) DEFAULT '0',
  `thumbsdown` int(11) DEFAULT '0',
  `hiddenId` varchar(128) NOT NULL,
  PRIMARY KEY (`user_id`,`video_id`,`clip_id`,`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int(11) DEFAULT NULL,
  `role` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profile`
--

DROP TABLE IF EXISTS `user_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_profile` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(256) DEFAULT NULL,
  `last_name` varchar(256) DEFAULT NULL,
  `contact_email_address` varchar(256) DEFAULT NULL,
  `area_code` char(3) DEFAULT NULL,
  `exchange_number` char(3) DEFAULT NULL,
  `number` char(4) DEFAULT NULL,
  `extension` char(8) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(64) NOT NULL,
  `pass_word` varchar(64) NOT NULL,
  `create_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `verification`
--

DROP TABLE IF EXISTS `verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `verification` (
  `user_id` int(11) NOT NULL,
  `login_email_verified` char(8) NOT NULL DEFAULT 'No',
  `login_email_verification_code` char(64) NOT NULL DEFAULT 'N/A',
  `cell_phone_verified` char(8) NOT NULL DEFAULT 'No',
  `cell_phone_verification_code` char(64) NOT NULL DEFAULT 'N/A',
  `edu_email_verified` char(8) NOT NULL DEFAULT 'No',
  `edu_email_verification_code` char(64) NOT NULL DEFAULT 'N/A',
  `amazon_verified` char(8) NOT NULL DEFAULT 'No',
  `amazon_verification_code` char(64) NOT NULL DEFAULT 'N/A',
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `video` (
  `user_id` int(11) NOT NULL,
  `id` varchar(64) NOT NULL,
  `url` varchar(256) NOT NULL,
  `name` varchar(64) NOT NULL,
  `embedCode` varchar(128) NOT NULL,
  `enableEmbed` char(8) DEFAULT 'false',
  `duration` double DEFAULT '0',
  `allowUserClippings` char(8) DEFAULT 'false',
  `allowUserComments` char(8) DEFAULT 'false',
  `requireUserModeration` char(8) DEFAULT 'false',
  `hiddenId` varchar(128) DEFAULT '',
  PRIMARY KEY (`user_id`,`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `video_cliping`
--

DROP TABLE IF EXISTS `video_cliping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `video_cliping` (
  `embedcode` varchar(256) NOT NULL,
  `name` varchar(256) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`embedcode`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-09-19 23:16:05
