module.exports = {
  port: process.env.PORT || 5002,
  api: 'http://localhost:5003/api/',
  fb : {
    validation_token : 'VALIDATION_TOKEN',
    access_token : 'ACCESS_TOKEN'
  },
  db_config: {
    host : 'HOST',
    user : 'USER',
    password : 'PASSWORD',
    database : 'DATABASE'
  }
}
