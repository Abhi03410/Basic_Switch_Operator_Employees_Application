const bcrypt = require('bcryptjs');
const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
const { mkdir, readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { UserRole } = require('./user-role.cjs');

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || Buffer.byteLength(jwtSecret) < 32) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 bytes before starting the auth API.');
}

const port = Number(process.env.AUTH_PORT || 3002);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('AUTH_PORT must be a valid TCP port.');
}

const usersFile = process.env.AUTH_USERS_FILE
  ? path.resolve(process.env.AUTH_USERS_FILE)
  : path.join(__dirname, 'data', 'users.json');
const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.use(express.json({ limit: '16kb' }));

async function loadUsers() {
  await mkdir(path.dirname(usersFile), { recursive: true });

  try {
    const storedUsers = JSON.parse(await readFile(usersFile, 'utf8'));
    if (!Array.isArray(storedUsers)) {
      throw new Error('Auth user store must contain an array.');
    }
    return storedUsers;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    await writeFile(usersFile, '[]', { encoding: 'utf8', mode: 0o600, flag: 'wx' }).catch((writeError) => {
      if (writeError.code !== 'EEXIST') {
        throw writeError;
      }
    });
    return [];
  }
}

async function saveUsers(users) {
  await mkdir(path.dirname(usersFile), { recursive: true });
  await writeFile(usersFile, JSON.stringify(users, null, 2), { encoding: 'utf8', mode: 0o600 });
}

function safeUser(user) {
  return { email: user.email, role: user.role };
}

async function bootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email && !password) {
    return;
  }
  if (!email || !password || Buffer.byteLength(password) < 12 || Buffer.byteLength(password) > 72) {
    throw new Error('BOOTSTRAP_ADMIN_EMAIL and a 12-72 byte BOOTSTRAP_ADMIN_PASSWORD are both required.');
  }

  const users = await loadUsers();
  if (users.some((user) => user.email === email)) {
    return;
  }

  users.push({
    id: randomUUID(),
    firstName: 'Initial',
    lastName: 'Admin',
    email,
    mobileNumber: '',
    passwordHash: await bcrypt.hash(password, 12),
    role: UserRole.ADMIN,
  });
  await saveUsers(users);
}

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/auth/register', async (request, response, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      confirmPassword,
    } = request.body ?? {};

    if (
      typeof firstName !== 'string' ||
      typeof lastName !== 'string' ||
      typeof email !== 'string' ||
      typeof mobileNumber !== 'string' ||
      typeof password !== 'string' ||
      typeof confirmPassword !== 'string'
    ) {
      return response.status(400).json({ message: 'All registration fields are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      !firstName.trim() ||
      !lastName.trim() ||
      !mobileNumber.trim() ||
      Buffer.byteLength(password) < 8 ||
      Buffer.byteLength(password) > 72 ||
      password !== confirmPassword
    ) {
      return response.status(400).json({ message: 'Registration details are invalid.' });
    }

    const users = await loadUsers();
    if (users.some((user) => user.email === normalizedEmail)) {
      return response.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = {
      id: randomUUID(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      mobileNumber: mobileNumber.trim(),
      passwordHash: await bcrypt.hash(password, 12),
      role: UserRole.EMPLOYEE,
    };

    await saveUsers([...users, user]);
    return response.status(201).json({ user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.post('/auth/login', async (request, response, next) => {
  try {
    const { email, password } = request.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return response.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = await loadUsers();
    const user = users.find((entry) => entry.email === normalizedEmail);
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      return response.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = jwt.sign(
      { role: user.role },
      jwtSecret,
      { algorithm: 'HS256', expiresIn: '15m', subject: user.id },
    );

    return response.json({ accessToken, user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.get('/auth/me', async (request, response, next) => {
  try {
    const authorization = request.get('authorization') || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) {
      return response.status(401).json({ message: 'Authentication is required.' });
    }

    let claims;
    try {
      claims = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    } catch {
      return response.status(401).json({ message: 'The access token is invalid or expired.' });
    }

    if (typeof claims === 'string' || typeof claims.sub !== 'string') {
      return response.status(401).json({ message: 'The access token is invalid.' });
    }

    const users = await loadUsers();
    const user = users.find((entry) => entry.id === claims.sub);
    if (!user) {
      return response.status(401).json({ message: 'The account is no longer available.' });
    }

    return response.json({ user: safeUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error('Auth API request failed:', error);
  response.status(500).json({ message: 'An internal auth service error occurred.' });
});

async function start() {
  await loadUsers();
  await bootstrapAdmin();
  app.listen(port, '127.0.0.1', () => {
    console.log(`Auth API listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Unable to start auth API:', error.message);
  process.exitCode = 1;
});
