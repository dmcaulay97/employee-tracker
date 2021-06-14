const mysql = require('mysql');
const inquirer = require('inquirer');

const space = ' '
const dash = '-'

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Dylan422',
    database: 'employee_tracker_db'
});

const init = () => {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What do you want to do?',
        choices: ['Add', 'View', 'Update', 'Exit']
    })
        .then(({ action }) => {
            if (action == 'Add') {
                inquirer.prompt({
                    name: 'choice',
                    type: 'list',
                    message: 'What do you want to add?',
                    choices: ['Department', 'Role', 'Employee', 'Back']
                })
                    .then(({ choice }) => {
                        if (choice == 'Back') {
                            init()
                        } else {
                            add(choice);
                        }
                    })
            } else if (action == 'View') {
                inquirer.prompt({
                    name: 'choice',
                    type: 'list',
                    message: 'What do you want to view?',
                    choices: ['Departments', 'Roles', 'Employees', 'Back']
                })
                    .then(({ choice }) => {
                        if (choice == 'Back') {
                            init()
                        } else {
                            view(choice);
                        }
                    })
            } else if (action == 'Update') {
                inquirer.prompt({
                    name: 'choice',
                    type: 'list',
                    message: 'What do you want to update?',
                    choices: ["Employee's role", 'Back']
                })
                    .then(({ choice }) => {
                        if (choice == 'Back') {
                            init()
                        } else {
                            update(choice);
                        }
                    })
            } else {
                connection.end();
            }
        })
}


const add = (choice) => {
    if (choice == 'Employee') {
        const managers = ['none (This employee is a manager)'];
        const roles = [];
        connection.query('select title from roles;',
            (err, res) => {
                if (err) throw err;
                res.forEach(e => {
                    roles.push(e.title);
                })
                roles.sort();
                inquirer.prompt([
                    {
                        name: 'f_name',
                        type: 'input',
                        message: "Enter employee's first name:"
                    },
                    {
                        name: 'l_name',
                        type: 'input',
                        message: "Enter employee's last name:"
                    },
                    {
                        name: 'role',
                        type: 'list',
                        message: "Pick employee's role:",
                        choices: roles
                    },
                ])
                    .then(({ f_name, l_name, role }) => {
                        f_name = f_name.trim();
                        l_name = l_name.trim();
                        connection.query(`
                        select 
                        d.name
                        from roles r
                        join departments d on r.department_id = d.id
                        where r.title =?; `, [role],
                            (err, res) => {
                                if (err) throw err;
                                console.log(res);
                                connection.query(`
                                select 
                                e.first_name, 
                                e.last_name 
                                from employee e 
                                join roles r on e.role_id = r.id 
                                join departments d on r.department_id = d.id
                                where manager_id is null and d.name =? ;`, [res[0].name],
                                    (err, response) => {
                                        if (err) throw err;
                                        response.forEach(e => {
                                            const first = e.first_name.replace(' ', '*');
                                            const last = e.last_name.replace(' ', '*');
                                            managers.push(`${first} ${last}`);
                                        })
                                        inquirer.prompt(
                                            {
                                                name: 'manager',
                                                type: 'list',
                                                message: "Pick employee's manager:",
                                                choices: managers
                                            })
                                            .then(({ manager }) => {
                                                if (manager == 'none (This employee is a manager)') {
                                                    connection.query(`select id from roles where title =?;`, [role],
                                                        (err, response) => {
                                                            if (err) throw err;
                                                            connection.query('insert into employee (first_name, last_name, role_id) values (?, ?, ?)', [f_name, l_name, response[0].id],
                                                                (err, res) => {
                                                                    if (err) throw err;
                                                                    console.log("New employee added!")
                                                                    init();
                                                                })
                                                        })

                                                } else {
                                                    manager_name = manager.split(' ');
                                                    const first = manager_name[0].replace('*', ' ')
                                                    const last = manager_name[1].replace('*', ' ')
                                                    connection.query(`
                                                select 
                                                e.id as manager_id    
                                                from employee e join roles r on e.role_id = r.id
                                                where e.first_name =? and e.last_name =?`, [first, last],
                                                        (err, res) => {
                                                            if (err) throw err;
                                                            connection.query(`select id from roles where title =?;`, [role],
                                                                (err, response) => {
                                                                    if (err) throw err
                                                                    connection.query(`insert into employee (first_name, last_name, role_id, manager_id) values (?,?,?,?)`, [f_name, l_name, response[0].id, res[0].manager_id],
                                                                        (err, res) => {
                                                                            if (err) throw err;
                                                                            console.log("New employee added!")
                                                                            init();
                                                                        })
                                                                }

                                                            )

                                                        }
                                                    )
                                                }

                                            })
                                    })
                            }
                        )
                    })
            })
    } else if (choice == 'Role') {
        const departments = [];
        connection.query('select name from departments',
            (err, res) => {
                if (err) throw err;
                res.forEach(e => {
                    departments.push(e.name);
                })
                inquirer.prompt([
                    {
                        type: "input",
                        name: "title",
                        message: "Enter new role's title:"
                    },
                    {
                        type: "number",
                        name: "salary",
                        message: "Enter the salary for this role"
                    },
                    {
                        type: "list",
                        name: "department",
                        message: "Pick the department that this role belongs to:",
                        choices: departments
                    }
                ])
                    .then(({ title, salary, department }) => {
                        title = title.trim();
                        connection.query(`select id from departments where name = ?`, [department],
                            (err, res) => {
                                if (err) throw err;
                                connection.query(`insert into roles (title, salary, department_id) values(?, ?, ?)`, [title, salary, res[0].id],
                                    (err, res) => {
                                        if (err) throw err;
                                        console.log("New role added!")
                                        init();
                                    })
                            })
                    })

            })

    } else {
        inquirer.prompt({ type: "input", name: "name", message: "Enter the name of the new department:" })
            .then(({ name }) => {
                name = name.trim();
                connection.query(`insert into departments (name) values (?)`, [name],
                    (err, res) => {
                        if (err) throw err;
                        console.log("New department added");
                        init();
                    })
            })

    }

}

const update = (choice) => {
    if (choice == "Employee's role") {
        const employees = {};
        const roles = {};
        connection.query(`select id, first_name, last_name from employee`,
            (err, res) => {
                if (err) throw err;
                res.forEach(e => {
                    const name = `${e.first_name} ${e.last_name}`;
                    const id = e.id;
                    employees[name] = id;
                })
                connection.query(`select title, id from roles`,
                    (err, response) => {
                        if (err) throw err;
                        response.forEach(e => {
                            roles[e.title] = e.id;
                        })
                        inquirer.prompt([
                            {
                                type: "list",
                                name: 'name',
                                message: "Choose employee you want to update:",
                                choices: Object.keys(employees).sort()
                            },
                            {
                                type: "list",
                                name: 'role',
                                message: "Choose employee's new role:",
                                choices: Object.keys(roles).sort()
                            }
                        ])
                            .then(({ name, role }) => {
                                const emp_id = employees[name];
                                const role_id = roles[role]
                                connection.query(`update employee set role_id =? where id = ?`, [role_id, emp_id],
                                    (err, res) => {
                                        if (err) throw err;
                                        console.log("Employee's role changed!")
                                        const managers = {};
                                        connection.query(`select d.id from departments d join roles r on r.department_id = d.id where r.id = 2;`,
                                            (err, res) => {
                                                if (err) throw err;
                                                const department_id = res[0].id;
                                                connection.query(`
                                                select e.id, e.first_name, e.last_name
                                                from employee e 
                                                join roles r on e.role_id = r.id
                                                join departments d on r.department_id = d.id
                                                where manager_id is null and d.id =?;`, [department_id],
                                                    (err, response) => {
                                                        if (err) throw err;
                                                        response.forEach(e => {
                                                            const name = `${e.first_name} ${e.last_name}`
                                                            managers[name] = e.id;
                                                        })
                                                        inquirer.prompt({
                                                            type: 'list', name: 'manager', message: "Choose employee's new manager:", choices: Object.keys(managers)
                                                        })
                                                            .then(({ manager }) => {
                                                                if (manager = "none (This employee is a manager)") {
                                                                    connection.query(`update employee set manager_id = null where id =?`, [emp_id],
                                                                        (err, res) => {
                                                                            if (err) throw err;
                                                                            console.log("Manager changed!")
                                                                            init();
                                                                        })
                                                                } else {
                                                                    const manager_id = managers[manager];
                                                                    ; connection.query(`update employee set manager_id =? where id =? `, [manager_id, emp_id],
                                                                        (err, res) => {
                                                                            if (err) throw err;
                                                                            console.log("Manager changed!")
                                                                            init();
                                                                        })
                                                                }

                                                            })
                                                    })
                                            })

                                    })
                            })
                    })

            })
    }
}

const view = (choice) => {
    if (choice == 'Employees') {
        connection.query(`
        select 
        e.id,
        e.first_name,
        e.last_name,
        r.title,
        d.name as department,
        r.salary,
        e2.first_name as m_first,
        e2.last_name as m_last
        from employee e 
            left join employee e2 on e.manager_id = e2.id
            join roles r on e.role_id = r.id
            join departments d on r.department_id = d.id;`,
            (err, res) => {
                if (err) throw err;
                employeeDisplay(res);
                console.log('-'.repeat(200))
                init();
            })
    } else if (choice == 'Roles') {
        connection.query(`select 
        r.title,
        r.salary,
        d.name as department
        from roles r join departments d on r.department_id = d.id;`,
            (err, res) => {
                if (err) throw err;
                rolesDisplay(res);
                console.log('-'.repeat(200))
                init();
            })
    } else {
        connection.query(`select * from departments d;`,
            (err, res) => {
                if (err) throw err;
                departmentDisplay(res);
                console.log('-'.repeat(200))
                init();
            })

    }
}


const employeeDisplay = (array) => {
    let id = 2;
    let first = 10;
    let last = 9;
    let title = 5;
    let department = 10;
    let salary = 6;
    let manager = 7;
    array.forEach(e => {
        let manager_name = `${e.m_first} ${e.m_last}`;
        if (e.m_first == null) manager_name = 'null';

        if (e.id.toString().length > id) id = e.id.toString().length;
        if (e.first_name.length > first) first = e.first_name.length;
        if (e.last_name.length > last) last = e.first_name.length;
        if (e.title.length > title) title = e.title.length;
        if (e.department.length > department) department = e.department.length;
        if (e.salary.toString().length > salary) salary = e.salary.toString().length;
        if (manager_name.length > manager) manager = manager_name.length;
    })
    let display = `
    id${space.repeat(id - 2)} First Name${space.repeat(first - 10)} Last Name${space.repeat(last - 9)} Title${space.repeat(title - 5)} Department${space.repeat(department - 10)} Salary${space.repeat(salary - 6)} Manager${space.repeat(manager - 7)}
    ${dash.repeat(id)} ${dash.repeat(first)} ${dash.repeat(last)} ${dash.repeat(title)} ${dash.repeat(department)} ${dash.repeat(salary)} ${dash.repeat(manager)}`;
    array.forEach(e => {
        let manager_name = `${e.m_first} ${e.m_last}`
        if (e.m_first == null) manager_name = 'null';

        display += `
    ${e.id}${space.repeat(id - e.id.toString().length)} ${e.first_name}${space.repeat(first - e.first_name.length)} ${e.last_name}${space.repeat(last - e.last_name.length)} ${e.title}${space.repeat(title - e.title.length)} ${e.department}${space.repeat(department - e.department.length)} ${e.salary}${space.repeat(salary - e.salary.toString().length)} ${manager_name}${space.repeat(manager - manager_name.length)}`;
    });
    console.log(display);
}

const rolesDisplay = (array) => {
    let title = 5;
    let salary = 6;
    let department = 10;
    array.forEach(e => {
        if (e.title.length > title) title = e.title.length;
        if (e.salary.toString().length > salary) salary = e.salary.toString().length;
        if (e.department.length > department) department = e.department.length;
    })
    let display = `
    Title${space.repeat(title - 5)} Salary${space.repeat(salary - 6)} Department${space.repeat(department - 10)}
    ${dash.repeat(title)} ${dash.repeat(salary)} ${dash.repeat(department)}`;

    array.forEach(e => {
        display += `
    ${e.title}${space.repeat(title - e.title.length)} ${e.salary}${space.repeat(salary - e.salary.toString().length)} ${e.department}${space.repeat(department - e.department.length)}`
    });
    console.log(display);
}

const departmentDisplay = (array) => {
    let id = 2;
    let name = 4;
    array.forEach(e => {
        if (e.id.toString().length > id) id = e.id.toString();
        if (e.name.length > name) name = e.name.length;
    })
    let display = `
    id${space.repeat(id - 2)} Name${space.repeat(name - 4)}
    ${dash.repeat(id)} ${dash.repeat(name)}`;

    array.forEach(e => {
        display += `
    ${e.id}${space.repeat(id - e.id.toString().length)} ${e.name}${space.repeat(name - e.name.length)}`
    })
    console.log(display);
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`
    ---------------------------------------
    WELCOME TO THE EMPLOYEE MANAGER
    ---------------------------------------
    `);
    init();
});
