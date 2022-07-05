//Mongoose es un modulo para conectarnos con mongodb
const mongoose = require('mongoose');
const mysql = require('mysql');
const {promisify} = require('util');
const {database} = require('./keys');
const pool = mysql.createPool(database);

pool.getConnection((err, connection) => {
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('DB CONNECTION WAS CLOED');
        }
        if(err.code === 'ER_COUNT_ERRORR'){
            console.error('DB HAS TO MANY CONNECTIONS');
        }
        if(err.code === 'ECONNREFUSED'){
            console.error('DB CONNECTION WAS REFUSED');
        }
    }

    if(connection) connection.release();
    console.log('DB is MySQL is connected');
    return
})
//Ahora podemos usar promesas
pool.query = promisify(pool.query);
module.exports = pool;

mongoose.connect('mongodb://localhost/project-dba', {
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
    .then(db => console.log('DB MongoDB is connected'))
    .catch(err => console.error(err));
