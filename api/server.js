const port = 3000;
const http = require('./app');

http.listen(port, () => console.log(`${port} working properly`));