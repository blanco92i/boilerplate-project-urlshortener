require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const mongoose  = require('mongoose');
const asyncHandler = require('express-async-handler')
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// Basic Configuration
const port = process.env.PORT || 3000;

let mongodbUri = process.env.MONGODB_URI;

//connexion à la base de donné
const connectDb = async()=>{
  try {
    await mongoose.connect(mongodbUri)
    console.log('MongoDb connected succesfuly')
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

connectDb();
// mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true })

//model de url
const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true }
});

let Url = mongoose.model('Url',urlSchema)



app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));


app.use((req,res,next)=>{
  console.log(
    `${req.method} ${req.path} - ${req.ip}`
  )
  next()
})

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Route GET pour rediriger vers l'URL d'origine
app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortUrl = req.params.short_url;

  try {
    const data = await Url.findOne({ short_url: shortUrl });
    if (!data) {
      return res.json({ error: 'No short URL found for the given input' });
    }
    res.redirect(data.original_url);
  } catch (err) {
    res.json({ error: 'Server error' });
  }
});

// app.post('/api/shorturl', async(req,res)=>{
//   let originalUrl = req.body.url;
//   const urlRegex = /^(http|https):\/\/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}.*$/;

//   // Vérifie si l'URL est dans un format valide
//   if (!urlRegex.test(originalUrl)) {
//     return res.json({ error: 'invalid url' });
//   }

//   // Valider l'URL avec un format http://www.example.com
//   const urlObject = urlParser.parse(originalUrl);
//   dns.lookup(urlObject.hostname, async (err) => {
//     if (err) {
//       return res.json({ error: 'invalid url' });
//     } else {
//       try {
//         const count = await Url.countDocuments({});
//         const newUrl = new Url({
//           original_url: originalUrl,
//           short_url: count + 1
//         });

//         const data = await newUrl.save();
//         res.json({ original_url: data.original_url, short_url: data.short_url });
//       } catch (error) {
//         res.json({ error: 'Server error' });
//       }
//     }
//   });
// });


// Your first API endpoint


// app.post('/api/shorturl', async (req, res) => {
//   let originalUrl = req.body.url;

//   try {
//     const urlRegex = /^(http|https):\/\/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}.*$/;

//     // Vérifie si l'URL est dans un format valide
//     if (!urlRegex.test(originalUrl)) {
//       return res.json({ error: 'invalid url' });
//     }
//     // Vérifie si l'URL existe déjà dans la base de données
//     let foundUrl = await Url.findOne({ original_url: originalUrl });
//     if (foundUrl) {
//       return res.json({ original_url: foundUrl.original_url, short_url: foundUrl.short_url });
//     }

//     // Crée une nouvelle URL si elle n'existe pas
//     const count = await Url.countDocuments({});
//     const newUrl = new Url({
//       original_url: originalUrl,
//       short_url: count + 1
//     });

//     const data = await newUrl.save();
//     res.json({ original_url: data.original_url, short_url: data.short_url });
//   } catch (error) {
//     res.json({ error: 'Server error' });
//   }
// });

app.post('/api/shorturl', async (req, res) => {
  const originalUrl =req.body.url;

  const urlRegex = /^(http|https):\/\/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}.*$/;

  //Vérifie si l'URL est dans un format valide
  if (!urlRegex.test(originalUrl)) {
       return res.json({ error: 'invalid url' });
  }

  
  const urlObject = urlParser.parse(originalUrl);
  dns.lookup(urlObject.hostname, async (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      try {
        const count = await Url.countDocuments({});
        const newUrl = new Url({
          original_url: originalUrl,
          short_url: count + 1
        });

        const data = await newUrl.save();
        res.json({ original_url: data.original_url, short_url: data.short_url });
      } catch (error) {
        res.json({ error: 'Server error' });
      }
    }
  });
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

exports.personModel = Url;