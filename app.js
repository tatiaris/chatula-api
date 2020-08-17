require("dotenv").config();
const mongo = require("mongodb");
let express = require("express");
const bodyParser = require("body-parser");
let cors = require("cors");
let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const mongo_url = process.env.MONGODB_URL;
const mongo_db = process.env.DB_NAME;
const mongo_collection = process.env.COLLECTION_NAME;
const port = 2020;

const add_message = async (o_url, o_user, o_message) => {
  mongo.connect(
    mongo_url,
    { useUnifiedTopology: true, useNewUrlParser: true },
    (err, db) => {
      if (err) {
        console.log(err);
        process.exit(0);
      }
      let data = [
        {
          url: o_url,
          username: o_user,
          message: o_message,
        },
      ];
      let dbo = db.db(mongo_db);
      let collection = dbo.collection(mongo_collection);
      collection.insertMany(data, (err, result) => {
        if (err) {
          console.log(err);
          process.exit(0);
        }
        console.log("data added");
        db.close();
      });
    }
  );
};

const get_messages = (o_url) => {
  return new Promise((resolve) => {
    mongo.connect(
      mongo_url,
      { useUnifiedTopology: true, useNewUrlParser: true },
      (err, db) => {
        if (err) {
          console.log(err);
          process.exit(0);
        }
        var dbo = db.db(mongo_db);
        var collection = dbo.collection(mongo_collection);
        collection.find({ url: o_url }).toArray((err, results) => {
          if (err) {
            console.log(err);
            process.exit(0);
          }
          db.close();
          resolve(results);
        });
      }
    );
  });
};

app.get("/", (req, res) => {
  res.send("ChatulaAPI running");
});

app.get("/messages", async (request, response) => {
  console.log("getting messages for", request.query.url);
  const message_list = await get_messages(request.query.url.toString());
  response.writeHead(200, { "Content-Type": "application/json" });
  response.write(JSON.stringify(message_list));
  response.end();
});

app.post("/newmessage", (req, res) => {
  add_message(req.body.url, req.body.username, req.body.message)
  res.set("Content-Type", "text/plain");
  res.send(`message added`);
});

app.listen(port, () => {
  console.log(`ChatulaAPI listening at http://localhost:${port}`);
});
