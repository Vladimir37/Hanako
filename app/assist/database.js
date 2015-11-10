var Sequelize = require('sequelize');

var db_config = require('../../configs/db');
var boards = require('../data/boards');

var sequelize = new Sequelize(db_config.database, db_config.login, db_config.pass, {
    dialect: db_config.dialect,
    port: db_config.port,
    logging: false
});

//testing connect
sequelize.authenticate().then(function() {
    console.log('Connect to DB created!');
}, function(err) {
    console.log('Connection error: ' + err);
});

//models
//all models
var tables = {};
tables.boards = {};

//boards' models
for(name in boards) {
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
            type: Sequelize.INTEGER,
            defaultValue: 1
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
    resolution: {
        type: Sequelize.TEXT,
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
    board: Sequelize.TEXT,
    reason: Sequelize.TEXT,
    respondent: Sequelize.INTEGER,
    time: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
});

//tables binding
tables.reports.belongsTo(tables.admins, {foreignKey: 'respondent'});
tables.bans.belongsTo(tables.admins, {foreignKey: 'respondent'});

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

module.exports = tables;