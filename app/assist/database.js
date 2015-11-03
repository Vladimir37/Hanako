var Sequelize = require('sequelize');

var db_config = require('../../configs/db');
var boards = require('../data/boards');

var sequelize = new Sequelize(db_config.name, db_config.login, db_config.pass, {
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
    tables.boards[name] = sequelize.define(name, {
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
    status: Sequelize.INTEGER
});

tables.reports = sequelize.define('_reports', {
    //
});

//tables.bans = sequelize.define('_bans', {
//
//});