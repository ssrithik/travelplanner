require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true, // or specify your frontend origin
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.static(path.join(__dirname, '../frontend')));

mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('✅ Connected to MongoDB Atlas (Database: travel)'))
  .catch((error) => console.error('❌ Error connecting to MongoDB:', error));



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('login', userSchema);



const bookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  destination: { type: String, required: true },
  travelerName: { type: String, required: true },
  departureDate: { type: String },
  returnDate: { type: String },
  numTravelers: { type: Number, required: true },
  accommodationType: { type: String },
  flightDetails: {
    airline: String,
    flightNumber: String,
    departure: String,
    arrival: String,
    duration: String
  },
  pricing: {
    basePrice: Number,
    accommodationPrice: Number,
    activitiesCost: Number,
    flightCost: Number,
    totalAmount: Number
  },
  paymentInfo: {
    transactionId: String,
    paymentMethod: String,
    paymentDate: String,
    paymentStatus: String
  }
});
const Booking = mongoose.model('Booking', bookingSchema);

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long, with one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Account already exists! Login to continue...', error });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      req.session.user = { username: user.username, email: user.email };
      
      
      const redirect = req.query.redirect;
      if (redirect) {
        return res.status(200).json({ 
          message: 'Login successful', 
          username: user.username,
          redirect: `/${redirect}`
        });
      }
      
      res.status(200).json({ message: 'Login successful', username: user.username });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login', error });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
});
app.get('/api/auth/status', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ 
      loggedIn: true, 
      username: req.session.user.username,
      email: req.session.user.email
    });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});

app.post('/api/bookings', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'User not logged in' });
  }

  const {
    bookingReference,
    destination,
    travelerName,
    departureDate,
    returnDate,
    numTravelers,
    accommodationType,
    flightDetails,
    pricing,
    paymentInfo
  } = req.body;
  const existingBooking = await Booking.findOne({ bookingReference });
  if (existingBooking) {
    return res.status(200).json({ message: 'Booking already exists' });
  }
  if (!bookingReference || !destination || !travelerName || !numTravelers || !pricing || !paymentInfo) {
    return res.status(400).json({ message: 'Missing required booking details' });
  }

  try {
    const newBooking = new Booking({
      bookingReference,
      userEmail: req.session.user.email,
      destination,
      travelerName,
      departureDate,
      returnDate,
      numTravelers,
      accommodationType,
      flightDetails,
      pricing,
      paymentInfo
    });

    await newBooking.save();
    res.status(201).json({ message: '✅ Booking stored successfully' });
  } catch (error) {
    res.status(500).json({ message: '❌ Error storing booking', error });
  }
});





app.get('/destinations', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/explore.html'));
});
app.get('/payment-success', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/paymentsuccessful.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
