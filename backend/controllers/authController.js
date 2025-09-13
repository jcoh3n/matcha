const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');
const { createTransporter, generateVerificationUrl } = require('../config/email');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET || 'access_secret_key',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Send verification email
const sendVerificationEmail = async (user) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = generateVerificationUrl(user.emailVerificationToken);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@matcha.com',
      to: user.email,
      subject: 'Bienvenue sur Matcha - Vérifiez votre adresse email',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #eae9e5; color: #2f330b;">
          <!-- Header with Matcha branding -->
          <div style="text-align: center; background-color: #78875e; color: #eae9e5; padding: 30px 20px; border-radius: 12px 12px 0 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <img src="cid:logo" style="max-width: 80px; margin-bottom: 15px;" alt="Matcha Logo" />
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Matcha</h1>
            <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.9;">Trouvez l'amour à votre goût</p>
          </div>
          
          <!-- Main content -->
          <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
            <h2 style="color: #2f330b; margin-top: 0; font-size: 24px; font-weight: 600;">Bienvenue ${user.firstName} !</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444111; margin: 20px 0;">
              Merci de vous être inscrit sur Matcha. Nous sommes ravis de vous compter parmi nos membres.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444111; margin: 20px 0;">
              Pour finaliser votre inscription et commencer à rencontrer des personnes formidables, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
            </p>
            
            <!-- Verification button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #78875e; color: #eae9e5; padding: 16px 32px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(120, 135, 94, 0.3);">
                Vérifier mon email
              </a>
            </div>
            
            <!-- Alternative link -->
            <div style="background-color: #bcc4ac; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="font-size: 14px; color: #2f330b; margin: 0 0 10px 0; text-align: center;">
                Si le bouton ne fonctionne pas, copiez et collez le lien suivant :
              </p>
              <p style="word-break: break-all; color: #78875e; font-size: 13px; margin: 0; text-align: center; font-family: monospace;">
                ${verificationUrl}
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.5; color: #444111; margin: 30px 0 0 0;">
              Si vous n'avez pas créé de compte sur Matcha, vous pouvez ignorer cet email.
            </p>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #bcc4ac; color: #444111; font-size: 14px;">
              <p style="margin: 0;">Cordialement,<br/><span style="font-weight: 600; color: #78875e;">L'équipe Matcha</span></p>
            </div>
          </div>
          
          <!-- Footer note -->
          <div style="text-align: center; margin-top: 20px; color: #444111; font-size: 12px;">
            <p style="margin: 0;">© 2025 Matcha. Tous droits réservés.</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'logo-matcha.png',
        path: './public/logo-matcha.png',
        cid: 'logo' // same cid value as in the html img src
      }]
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', user.email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Register a new user
const register = async (req, res) => {
  try {
    let { email, username, firstName, lastName, password } = req.body;
    
    // Log the request body for debugging
    console.log('Registration request body:', req.body);
    
    // Validate required fields
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ 
        message: 'Email, first name, last name, and password are required' 
      });
    }
    
    // Auto-generate username if not provided
    if (!username) {
      username = email.split('@')[0];
    }
    
    // Check password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists
    console.log('Checking if user already exists...');
    const existingUser = await User.findByEmail(email);
    console.log('Existing user check result:', existingUser);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email already exists' 
      });
    }
    
    // Hash password
    console.log('Hashing password...');
    const saltRounds = 10;
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return res.status(500).json({ 
        message: 'Error hashing password' 
      });
    }
    
    // Create user
    console.log('Creating user...');
    let newUser;
    try {
      newUser = await User.create({
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword
      });
      console.log('User created successfully:', newUser);
    } catch (createError) {
      console.error('Error creating user:', createError);
      return res.status(500).json({ 
        message: 'Error creating user' 
      });
    }
    
    // Send verification email
    try {
      await sendVerificationEmail(newUser);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // We don't want to fail registration if email sending fails
      // But we should log it for monitoring
    }
    
    // Generate tokens
    console.log('Generating tokens...');
    const { accessToken, refreshToken } = generateTokens(newUser.id);
    console.log('Tokens generated successfully');
    
    // Store refresh token in database (for logout/invalidation)
    console.log('Storing refresh token in database...');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    await db.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [newUser.id, refreshToken, expiresAt]
    );
    console.log('Refresh token stored successfully');
    
    // Return user data and tokens (without password)
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt
    };
    
    console.log('Sending response...');
    res.status(201).json({
      user: userResponse,
      accessToken,
      refreshToken,
      message: 'User registered successfully. Please check your email to verify your account.'
    });
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email address before logging in' 
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Store refresh token in database (for logout/invalidation)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    await db.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (token) DO UPDATE SET expires_at = $3',
      [user.id, refreshToken, expiresAt]
    );
    
    // Return user data and tokens (without password)
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };
    
    res.status(200).json({
      user: userResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        message: 'Verification token is required' 
      });
    }
    
    // Find user by verification token
    const result = await db.query(
      'SELECT * FROM users WHERE email_verification_token = $1', 
      [token]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }
    
    const user = new User(result.rows[0]);
    
    // Check if already verified
    if (user.emailVerified) {
      return res.status(200).json({
        message: 'Email already verified'
      });
    }
    
    // Update user's email verification status
    const updateResult = await db.query(
      'UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1 RETURNING *',
      [user.id]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(500).json({ 
        message: 'Error updating user verification status' 
      });
    }
    
    res.status(200).json({
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return res.status(200).json({
        message: 'Email already verified'
      });
    }
    
    // Generate new verification token
    const crypto = require('crypto');
    const newToken = crypto.randomBytes(32).toString('hex');
    
    // Update user with new token
    const updateResult = await db.query(
      'UPDATE users SET email_verification_token = $1, email_verification_sent_at = $2 WHERE id = $3 RETURNING *',
      [newToken, new Date(), user.id]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(500).json({ 
        message: 'Error updating verification token' 
      });
    }
    
    const updatedUser = new User(updateResult.rows[0]);
    
    // Send verification email
    try {
      await sendVerificationEmail(updatedUser);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({ 
        message: 'Error sending verification email' 
      });
    }
    
    res.status(200).json({
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${user.passwordResetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@matcha.com',
      to: user.email,
      subject: 'Matcha - Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #eae9e5; color: #2f330b;">
          <!-- Header with Matcha branding -->
          <div style="text-align: center; background-color: #78875e; color: #eae9e5; padding: 30px 20px; border-radius: 12px 12px 0 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <img src="cid:logo" style="max-width: 80px; margin-bottom: 15px;" alt="Matcha Logo" />
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Matcha</h1>
            <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.9;">Trouvez l'amour à votre goût</p>
          </div>
          
          <!-- Main content -->
          <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
            <h2 style="color: #2f330b; margin-top: 0; font-size: 24px; font-weight: 600;">Bonjour ${user.firstName},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444111; margin: 20px 0;">
              Vous recevez cet email car vous (ou quelqu'un d'autre) avez demandé la réinitialisation du mot de passe de votre compte Matcha.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444111; margin: 20px 0;">
              Veuillez cliquer sur le bouton ci-dessous pour réinitialiser votre mot de passe :
            </p>
            
            <!-- Reset button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #78875e; color: #eae9e5; padding: 16px 32px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(120, 135, 94, 0.3);">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <!-- Alternative link -->
            <div style="background-color: #bcc4ac; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="font-size: 14px; color: #2f330b; margin: 0 0 10px 0; text-align: center;">
                Si le bouton ne fonctionne pas, copiez et collez le lien suivant :
              </p>
              <p style="word-break: break-all; color: #78875e; font-size: 13px; margin: 0; text-align: center; font-family: monospace;">
                ${resetUrl}
              </p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.5; color: #444111; margin: 30px 0 0 0;">
              Ce lien expirera dans 1 heure. Si vous n'avez pas demandé la réinitialisation de votre mot de passe, vous pouvez ignorer cet email.
            </p>
            
            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #bcc4ac; color: #444111; font-size: 14px;">
              <p style="margin: 0;">Cordialement,<br/><span style="font-weight: 600; color: #78875e;">L'équipe Matcha</span></p>
            </div>
          </div>
          
          <!-- Footer note -->
          <div style="text-align: center; margin-top: 20px; color: #444111; font-size: 12px;">
            <p style="margin: 0;">© 2025 Matcha. Tous droits réservés.</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'logo-matcha.png',
        path: './public/logo-matcha.png',
        cid: 'logo' // same cid value as in the html img src
      }]
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', user.email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // We don't want to reveal if the email exists or not for security reasons
      // So we return success even if the user doesn't exist
      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email address first' 
      });
    }
    
    // Generate a password reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry
    
    // Store it in the database with an expiration time
    await db.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );
    
    // Update user object with reset token for email
    user.passwordResetToken = resetToken;
    
    // Send an email with the reset link
    try {
      await sendPasswordResetEmail(user);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({ 
        message: 'Error sending password reset email' 
      });
    }
    
    res.status(200).json({
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Token and new password are required' 
      });
    }
    
    // Check password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Verify the token
    const result = await db.query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires_at > $2',
      [token, new Date()]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Invalid or expired token' 
      });
    }
    
    const user = new User(result.rows[0]);
    
    // Note: We could check if the new password is different from the old one,
    // but since the old password is hashed, we can't easily do this comparison.
    // The frontend should inform users to choose a different password.
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password in the database
    await db.query(
      'UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expires_at = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );
    
    res.status(200).json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  generateTokens
};