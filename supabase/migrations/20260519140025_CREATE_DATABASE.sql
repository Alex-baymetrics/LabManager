-- 1. Criando o Schema

CREATE SCHEMA IF NOT EXISTS labManager;
 
-- 2. Criando o tipo ENUM dentro do schema labManager

CREATE TYPE labManager.user_role AS ENUM ('admin', 'colaborador', 'usuário');
 
-- 3. Criando a tabela de usuários

CREATE TABLE labManager.users (

    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    user_type labManager.user_role NOT NULL,

    status BOOLEAN NOT NULL DEFAULT TRUE

);
 
-- 4. Criando a tabela de laboratórios

CREATE TABLE labManager.laboratory (

    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    fk_user_manager_id INT, 

    name VARCHAR(100) NOT NULL,

    opening_time TIME NOT NULL,

    closure_time TIME NOT NULL,

    status BOOLEAN NOT NULL DEFAULT FALSE,

    uf CHAR(2) NOT NULL,

    city VARCHAR(100) NOT NULL,

    street VARCHAR(150) NOT NULL,

    number VARCHAR(20) NOT NULL,

    max_capacity INT NOT NULL,

    CONSTRAINT fk_manager FOREIGN KEY (fk_user_manager_id) REFERENCES labManager.users(id)

);
 
-- 5. Criando a tabela de histórico diário

CREATE TABLE labManager.daily_history (

    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    fk_laboratory_id INT NOT NULL,

    access_quantity INT NOT NULL DEFAULT 0,

    report_date DATE NOT NULL,

    average_stay_minutes FLOAT NOT NULL,

    CONSTRAINT fk_lab_history FOREIGN KEY (fk_laboratory_id) REFERENCES labManager.laboratory(id)

);
 
-- 6. Criando a tabela de histórico de acessos

CREATE TABLE labManager.access_history (

    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    fk_laboratory_id INT NOT NULL,

    fk_user_id INT NOT NULL,

    entry_time TIME NOT NULL,

    departure_time TIME,

    access_date DATE NOT NULL,

    CONSTRAINT fk_lab_access FOREIGN KEY (fk_laboratory_id) REFERENCES labManager.laboratory(id),

    CONSTRAINT fk_user_access FOREIGN KEY (fk_user_id) REFERENCES labManager.users(id)

);
 
-- 7. Criando a tabela de tickets

CREATE TABLE labManager.ticket (

    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    fk_user_id INT NOT NULL,

    fk_laboratory_id INT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status BOOLEAN NOT NULL DEFAULT TRUE,

    departure_date TIMESTAMP,

    ticket_responsible_id INT,

    CONSTRAINT fk_user_ticket FOREIGN KEY (fk_user_id) REFERENCES labManager.users(id),

    CONSTRAINT fk_lab_ticket FOREIGN KEY (fk_laboratory_id) REFERENCES labManager.laboratory(id),

    CONSTRAINT fk_responsible_ticket FOREIGN KEY (ticket_responsible_id) REFERENCES labManager.users(id)

);
 