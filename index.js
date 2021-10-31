const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o4muq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travel-to-paradise');
        const serviceCollection = database.collection('services');
        const orderCollection = database.collection('orders');

        // Get api
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();

            res.send(services);
        });

        // Post services

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        });

        // Post orders

        app.post('/myOrders', async (req, res) => {
            const addOrder = req.body;

            const order = await orderCollection.insertOne(addOrder);
            res.json(addOrder)
        });

        // Get api
        app.get('/myOrders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();

            res.send(orders);
        });

        // Delete Order
        app.delete('/myOrders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            console.log(result)
            res.send(result)
        })

        // Update order status
        app.put('/myOrders/:id', async (req, res) => {
            const id = req.params.id;

            const query = { _id: ObjectId(id) };

            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'approved'
                },
            };
            const result = await orderCollection.updateOne(query, updateDoc, options);
            console.log(result);

            res.send(result)
        })

    }
    finally {
        // await client.close();
    }
};
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Welcome to TRAVEL TO PARADISE server');
});
app.listen(port, () => {
    console.log('Listening port', port);
});


