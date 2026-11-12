const crypto = require('crypto');
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdout.write('Password admin (input disembunyikan): ');
let password = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  for (const character of chunk) {
    if (character === '\u0003') process.exit(1);
    if (character === '\r' || character === '\n') {
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      process.stdout.write(`\nADMIN_PASSWORD_HASH=scrypt$${salt}$${hash}\n`);
      password = '';
      return;
    }
    if (character === '\u007f' || character === '\b') password = password.slice(0, -1);
    else password += character;
  }
});
