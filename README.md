# ITP_P - E-Commerce Platform with AI-Powered Sentiment Analysis

A comprehensive e-commerce platform built with React frontend, Node.js backend, and Python-based sentiment analysis for customer feedback processing.

## 🚀 Features

### Core E-Commerce Features
- **User Management**: Registration, login, profile management with role-based access (Admin/Customer)
- **Product Management**: CRUD operations for clothing products (Men's, Women's, Kids wear)
- **Order Management**: Complete order processing and tracking
- **Payment Integration**: Stripe payment gateway integration
- **Shopping Cart**: Add to cart functionality with dropdown interface
- **Customization**: Clothing customization options with PDF generation

### AI-Powered Features
- **Sentiment Analysis**: Python-based ML model for analyzing customer feedback sentiment
- **Feedback Management**: Automated sentiment classification of reviews
- **Analytics Dashboard**: Visual charts and statistics for feedback analysis

### Administrative Features
- **Admin Dashboard**: Comprehensive admin panel for managing all aspects
- **Supplier Management**: Email-based supplier communication system
- **Raw Material Management**: Inventory tracking for raw materials
- **PDF Generation**: Automated PDF reports for various entities
- **Email Notifications**: Automated email system using Nodemailer and Mailtrap

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** with Vite
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Axios** for API calls
- **Stripe React** for payment processing
- **Recharts** for data visualization
- **jsPDF** for PDF generation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Stripe** for payment processing
- **Nodemailer** for email services
- **CORS** for cross-origin requests

### AI/ML Component
- **Python** with scikit-learn
- **NLTK** for natural language processing
- **Pandas** for data manipulation
- **NumPy** for numerical operations
- **Pickle** for model serialization

## 📁 Project Structure

```
ITP_P/
├── BACKEND/                    # Node.js backend
│   ├── controllers/            # Route controllers
│   │   ├── ClothingCustomization/
│   │   ├── FeedbackManagement/
│   │   ├── orderManagement/
│   │   ├── paymentManagement/
│   │   ├── productManagement/
│   │   ├── RawManagement/
│   │   ├── supplierManagement/
│   │   └── UserManagement/
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── Email/                  # Email templates and config
│   ├── uploads/                # File uploads directory
│   └── server.js              # Main server file
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── adminComponents/
│   │   │   ├── AI/            # AI chatbot components
│   │   │   ├── Feedback/      # Feedback management
│   │   │   ├── productManagement/
│   │   │   ├── paymentManagement/
│   │   │   └── userManagemnt/
│   │   ├── store/             # Zustand state management
│   │   └── lib/               # Utility functions
│   └── public/                # Static assets
└── python/                    # Python ML component
    ├── static/model/          # Trained ML model files
    ├── notebooks/             # Jupyter notebooks
    ├── artifacts/             # Dataset and artifacts
    └── helper.py              # Sentiment analysis helper
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ITP_P
   ```

2. **Backend Setup**
   ```bash
   cd BACKEND
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Python Environment Setup**
   ```bash
   cd ../python
   python -m venv env
   # Windows
   env\Scripts\activate
   # macOS/Linux
   source env/bin/activate
   
   pip install -r requirements.txt
   ```

### Environment Configuration

Create `.env` files in the BACKEND directory with the following variables:

```env
# Database
MONGODB_URL=mongodb://localhost:27017/itp_p

# Server
PORT=8070
CLIENT_URL=http://localhost:5173

# JWT
JWT_SECRET=your_jwt_secret_key

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
MAILTRAP_TOKEN=your_mailtrap_token

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Running the Application

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd BACKEND
   npm run dev
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test Python Sentiment Analysis**
   ```bash
   cd python
   python helper.py "This is a great product!"
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8070

## 🔧 API Endpoints

### Authentication
- `POST /user/register` - User registration
- `POST /user/login` - User login
- `POST /user/forget-password` - Password reset request
- `POST /user/reset-password/:token` - Password reset

### Products
- `GET /product` - Get all products
- `POST /product` - Create product (Admin)
- `PUT /product/:id` - Update product (Admin)
- `DELETE /product/:id` - Delete product (Admin)

### Orders
- `GET /order` - Get orders
- `POST /order` - Create order
- `PUT /order/:id` - Update order status

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook

### Feedback
- `GET /feedback` - Get feedback
- `POST /feedback` - Submit feedback
- `GET /Chart/feedback-stats` - Get feedback statistics

## 🤖 AI Sentiment Analysis

The platform includes a Python-based sentiment analysis system that automatically classifies customer feedback as positive, negative, or unknown.

### Features:
- **Preprocessing**: Text cleaning, tokenization, stemming
- **ML Model**: Trained classifier for sentiment prediction
- **Integration**: Seamless integration with Node.js backend
- **Real-time**: Automatic sentiment classification on feedback submission

### Usage:
```python
from helper import predict_sentiment

result = predict_sentiment("I love this product!")
print(result)  # Output: "positive"
```

## 📊 Admin Dashboard

The admin dashboard provides comprehensive management capabilities:

- **User Management**: View and manage user accounts
- **Product Management**: Add, edit, delete products
- **Order Management**: Process and track orders
- **Feedback Analytics**: View sentiment analysis results
- **Payment Management**: Monitor transactions
- **Supplier Management**: Manage supplier communications
- **Raw Material Management**: Track inventory

## 🔐 Authentication & Authorization

- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and Customer roles
- **Protected Routes**: Route protection based on user roles
- **Password Security**: bcrypt hashing for passwords
- **Email Verification**: Account verification system

## 📧 Email System

- **Nodemailer Integration**: Automated email sending
- **Mailtrap Testing**: Email testing environment
- **Template System**: Reusable email templates
- **Notifications**: Order confirmations, password resets, etc.

## 💳 Payment Integration

- **Stripe Integration**: Secure payment processing
- **Webhook Handling**: Real-time payment status updates
- **Payment Intent**: Secure payment flow
- **Transaction Management**: Complete payment tracking

## 📱 Responsive Design

The frontend is built with mobile-first approach using Tailwind CSS:
- **Responsive Layout**: Works on all device sizes
- **Modern UI**: Clean and intuitive interface
- **Accessibility**: WCAG compliant design
- **Performance**: Optimized loading and rendering

## 🧪 Testing

### Backend Testing
```bash
cd BACKEND
npm test
```

### Frontend Testing
```bash
cd frontend
npm run lint
```

### Python Testing
```bash
cd python
python helper.py "Test feedback message"
```

## 📈 Performance Optimization

- **Image Optimization**: Compressed and optimized images
- **Lazy Loading**: Components loaded on demand
- **Caching**: Efficient data caching strategies
- **Bundle Optimization**: Vite build optimization

## 🚀 Deployment

### Backend Deployment
1. Set up production MongoDB
2. Configure environment variables
3. Deploy to cloud platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)

### Python Deployment
1. Install dependencies in production environment
2. Ensure model files are accessible
3. Configure Python service integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License - see the package.json files for details.

## 👥 Team

**ITP 207** - ITP Project Team

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a comprehensive e-commerce platform with AI integration, designed for educational and commercial purposes. Ensure all environment variables are properly configured before running the application.
