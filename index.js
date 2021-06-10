const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Dylan422',
    database: 'employee_tracker_db'
});

const init = () => {
    console.log(`
---------------------------------------
WELCOME TO THE EMPLOYEE MANAGER
---------------------------------------
`);
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
                console.log(res);
                createDisplay(res);
            })
    }
}

const update = (choice) => {

}

const createDisplay = (array) => {
    let id = 2;
    let first = 10;
    let last = 9;
    let title = 5;
    let department = 10;
    let salary = 6;
    let manager = 7;
    let space = ' '
    let dash = '-'
    array.forEach(e => {
        let manager_name = `${e.m_first} ${e.m_last}`;
        if (e.m_first == null) manager_name = 'null';

        if (e.id.toString().length > id) id = e.id.toString().length;
        if (e.first_name.length > first) first = e.first_name.length;
        if (e.last_name.length > last) last = e.first_name.length;
        if (e.title.length > title) title = e.title.length;
        if (e.department.length > department) deparment = e.department.length;
        if (e.salary.toString().length > salary) salary = e.salary.toString().length;
        if (manager_name.length > manager) manager = manager_name.length;
    })
    let display = `
    id${space.repeat(id - 2)} First Name${space.repeat(first - 10)} Last Name${space.repeat(last - 9)} Title${space.repeat(title - 5)} Department${space.repeat(department - 10)} Salary${space.repeat(salary - 6)} Manager${space.repeat(manager - 7)}
    ${dash.repeat(id)} ${dash.repeat(first)} ${dash.repeat(last)} ${dash.repeat(title)} ${dash.repeat(department)} ${dash.repeat(salary)} ${dash.repeat(manager)}\n`;
    array.forEach(e => {
        let manager_name = `${e.m_first} ${e.m_last}`
        if (e.m_first == null) manager_name = 'null';

        display += `
    ${e.id}${space.repeat(id - e.id.toString().length)} ${e.first_name}${space.repeat(first - e.first_name.length)} ${e.last_name}${space.repeat(last - e.last_name.length)} ${e.title}${space.repeat(title - e.title.length)} ${e.department}${space.repeat(department - e.department.length)} ${e.salary}${space.repeat(salary - e.salary.toString().length)} ${manager_name}${space.repeat(manager - manager_name.length)}\n`
    });
    console.log(display);
}

connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    init();
});
