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

    // Warning: This is not the proper way to query multiple collection. 
    // After learning more about mongodb. use aggregate, lookup, pipeline, match, group
    app.get('/available', async(req, res) =>{
        const date = req.query.date;
  
        // step 1:  get all services
        const services = await serviceCollection.find().toArray();
  
        // step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
        const query = {date: date};
        const bookings = await bookingCollection.find(query).toArray();
  
        // step 3: for each service
        services.forEach(service=>{
          // step 4: find bookings for that service. output: [{}, {}, {}, {}]
          const serviceBookings = bookings.filter(book => book.treatment === service.name);
          // step 5: select slots for the service Bookings: ['', '', '', '']
          const bookedSlots = serviceBookings.map(book => book.slot);
          // step 6: select those slots that are not in bookedSlots
          const available = service.slots.filter(slot => !bookedSlots.includes(slot));
          //step 7: set available to slots to make it easier 
          service.slots = available;
        });
       
  
        res.send(services);
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