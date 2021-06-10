drop database if exists employee_tracker_db;
create database employee_tracker_db;

use employee_tracker_db;

create table departments (
	id int auto_increment,
    name varchar(30),
    primary key(id)
);

create table roles (
	id int auto_increment,
    title varchar(30),
    salary decimal(10,4),
    department_id int,
    primary key(id),
    foreign key(department_id) references departments(id)
);

create table employee(
	id int auto_increment,
    first_name varchar(30),
    last_name varchar(30),
    role_id int,
    manager_id int,
    primary key(id),
    foreign key(role_id) references roles(id),
    foreign key(manager_id) references employee(id)
);