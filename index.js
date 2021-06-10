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
                    choices: ['Department', 'Role', 'Employee', 'Back']
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

const update = (choice) => {

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
