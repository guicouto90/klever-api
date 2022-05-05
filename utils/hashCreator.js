const crypto = require('crypto');

// REF: https://gist.github.com/kitek/1579117
const hashCreator = (payload) => {
  const result = crypto.createHash('md5').update(payload).digest('hex');
  return result;
};

module.exports = hashCreator;