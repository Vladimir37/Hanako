var Sequelize = require('sequelize');

var db_config = require('../../configs/db');
var boards = require('../data/boards');

var sequelize = new Sequelize(db_config.database, db_config.login, db_config.pass, {
    dialect: db_config.dialect,
    port: db_config.port
});

//testing connect
sequelize.authenticate().then(function() {
    console.log('Подключение установлено!');
}, function(err) {
    console.log('Ошибка подключения: ' + err);
});

//models
//all models
var tables = {};
tables.boards = {};

//boards' models
for(name in boards) {
    console.log(name);
    tables.boards[name] = sequelize.define(name + '_posts', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        name: Sequelize.TEXT,
        text: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        image: Sequelize.TEXT,
        thread: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        sage: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        ip: Sequelize.TEXT,
        trip: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        admin: {
            type: Sequelize.INTEGER,
            allowNull: true
        }
    });
};

//system tables
tables.admins = sequelize.define('_admins', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.TEXT,
    pass: Sequelize.TEXT,
    status: Sequelize.INTEGER,
    boards: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    active: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
});

tables.reports = sequelize.define('_reports', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    text: Sequelize.TEXT,
    ip: Sequelize.TEXT,
    board: Sequelize.TEXT,
    respondent: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    active: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
});

tables.bans = sequelize.define('_bans', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    boards: Sequelize.TEXT,
    reason: Sequelize.TEXT,
    time: Sequelize.INTEGER,
    active: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    }
});

//synchronization tables
function sync(list) {
    for(table in list) {
        if(table == 'boards') {
            sync(list.boards);
        }
        else {
            list[table].sync().then(function(result) {
                console.log('Table ' + result.name + ' successfully synchronized');
            }, function(err) {
                console.log('Error: ' + err);
            });
        }
    }
};

sync(tables);