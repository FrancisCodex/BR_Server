
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/database')
const dotenv = require('dotenv');
const cookie = require('cookie');
// const sendVerificationEmail = require('../helpers/email'); // this is for the sending of verification
const sendVerificationEmail = require('../mail/verifyEmail'); //verify email
const crypto = require('crypto');



dotenv.config();



//random generation verification
const generateVerificationToken = () => {
    // Generate a random token here
    const verificationToken = crypto.randomBytes(32).toString('hex');
    return verificationToken;
  };


// Login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      // Check if the user exists in the database
      const userQueryResult = await pool.query('SELECT * FROM boardroom.users WHERE email = $1', [email]);
  
      // console.log('User query result:', userQueryResult.rows);
  
      if (userQueryResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const user = userQueryResult.rows[0];
  
      // Compare the entered password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
        console.log("Invalid Password");
      }
    
      // Generate and send a JSON web token (JWT) for authentication
      //Token is used as Refresh Token to get new accessToken
      const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Adjust the expiration time as needed
      });
      
      const accessToken = jwt.sign({ userId: user.user_id, role: user.role }, process.env.ACCESSTOKEN_SECRET, {
        expiresIn: '15m', // Adjust the expiration time as needed
      });
  
  
         // Set the token in a cookie
         res.setHeader(
          'Set-Cookie',
          cookie.serialize('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60, 
            sameSite: 'none',
            secure: false,
            path: '/',
          })
        );

        res.setHeader(
          'Set-Token',
          cookie.serialize('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'none', 
            secure: false,
            path: '/', 
          })
        );


        const refreshToken = await pool.query('SELECT token FROM boardroom.refresh_tokens WHERE user_id = $1', [user.user_id]);

        if (refreshToken.rows.length > 0) {
          // Update the existing refresh token
          await pool.query('UPDATE boardroom.refresh_tokens SET token = $1 WHERE user_id = $2', [token, user.user_id]);
        }

        res.status(200).json({ accessToken, token });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };


  // Sign-up Controller
  exports.register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

    try {
      // Check if the email already exists in the database
      const existingUser = await pool.query('SELECT * FROM boardroom.users WHERE email = $1', [email]);

      if (existingUser.rows.length > 0) {
        // Email already exists, return a 400 Bad Request response
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      // Hash the password before storing it in the database
      const saltRounds = 10; // You can adjust the number of salt rounds as needed
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate a verification token
      const verificationToken = generateVerificationToken();

      // Insert the new user into the database with verification token and role
      const newUser = await pool.query(
        'INSERT INTO boardroom.users (first_name, last_name, email, password_hash, verification_token, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [firstname, lastname, email, hashedPassword, verificationToken, 'renter']
      );
      // // Send a verification email to the user
      sendVerificationEmail(email, verificationToken);
      // Retrieve the user's ID from the 'users' table
      const userId = newUser.rows[0].user_id;
    // Insert user-specific data into the 'renter' table with the user's ID
    await pool.query(
      'INSERT INTO boardroom.renters (user_id, renter_school) VALUES ($1, $2)',
      [userId, "Caraga State University"]
    );

    //refresh token table
    const refreshToken = generateVerificationToken();

    await pool.query('INSERT INTO boardroom.refresh_tokens (user_id, token) values ($1, $2)', [userId, refreshToken]);

      // Send a successful registration response
      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);

      // Handle other errors (e.g., validation errors) here
      res.status(422).json({ success: false, message: 'Validation failed' });
    }
  };

  exports.logout = async (req, res) => {
    const cookies = req.cookies.token;
    if(!cookies) return res.status(204)
    
    res.clearCookie('token', {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // Token expiration time in seconds (1 hour in this example)
      sameSite: 'lax', // Adjust this based on your security requirements
      secure: false // Set secure to true in production
    })
    res.json({ message: "Token Cookie Cleared"})

  }



  exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      // Find the user with the matching reset token in the database
      const user = await pool.query('SELECT * FROM boardroom.users WHERE reset_token = $1', [token]);
  
      if (user.rows.length === 0) {
        return res.status(404).json({ message: 'Invalid or expired token' });
      }
  
      const userRecord = user.rows[0];
     
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password and clear the reset token in the database
      await pool.query('UPDATE boardroom.users SET password = $1, reset_token = null WHERE user_id = $2', [hashedPassword, userRecord.user_id]);
  
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

//check UserResetToken API
exports.checkResetToken = async (req, res) => {
  const { token } = req.body;
  try {
    // Find the user with the matching reset token in the database
    const user = await pool.query('SELECT * FROM boardroom.users WHERE reset_token = $1', [token]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    // const userRecord = user.rows[0];
    // const currentTimestamp = Date.now();

    // Check if the reset token has expired (adjust the time comparison as needed)
    // if (userRecord.reset_token_expires < currentTimestamp) {
    //   return res.status(401).json({ message: 'Token has expired' });
    // }

    // Token is valid
    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


  // Verify a user's email
exports.verifyEmail = async (req, res) => {
  const token = req.body.token;
  console.log("what is token", token);
  try {
    // Find the user with the matching verification token in the database
    const user = await pool.query('SELECT * FROM boardroom.users WHERE verification_token = $1', [token]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    // Mark the user's account as verified
    await pool.query('UPDATE boardroom.users SET email_verified = true, verification_token = null WHERE user_id = $1', [user.rows[0].user_id]);

    res.status(200).json({ message: 'Account verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    // Find the user with the matching email in the database
    const user = await pool.query('SELECT * FROM boardroom.users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new verification token
    const verificationToken = generateVerificationToken();

    // Update the user's verification token in the database
    await pool.query('UPDATE boardroom.users SET verification_token = $1 WHERE user_id = $2', [verificationToken, user.rows[0].user_id]);

    // Send a new verification email to the user
    verifyEmail(email, verificationToken);

    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

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

exports.test = (req, res) => {
  res.send("Test is working")
}