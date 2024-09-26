const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());
app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const exerciseSchema = new mongoose.Schema({
  description: { type: String },
  duration: { type: Number },
  date: { type: String, default: () => new Date().toISOString().slice(0, 10) } 
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  exercises: [exerciseSchema] 
});

const User = mongoose.model('User', userSchema);

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });
  newUser.save();
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  try {
    const users = User.find({});
    res.json(users);
  } catch (err) {
    res.json({ error: 'Error fetching users' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
