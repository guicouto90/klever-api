const port = 3001;
const http = require('./app');

http.listen(port, () => console.log(`${port} working properly`));