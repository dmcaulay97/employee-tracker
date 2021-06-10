use employee_tracker_db;

insert into departments(name) values ("IT"), ("Sales"), ("Devlopment");

insert into roles(title, salary, department_id) values ("IT Manager", 72000, 1), ("IT Clerk", 56000, 1), ("Sales Manager", 64000, 2), ("Sales Associate", 44000, 2), ("Development Manager", 80000, 3), ("Developer", 74000, 3);

insert into employee (first_name, last_name, role_id) values ("Johanna", "Kerr", 1), ("Billy", "Guerra", 3), ("Sallie", "Leonard", 5);

insert into employee (first_name, last_name, role_id, manager_id) values ("Ronald", "Miranda", 2, 1), ("Leland", "Henson", 2, 1), ("Mared", "Roth", 4, 2), ("Briana", "Carlson", 4, 2), ("Jimmy", "Nixon", 6, 3), ("Rhodri", "Melia", 6, 3);