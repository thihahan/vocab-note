require("dotenv").config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const {MongoClient, ObjectId, TopologyClosedEvent} = require("mongodb")
const mongo_url = process.env.DATABASE_URL ?? "mongodb://localhost"
const mongo = new MongoClient(mongo_url, { useNewUrlParser: true, useUnifiedTopology: true })
const socialDB = mongo.db("vocabs")
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())
app.use(cors())

app.get("/mongo-url", async (req, res) => {
    console.log("from env",process.env.DATABASE_URL);
    console.log("mongo_url :",process.env.DATABASE_URL);
    return res.json({msg : "hey this is url localhost:1000000"})
})

app.get("/words", async (req, res) => {
    try{
        const words = await socialDB.collection("words").find({})
        .sort({_id : -1})
        .project({detail : 0, note : 0, examples : 0})
        .toArray()
        return res.json(words)
    }catch (e){
        console.log(e);
        return res.json(e).status(500)
    }
})

app.get("/words/:slug", async (req, res) => {
    try{
        const {slug} = req.params
        const word = await socialDB.collection("words").findOne({slug})
        if(word){
            return res.json(word)
        }
        return res.status(404).json({msg : "keyword not found"})
    }catch (e){
        console.log(e);
        return res.json(e).status(500)
    }
})

app.get("/words/filter/:key", async (req, res) => {
    try{
        const {key} = req.params
        const regexPattern = new RegExp(key, 'i');
        const words = await socialDB.collection("words").find(
            {
                keyword : {$regex : regexPattern}
            }
        )
        .project({detail : 0, note : 0, examples : 0})
        .toArray()
        return res.json(words)
    }catch (e){
        console.log(e);
        return res.json(e).status(500)
    }
})

app.post("/words", async (req, res) => {
    try{
        const {keyword, shortExp} = req.body 
        if(!keyword && !shortExp){
            return res.status(403).json({msg : "keyword & shortExp required"})
        }
        const data = req.body 
        const _id = (await socialDB.collection("words").insertOne(data)).insertedId
        const result = {_id, ...data}
        return res.json(result)
    }catch (e){
        console.log(e);
        return res.json(e).status(500)
    }
})

// delete word 
app.delete("/words/:id", async (req, res) => {
    try{
        const { id } = req.params 
        if(!ObjectId.isValid(id)){
            return res.status(400).json({msg : "invalid id"})
        }
        await socialDB.collection("words").deleteOne({_id : new ObjectId(id)})
        return res.status(204)
    }catch (e){
        res.status(500).json({msg : "something went wrong"})
    }
})

app.listen(5000,() => {
    console.log("app is listening at 5000");
})