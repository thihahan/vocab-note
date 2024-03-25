require("dotenv").config()
const { MongoClient, ObjectId } = require("mongodb")
const mongo_url = process.env.DATABASE_URL ?? "mongodb://localhost"
const mongo = new MongoClient(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true })
const vocabsDB = mongo.db("vocabs")
async function addSlug(){
    try{
        const vocabs = await vocabsDB.collection("words").find({}).toArray()
        const result = vocabs.map(vocab => {
            vocab.slug = vocab.keyword.replaceAll(" ", "-").toLowerCase()
            return vocab 
        })
        await vocabsDB.collection("words").deleteMany({})
        await vocabsDB.collection("words").insertMany(result)
    }catch (e){
        console.log(e);
        process.exit(0)
    }finally{
        console.log("seeding done");
    }
}

async function run(){
    await addSlug()
}

run()