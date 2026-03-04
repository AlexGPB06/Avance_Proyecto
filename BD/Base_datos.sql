CREATE DATABASE  IF NOT EXISTS `avance_proyecto` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `avance_proyecto`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: avance_proyecto
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `avisos_globales`
--

DROP TABLE IF EXISTS `avisos_globales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avisos_globales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mensaje` text NOT NULL,
  `autor` varchar(100) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avisos_globales`
--

LOCK TABLES `avisos_globales` WRITE;
/*!40000 ALTER TABLE `avisos_globales` DISABLE KEYS */;
INSERT INTO `avisos_globales` VALUES (1,'Holaa','aLEJANDRO garcia','2026-03-04 16:54:01');
/*!40000 ALTER TABLE `avisos_globales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `posicion` varchar(10) NOT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`posicion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES ('bottom','https://m.media-amazon.com/images/I/71SSmIaXN-L.jpg'),('top','https://m.media-amazon.com/images/I/71SSmIaXN-L.jpg');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calificaciones`
--

DROP TABLE IF EXISTS `calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `entidad_id` int NOT NULL,
  `tipo_entidad` enum('cancion','tarea') NOT NULL,
  `puntuacion` decimal(3,1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`entidad_id`,`tipo_entidad`),
  CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `calificaciones_chk_1` CHECK (((`puntuacion` >= 1) and (`puntuacion` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calificaciones`
--

LOCK TABLES `calificaciones` WRITE;
/*!40000 ALTER TABLE `calificaciones` DISABLE KEYS */;
INSERT INTO `calificaciones` VALUES (1,1,8,'cancion',5.0),(5,4,8,'cancion',4.5);
/*!40000 ALTER TABLE `calificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `canciones`
--

DROP TABLE IF EXISTS `canciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `canciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `artista` varchar(100) NOT NULL,
  `genero` varchar(50) DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `fecha_agregada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `canciones`
--

LOCK TABLES `canciones` WRITE;
/*!40000 ALTER TABLE `canciones` DISABLE KEYS */;
INSERT INTO `canciones` VALUES (1,'Estado ','Palomas del gobierno','punk','2026-02-09 17:27:48'),(2,'Todo','Palomas del gobierno','Punk','2026-02-09 17:57:11'),(3,'Gimme Tha Power','Molotov','Rock Mexicano','2026-03-04 03:49:24'),(4,'Afuera','Caifanes','Rock Clásico','2026-03-04 03:49:24'),(5,'Kumbala','Maldita Vecindad','Ska/Rock','2026-03-04 03:49:24'),(6,'Triste Canción','El Tri','Rock Clásico','2026-03-04 03:49:24'),(7,'Eres','Café Tacvba','Rock Alternativo','2026-03-04 03:49:24'),(8,'Viento','Caifanes','Rock Mexicano','2026-03-04 03:49:24');
/*!40000 ALTER TABLE `canciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `entidad_id` int NOT NULL,
  `tipo_entidad` enum('cancion','tarea','foro') NOT NULL,
  `comentario` text NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
INSERT INTO `comentarios` VALUES (1,1,8,'cancion','Esta meh','2026-03-04 14:21:49'),(2,4,8,'cancion','Que dices es mid','2026-03-04 14:22:23'),(3,1,2,'foro','OLA','2026-03-04 15:10:11');
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destacados_home`
--

DROP TABLE IF EXISTS `destacados_home`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destacados_home` (
  `slot` varchar(20) NOT NULL,
  `item_id` int DEFAULT NULL,
  PRIMARY KEY (`slot`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destacados_home`
--

LOCK TABLES `destacados_home` WRITE;
/*!40000 ALTER TABLE `destacados_home` DISABLE KEYS */;
INSERT INTO `destacados_home` VALUES ('album1',2),('album2',1),('cancion1',7),('cancion2',8),('cancion3',2);
/*!40000 ALTER TABLE `destacados_home` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encuesta_votos`
--

DROP TABLE IF EXISTS `encuesta_votos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encuesta_votos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `encuesta_id` int NOT NULL,
  `user_id` int NOT NULL,
  `opcion_seleccionada` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `encuesta_id` (`encuesta_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `encuesta_votos_ibfk_1` FOREIGN KEY (`encuesta_id`) REFERENCES `encuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `encuesta_votos_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encuesta_votos`
--

LOCK TABLES `encuesta_votos` WRITE;
/*!40000 ALTER TABLE `encuesta_votos` DISABLE KEYS */;
INSERT INTO `encuesta_votos` VALUES (3,3,1,1),(5,3,4,2),(6,3,3,2);
/*!40000 ALTER TABLE `encuesta_votos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `encuestas`
--

DROP TABLE IF EXISTS `encuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `encuestas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pregunta` varchar(255) NOT NULL,
  `opcion1` varchar(100) NOT NULL,
  `opcion2` varchar(100) NOT NULL,
  `opcion3` varchar(100) DEFAULT NULL,
  `opcion4` varchar(100) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `encuestas`
--

LOCK TABLES `encuestas` WRITE;
/*!40000 ALTER TABLE `encuestas` DISABLE KEYS */;
INSERT INTO `encuestas` VALUES (3,'Caleb esta guapo?','SI PAPI','NO PAPU',NULL,NULL,1,'2026-03-04 16:35:12');
/*!40000 ALTER TABLE `encuestas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `lugar` varchar(100) DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES (1,'cafe iguana','2026-02-05','monterrey','2026-02-09 17:28:38'),(2,'la tumba','2026-02-05','Barrio antiguo','2026-02-09 17:58:53');
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `foros`
--

DROP TABLE IF EXISTS `foros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `foros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `user_id` int NOT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `foros_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `foros`
--

LOCK TABLES `foros` WRITE;
/*!40000 ALTER TABLE `foros` DISABLE KEYS */;
INSERT INTO `foros` VALUES (1,'Caleb ;p',NULL,1,'aprobado','2026-03-04 04:15:15'),(2,'Caleb esta guapo? ',NULL,4,'aprobado','2026-03-04 04:37:03');
/*!40000 ALTER TABLE `foros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_chat`
--

DROP TABLE IF EXISTS `mensajes_chat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_chat` (
  `id` int NOT NULL AUTO_INCREMENT,
  `emisor_id` int NOT NULL,
  `receptor_id` int NOT NULL,
  `mensaje` text NOT NULL,
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `emisor_id` (`emisor_id`),
  KEY `receptor_id` (`receptor_id`),
  CONSTRAINT `mensajes_chat_ibfk_1` FOREIGN KEY (`emisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_chat_ibfk_2` FOREIGN KEY (`receptor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_chat`
--

LOCK TABLES `mensajes_chat` WRITE;
/*!40000 ALTER TABLE `mensajes_chat` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes_chat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_directos`
--

DROP TABLE IF EXISTS `mensajes_directos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_directos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `emisor_id` int NOT NULL,
  `receptor_id` int NOT NULL,
  `mensaje` text NOT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `emisor_id` (`emisor_id`),
  KEY `receptor_id` (`receptor_id`),
  CONSTRAINT `mensajes_directos_ibfk_1` FOREIGN KEY (`emisor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_directos_ibfk_2` FOREIGN KEY (`receptor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_directos`
--

LOCK TABLES `mensajes_directos` WRITE;
/*!40000 ALTER TABLE `mensajes_directos` DISABLE KEYS */;
INSERT INTO `mensajes_directos` VALUES (1,4,3,'Que onda Akex',1,'2026-03-04 15:07:38'),(2,1,4,'he?',1,'2026-03-04 15:08:35'),(3,4,1,'ola',1,'2026-03-04 15:09:02'),(4,1,4,'Q PD',1,'2026-03-04 15:09:29'),(5,4,1,'a',1,'2026-03-04 15:40:12'),(6,4,1,'que quieres',1,'2026-03-04 15:57:15'),(7,3,4,'deja de estar jodiendo we',1,'2026-03-04 16:09:34');
/*!40000 ALTER TABLE `mensajes_directos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `mensaje` text NOT NULL,
  `remitente_username` varchar(100) DEFAULT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
INSERT INTO `notificaciones` VALUES (1,2,'seguidor','@Caleb te ha agregado como amigo.','Caleb',0,'2026-03-04 15:40:16'),(2,1,'aviso','Caleb no se sabe las rolas','aLEJANDRO garcia',1,'2026-03-04 16:35:55'),(3,2,'aviso','Caleb no se sabe las rolas','aLEJANDRO garcia',0,'2026-03-04 16:35:55'),(4,4,'aviso','Caleb no se sabe las rolas','aLEJANDRO garcia',1,'2026-03-04 16:35:55'),(5,1,'aviso','Holaa','aLEJANDRO garcia',0,'2026-03-04 16:54:01'),(6,2,'aviso','Holaa','aLEJANDRO garcia',0,'2026-03-04 16:54:01'),(7,4,'aviso','Holaa','aLEJANDRO garcia',1,'2026-03-04 16:54:01');
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poll_votos`
--

DROP TABLE IF EXISTS `poll_votos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poll_votos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `poll_id` int NOT NULL,
  `user_id` int NOT NULL,
  `opcion_index` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `poll_id` (`poll_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `poll_votos_ibfk_1` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE,
  CONSTRAINT `poll_votos_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poll_votos`
--

LOCK TABLES `poll_votos` WRITE;
/*!40000 ALTER TABLE `poll_votos` DISABLE KEYS */;
/*!40000 ALTER TABLE `poll_votos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `polls`
--

DROP TABLE IF EXISTS `polls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `polls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pregunta` varchar(255) NOT NULL,
  `opciones` json NOT NULL,
  `admin_id` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `polls_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `polls`
--

LOCK TABLES `polls` WRITE;
/*!40000 ALTER TABLE `polls` DISABLE KEYS */;
/*!40000 ALTER TABLE `polls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguidores`
--

DROP TABLE IF EXISTS `seguidores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguidores` (
  `seguidor_id` int NOT NULL,
  `seguido_id` int NOT NULL,
  `fecha_seguimiento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`seguidor_id`,`seguido_id`),
  KEY `seguido_id` (`seguido_id`),
  CONSTRAINT `seguidores_ibfk_1` FOREIGN KEY (`seguidor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seguidores_ibfk_2` FOREIGN KEY (`seguido_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguidores`
--

LOCK TABLES `seguidores` WRITE;
/*!40000 ALTER TABLE `seguidores` DISABLE KEYS */;
INSERT INTO `seguidores` VALUES (1,4,'2026-03-04 15:31:07'),(4,1,'2026-03-04 15:28:00');
/*!40000 ALTER TABLE `seguidores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sugerencias`
--

DROP TABLE IF EXISTS `sugerencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sugerencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `imagen_url` varchar(500) DEFAULT 'https://via.placeholder.com/300x200/111111/ff0000?text=IDEA+MUSICAL',
  `user_id` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `sugerencias_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sugerencias`
--

LOCK TABLES `sugerencias` WRITE;
/*!40000 ALTER TABLE `sugerencias` DISABLE KEYS */;
INSERT INTO `sugerencias` VALUES (2,'a','a','https://via.placeholder.com/300x200/111111/ff0000?text=IDEA+MUSICAL',4,'2026-03-04 15:30:34');
/*!40000 ALTER TABLE `sugerencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareas`
--

DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tareas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text,
  `prioridad` enum('baja','media','alta') DEFAULT 'baja',
  `imagen_url` varchar(500) DEFAULT NULL,
  `completada` tinyint(1) DEFAULT '0',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareas`
--

LOCK TABLES `tareas` WRITE;
/*!40000 ALTER TABLE `tareas` DISABLE KEYS */;
INSERT INTO `tareas` VALUES (1,'ERROR HUMANO','LOS ERRROES DE LOS HUMANOS','media',0,'2026-02-09 17:51:27'),(2,'Lo que fue','Lo que fue y lo que sera','media',0,'2026-02-09 17:58:22');
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `rol` enum('admin','fan') DEFAULT 'fan',
  `descripcion` text,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` enum('Masculino','Femenino') DEFAULT NULL,
  `privacidad` enum('publico','privado') DEFAULT 'publico',
  `foto_perfil` varchar(500) DEFAULT 'https://i.imgur.com/3p3E53e.png',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `username_2` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'AlexGPB06','$2b$10$PDv/mG2uzsNeF01lTu1e.O5UmJq9YkobuZF3KwSvqCSBubBJ0uLmW','alejandrogarciapelayo@gmail.com','2026-02-09 17:23:47','fan','¡Hola! Soy un nuevo miembro de la comunidad Palomas del Gobierno.','2026-03-04 05:34:30',NULL,NULL,'publico','https://i.pinimg.com/564x/a3/be/71/a3be715f8f9330b6b5c3aee8e1ffbde4.jpg'),(2,'Alex','$2b$10$L82kUyqrpgnop.NOTKSAHO5jXOex4nCc9oHcNse9euWSeB2b0XPje','Al07011020@tecmilenio.mx','2026-02-09 17:56:22','fan','¡Hola! Soy un nuevo miembro de la comunidad Palomas del Gobierno.','2026-03-04 05:34:30',NULL,NULL,'publico','https://i.imgur.com/3p3E53e.png'),(3,'aLEJANDRO garcia','$2b$10$rY0IyznEiU467OK75XP5Q.PJ1uOALaIQKVR.oOoy8QSMjlFyemt7G','parodyentretaimentn@gmail.com','2026-03-04 03:50:47','admin','¡Hola! Soy un nuevo miembro de la comunidad Palomas del Gobierno.','2026-03-04 05:34:30',NULL,NULL,'publico','https://preview.redd.it/squidward-on-a-chair-the-orgin-v0-aona3du67z9g1.jpeg?width=947&format=pjpg&auto=webp&s=00f22730fbf4aa59e4ca39ee195cc7119d6af442'),(4,'Caleb','$2b$10$bmhJ7TwpLJpnQig9p8/NrePACZSNK2aQ5cqchnvy6URKucdNQdtdy','al07011020@tecmilenio.mx','2026-03-04 04:26:12','fan','¡Hola! Soy un nuevo miembro de la comunidad Palomas del Gobierno.','2026-03-04 05:34:30',NULL,NULL,'publico','https://m.media-amazon.com/images/M/MV5BYTNjNjQ4OWEtOTk5Ny00NWE3LTk5YjktNTdiMzViOTYzNDQyXkEyXkFqcGc@._V1_.jpg');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-04 11:29:19
