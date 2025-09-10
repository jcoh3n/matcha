// User model
class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Validate user data
  static validate(userData) {
    const errors = [];
    
    if (!userData.email) {
      errors.push('Email is required');
    }
    
    if (!userData.username) {
      errors.push('Username is required');
    }
    
    if (!userData.firstName) {
      errors.push('First name is required');
    }
    
    if (!userData.lastName) {
      errors.push('Last name is required');
    }
    
    return errors;
  }
}

module.exports = User;