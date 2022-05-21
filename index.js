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

