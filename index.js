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

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('MicroCenter').collection('items');
        const reviewCollection = await client.db('MicroCenter').collection('reviews');
        const userCollection = await client.db('MicroCenter').collection('users');
        const orderCollection = await client.db('MicroCenter').collection('orders');
        const profileCollection = await client.db('MicroCenter').collection('profiles');
        const paymentCollection = await client.db('MicroCenter').collection('payments');





        //payment-intent
        app.post('/create-payment-intent', async (req, res) => {
            const service = req.body;
            const price = service.totalPrice;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({ clientSecret: paymentIntent.client_secret })
        });

        // product
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });
        //add product
        app.post('/items', async (req, res) => {
            const newItem = req.body;
            const result = await itemCollection.insertOne(newItem);
            res.send(result);
        });

        // update product
        app.put('/items/:id', async (req, res) => {
            const id = req.params;
            const updateItem = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateItem.quantity
                }
            };
            const result = await itemCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });
        //get product by id
        app.get('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.findOne(query);
            res.send(result);
        });
        //delete product by id
        app.delete('/items/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        });
        //get products by name
        app.get('/product', async (req, res) => {
            const name = req.query.name;
            const query = { name: name };
            const tasks = await itemCollection.find(query).toArray();
            console.log(tasks);
            res.send(tasks);
        })
        //get order by email
        app.get('/individual', async (req, res) => {
            const email = req.query.email;

            const query = { email: email }
            const tasks = await orderCollection.find(query).toArray();
            res.send(tasks);
        })
        //allreviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        //add reviews
        app.post('/reviews', async (req, res) => {
            const newItem = req.body;
            const result = await reviewCollection.insertOne(newItem);
            res.send(result);
        });
        app.get('/users', async (req, res) => {
            const users = await userCollection.find().toArray()
            res.send(users)
        })
        //user put
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
            res.send({ result });
        })
        //admin check
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })
        //admin user
        app.put('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const requesterAccount = await userCollection.findOne({ email: email })
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);

                res.send(result);
            } else {
                res.status(403).send({ message: 'forbidden' })
            }

        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = userCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        //getOrders
        app.get('/orders', async (req, res) => {
            const query = {};

            const cursor = orderCollection.find(query);
            const order = await cursor.toArray();
            res.send(order);
        });


        //postOrders
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.send(result);
        });

        //order delete
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        });
        // order by id get
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.findOne(query);
            res.send(result);
        });
        //update order
        app.patch('/ordered/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }

            const result = await paymentCollection.insertOne(payment);
            const updatedBooking = await orderCollection.updateOne(filter, updatedDoc);
            res.send(updatedBooking, result);
        })

        //profile 
        app.get('/profile', async (req, res) => {
            const query = {};
            const cursor = profileCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });


        app.put('/profile/:id', async (req, res) => {
            const id = req.params
            const updatedProfile = req.body;
            console.log(updatedProfile);

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: updatedProfile
            };
            const result = await updatedProfile.updateOne(
                filter,
                updateDoc,
                options
            );
            console.log(result);
            res.send(result);
        });
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

