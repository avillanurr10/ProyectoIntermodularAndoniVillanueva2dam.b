drop database if exists proleague;
create database proleague;
USE proleague;




-- Tabla de equipos
CREATE TABLE equipos (
    id INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    nombre_completo VARCHAR(150),
    abreviatura VARCHAR(10),
    ciudad VARCHAR(100),
    conferencia VARCHAR(50),
    division VARCHAR(50)
);

-- Tabla de jugadores
CREATE TABLE jugadores (
    id INT PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    equipo_id INT,
    posicion VARCHAR(20),
    altura_pies INT,
    altura_pulgadas INT,
    peso_lb INT,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

-- Tabla de usuarios (gamificación)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255),
    puntos INT DEFAULT 0,
    rango VARCHAR(50)
);
