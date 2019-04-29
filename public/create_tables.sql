CREATE TABLE IF NOT EXISTS `series` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `country` varchar(50) DEFAULT NULL,
  `description` tinytext,
  `rating` enum('1','2','3','4','5') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_SERIES_TITLE` (`title`),
  KEY `IX_SERIES_RATING` (`rating`),
  KEY `IX_SERIES_COUNTRY` (`country`),
  KEY `IX_SERIES_TITLE_COUNTRY` (`title`,`country`),
  KEY `IX_SERIES_COUNTRY_RATING` (`country`,`rating`)
) ENGINE=MyISAM AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `login` varchar(50) NOT NULL,
  `password` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `actors` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `citizenship` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IX_ACTORS_NAME` (`name`),
  KEY `IX_ACTORS_MIDDLE_NAME` (`middle_name`),
  KEY `IX_ACTORS_LAST_NAME` (`last_name`),
  KEY `IX_ACTORS_CITIZENSHIP` (`citizenship`),
  KEY `IX_ACTORS_NAME_LAST_NAME` (`name`,`last_name`),
  KEY `IX_ACTORS_NAME_MIDDLE_NAME` (`name`,`middle_name`),
  KEY `IX_ACTORS_MIDDLE_NAME_LAST_NAME` (`middle_name`,`last_name`),
  KEY `IX_ACTORS_NAME_MIDDLE_NAME_LAST_NAME` (`name`,`middle_name`,`last_name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `actorsinseries` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_series` bigint(20) NOT NULL,
  `id_actors` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UIX_SERIES_ACTORS` (`id_series`,`id_actors`),
  KEY `IXFK_ACTORS_IN_SERIES_SERIES` (`id_series`),
  KEY `IXFK_ACTORS_IN_SERIES_ACTORS` (`id_actors`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

ALTER TABLE `actorsinseries`
 ADD CONSTRAINT `FK_Actors_In_Series_Series`
  FOREIGN KEY (`id_series`) REFERENCES `series` (`id`) ON DELETE Cascade ON UPDATE Cascade
;

ALTER TABLE `actorsinseries`
 ADD CONSTRAINT `FK_Actors_In_Series_Actors`
  FOREIGN KEY (`id_actors`) REFERENCES `actors` (`id`) ON DELETE Cascade ON UPDATE Cascade
;

DROP TRIGGER IF EXISTS `TRG_Users_OnInsert`;

CREATE TRIGGER `TRG_Users_OnInsert` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
  SET NEW.password = md5(NEW.password);
END

DROP TRIGGER IF EXISTS `TRG_Users_OnUpdate`;

CREATE TRIGGER `TRG_Users_OnUpdate` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
  SET NEW.password = md5(NEW.password);
END

COMMIT;
