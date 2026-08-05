import { Md5 } from 'crypto';
const hash = require('crypto').createHash('md5').update('a').digest('hex');
console.log('MD5 of "a":', hash);
