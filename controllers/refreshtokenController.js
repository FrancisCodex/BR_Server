const pool = require('../config/database');
const dotenv = require('dotenv');
const cookie = require('cookie');
dotenv.config();
const jwt = require('jsonwebtoken');

exports.refreshToken = async (req, res) => {
  // const token = req.headers.cookie.substring(7);
  const token = req.cookies.token;

  if (!token) {
    // No refresh token found in cookies
    return res.status(401).json({ message: 'Refresh token not provided' });
  }

  try {
    const isValidRefreshToken = await pool.query('SELECT * FROM boardroom.refresh_tokens WHERE token = $1', [token]);

    if (isValidRefreshToken.rows.length === 0) {
      // Refresh token not found in the database
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // Token verification failed
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Generate a new access token
      const newAccessToken = jwt.sign({ userId: user.userId, role: user.role }, process.env.ACCESSTOKEN_SECRET, {
        expiresIn: '10s', // Adjust the expiration time as needed
      });

      // Update the cookie with the new access token
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', newAccessToken, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60, // Set to your desired duration
          sameSite: 'none',
          secure: false, // Set secure to true in production
          path: '/',
        })
      );

      // Respond with the new access token
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

