const pool = require('../config/database')

exports.userdata = async (req, res) => {

    // Token is valid, proceed with fetching user data
    const userData = await pool.query('SELECT first_name, last_name, email, email_verified, account_created_at, role FROM boardroom.users WHERE user_id = $1', [req.user.userId]);
  
    try {
      if (userData.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const { first_name, last_name, email, email_verified, account_created_at, role } = userData.rows[0];
      res.status(200).json({
        user: {
          firstName: first_name,
          lastName: last_name,
          role: role,
          email,
          emailVerified: email_verified,
          accountCreatedAt: account_created_at,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };