const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


const Product = require('../models/products');
const productRoutes = require('../product');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
const testDir = path.join(__dirname, '__tests__');


function ensureDirSync(dirPath) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}


function removeDirSync(dirPath) {
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch (err) {
    console.error('Error removing directory:', err);
  }
}


ensureDirSync(uploadDir);
ensureDirSync(testDir);


app.use('/products', productRoutes);


beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});


beforeEach(async () => {
  await Product.deleteMany({});
});


afterAll(async () => {
  await mongoose.connection.close();
  
 
  removeDirSync(testDir);
});

describe('Product Routes', () => {
  // Test product data
  const testProduct = {
    name: 'Test Product',
    description: 'Test Description',
    price: 19.99,
    category: 'Test Category'
  };

 
  const testImagePath = path.join(testDir, 'test-image.jpg');

 
  beforeAll(() => {
   
    fs.writeFileSync(testImagePath, 'test image content');
  });


  afterAll(() => {
    try {
      fs.unlinkSync(testImagePath);
    } catch (err) {
      console.error('Error removing test image:', err);
    }
  });

  describe('POST /products/add', () => {
    it('should add a new product with image', async () => {
      const res = await request(app)
        .post('/products/add')
        .field('name', testProduct.name)
        .field('description', testProduct.description)
        .field('price', testProduct.price)
        .field('category', testProduct.category)
        .attach('image', testImagePath);

      expect(res.statusCode).toBe(201);
      expect(res.body.product).toMatchObject({
        name: testProduct.name,
        description: testProduct.description,
        price: testProduct.price,
        image: expect.stringContaining('/uploads/')
      });

     
      const savedProduct = await Product.findById(res.body.product._id);
      expect(savedProduct).toBeTruthy();
    });

    it('should add a new product without image', async () => {
      const res = await request(app)
        .post('/products/add')
        .send({
          name: testProduct.name,
          description: testProduct.description,
          price: testProduct.price,
          category: testProduct.category
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.product).toMatchObject({
        name: testProduct.name,
        description: testProduct.description,
        price: testProduct.price,
        image: ''
      });
    });

    it('should handle server error during product creation', async () => {
      // Mock Product.save() to throw an error
      jest.spyOn(Product.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .post('/products/add')
        .send(testProduct);

      expect(res.statusCode).toBe(500);
      expect(res.body.msg).toBe('Server error');

      // Restore the original implementation
      Product.prototype.save.mockRestore();
    });
  });

  describe('GET /products', () => {
    it('should retrieve all products', async () => {
      // Add some test products
      await Product.create([
        { ...testProduct, name: 'Product 1' },
        { ...testProduct, name: 'Product 2' }
      ]);

      const res = await request(app).get('/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('should handle error when retrieving products', async () => {
      // Mock Product.find() to throw an error
      jest.spyOn(Product, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/products');

      expect(res.statusCode).toBe(500);
      expect(res.body.msg).toBe('Server error');

      
      Product.find.mockRestore();
    });
  });

  describe('PUT /products/:id', () => {
    it('should update a product with image', async () => {
      // Create a product first
      const product = await Product.create(testProduct);

      const res = await request(app)
        .put(`/products/${product._id}`)
        .field('name', 'Updated Product')
        .field('description', 'Updated Description')
        .field('price', 29.99)
        .attach('image', testImagePath);

      expect(res.statusCode).toBe(200);
      expect(res.body.product).toMatchObject({
        name: 'Updated Product',
        description: 'Updated Description',
        price: 29.99,
        image: expect.stringContaining('/uploads/')
      });
    });

    it('should update a product without image', async () => {
      // Create a product first
      const product = await Product.create(testProduct);

      const res = await request(app)
        .put(`/products/${product._id}`)
        .send({
          name: 'Updated Product',
          description: 'Updated Description',
          price: 29.99
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.product).toMatchObject({
        name: 'Updated Product',
        description: 'Updated Description',
        price: 29.99
      });
    });

    it('should handle product not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/products/${fakeId}`)
        .send(testProduct);

      expect(res.statusCode).toBe(404);
      expect(res.body.msg).toBe('Product not found');
    });

    it('should handle server error during update', async () => {
      // Create a product first
      const product = await Product.create(testProduct);

      // Mock findByIdAndUpdate to throw an error
      jest.spyOn(Product, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .put(`/products/${product._id}`)
        .send(testProduct);

      expect(res.statusCode).toBe(500);
      expect(res.body.msg).toBe('Server error');

      // Restore the original implementation
      Product.findByIdAndUpdate.mockRestore();
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product', async () => {
      // Create a product first
      const product = await Product.create(testProduct);

      const res = await request(app).delete(`/products/${product._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe('Product deleted successfully');

     
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it('should handle product not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app).delete(`/products/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.msg).toBe('Product not found');
    });

    it('should handle server error during deletion', async () => {
     
      const product = await Product.create(testProduct);

      
      jest.spyOn(Product, 'findByIdAndDelete').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app).delete(`/products/${product._id}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.msg).toBe('Server error');

     
      Product.findByIdAndDelete.mockRestore();
    });
  });
});
