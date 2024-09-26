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
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, default: () => new Date().toISOString().slice(0, 10) } 
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  count: { type: Number, default: 0 },
  log: [exerciseSchema] 
});

const User = mongoose.model('User', userSchema);


app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });
  newUser.save();
  res.json(newUser);
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).select('username _id');
    res.json(users);
  } catch (err) {
    res.json({ error: 'Error fetching users' });
  }
});

app.post('/api/users/:id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params.id;

  if (!description || !duration) {
    return res.status(400).json({ error: 'Description and duration are required' });
  }

  const durationNumber = Number(duration);
  if (isNaN(durationNumber)) {
    return res.status(400).json({ error: 'Duration must be a number' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ error: 'User not found' });
    }

    const exercise = {
      description, 
      duration: durationNumber,
      date: date ? new Date(date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    };

    user.log.push(exercise);
    user.count += 1; 
    user.save();

    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
      _id : user.id 
    });
  } catch (err) {
    res.json({ error: "Error adding exercise"})
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
