const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());


// connect to mongodb start
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cuqkp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// connect to mongodb end


async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('MicroCenter').collection('items');
        const reviewCollection = await client.db('MicroCenter').collection('reviews');
        const userCollection = await client.db('MicroCenter').collection('users');

        // Items
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item);
        });

        // Review
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // Users
        app.get('/users', async (req, res) => {
            const users = await userCollection.find().toArray()
            res.send(users)
        })

        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            // const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send(result);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = userCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        }); app.get('/users', async (req, res) => {
            const users = await userCollection.find().toArray()
            res.send(users)
        })
    }
    finally { }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Micro Center Server Running');
});

app.listen(port, () => {
    console.log('Listening to port', port);
})

