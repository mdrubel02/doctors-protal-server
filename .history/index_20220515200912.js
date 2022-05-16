const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT||5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lz1v7.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){

    try{
        await client.connect();
        console.log('database connect');
        const serviceCollection = client.db('doctors_protal').collection('services');
        const bookingCollection = client.db('doctors_protal').collection('bookings');

        app.get('/service', async(req,res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services =await cursor.toArray();
            res.send(services)
        })




        app.post('/booking', async (req,res)=>{
            const booking = req.body;
            const query = {treatment:booking.treatment, date:booking.date,patient:booking.patient}
            const exists = await bookingCollection.findOne(query)
            if(exists){
                return res.send({success:false, booking:exists})
            }
            const result =await bookingCollection.insertOne(booking)
            return res.send({success: true, result});
        })
    }
    finally{}
}
run();

app.get('/',(req,res)=>{
    res.send('hello world')
});

app.listen(port,()=>{
    console.log(`this port running ${port}`);
});