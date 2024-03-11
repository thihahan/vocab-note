require("dotenv").config()
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
const {MongoClient, ObjectId} = require("mongodb")
const mongo_url = process.env.DATABASE_URL ?? "mongodb://localhost"
const mongo = new MongoClient(mongo_url)
const socialDB = mongo.db("vocabs")
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())
app.use(cors())

app.get("/words", async (req, res) => {
    try{
        const words = await socialDB.collection("words").find({}).toArray()
        return res.json(words)
    }catch (e){
        console.log(e);
        return res.json(e).status(500)
    }
})

app.get("/words/:keyword", async (req, res) => {
    try{
        const {keyword} = req.params
        const word = await socialDB.collection("words").findOne({keyword})
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
        ).toArray()
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

app.listen(5000,() => {
    console.log("app is listening at 5000");
})