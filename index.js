const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const uri = `mongodb+srv://dentalsolutionuser:S9naNqBMsk5tcUEf@cluster0.n6je5.mongodb.net/dental-solution?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("doctors"));
app.use(fileUpload());

const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});
console.log(process.env.DB_NAME);

client.connect((err) => {
  const availableAppCollection = client
    .db("dental-solution")
    .collection("availableAppointments");
  const bookedAppCollection = client
    .db("dental-solution")
    .collection("bookedAppointments");

  // Available appointments processes
  app.post("/addAvailableApp", (req, res) => {
    const availableApp = req.body;
    availableAppCollection
      .insertOne(availableApp)
      .then((result) => res.send(result.insertedCount > 0));
  });

  app.get("/getAvailableAppsByDate/:date", (req, res) => {
    const availableAppDate = new Date(req.params.date).toISOString();
    console.log(availableAppDate, typeof availableAppDate);
    availableAppCollection
      .find({ date: availableAppDate })
      .toArray((err, docs) => {
        res.send(docs);
      });
  });

  // Booked appointments processes
  app.post("/addBookedApp", (req, res) => {
    bookedAppCollection.insertOne(req.body).then((result) => {
      if (result.insertedCount > 0) {
        res.status(200).send(result.insertedCount > 0);
      } else {
        res.sendStatus(404);
      }
    });
  });

  app.get("/getBookedAppsByDate/:date", (req, res) => {
    const bookedAppsDate = new Date(req.params.date).toISOString();
    bookedAppCollection
      .find({ appointmentDate: bookedAppsDate })
      .project({ name: 1, schedule: 1, status: 1 })
      .toArray((err, docs) => {
        console.log(docs);
        res.send(docs);
      });
  });

  // Doctors Collection
  app.post("/addADoctor", (req, res) => {
    const file = req.files.image;
    const name = req.body.name;
    const email = req.body.email;
    console.log(name, email, file);
    file.mv(
      `${__dirname}/doctors/${new Date().getTime()}${file.name}`,
      (err) => {
        if (err) {
          console.log(err);
          return res.sendStatus(400).send({ msg: "Failed to save file" });
        }
        return res.send({ name: file.name, path: `/${file.name}` });
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
