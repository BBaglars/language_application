const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);

module.exports = { auth }; 