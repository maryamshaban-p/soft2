const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

jest.mock('bcrypt');

describe('Admin Model Test Only', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should hash the password before saving', async () => {
    const plainPassword = 'admin123';
    const mockHashedPassword = 'hashedPassword';
    
   
    bcrypt.hash.mockResolvedValue(mockHashedPassword);

    const admin = new Admin({ username: 'admin', password: plainPassword });
    await admin.save(); 

   
    expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, expect.any(Number));

   
    expect(admin.password).toBe(mockHashedPassword);
  });

  it('should not rehash the password if it is not modified', async () => {
    const mockHashedPassword = 'hashedPassword';

   
    bcrypt.hash.mockResolvedValue(mockHashedPassword);

   
    const admin = new Admin({ username: 'admin', password: 'admin123' });

    
    await admin.save();
    const originalHashedPassword = admin.password;

   
    admin.username = 'newAdmin';

    
    await admin.save();

   
    expect(admin.password).toBe(originalHashedPassword);

    
    expect(bcrypt.hash).toHaveBeenCalledTimes(1); 
  });

  it('should compare passwords correctly', async () => {
    const plainPassword = 'admin123';
    const hashedPassword = 'hashedPassword';
    bcrypt.compare.mockResolvedValue(true);

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

    expect(isMatch).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
  });
});
