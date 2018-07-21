module.exports = {
    connection: function () {
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: 'den1.mysql3.gear.host',
            user: 'eddy',
            password: 'Mp7RV!u8_7hn'
        });

        connection.connect();
        return connection;
    }
};