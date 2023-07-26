const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

//connect to db
mongoose.connect("mongodb+srv://masonnguyen:admin123@cluster0.rfzftpg.mongodb.net/todoListDB");

//Create a new schema
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

//create a new model
const Item = mongoose.model("Item", itemSchema);

//create some sample document
const item1 = new Item({
    name: "Do homework",
});

const item2 = new Item({
    name: "Do excersise",
});

const item3 = new Item({
    name: "Commute to work",
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

Item.find({}).then(result => {
    if(result.length === 0) {

    }
})

//must write this line of code under const app = express()
app.set("view engine", "ejs");
const port = 3000;

app.use(bodyParser.urlencoded ({extended: true}));
app.use(express.static("public"))

app.get("/", function(req,res) {
    Item.find({}).then(result => {
        res.render("list", {
            listTitle: "Today",
            newListItem: result,
        });
        console.log("Successfully get data");
    }).catch(err => {
        console.log(err);
    })
});

app.post("/", function(req,res) {
    const listTitle = req.body.list;
    itemName = req.body.newItem;
    const item = new Item({
        name: itemName
    });

    if(listTitle === "Today") {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({name: listTitle}).then(result => {
            result.items.push(item);
            result.save();
            res.redirect("/" + listTitle);
        }).catch(err => {
            console.log(err);
        });
        
    }
    
});

app.post("/delete", function(req,res) {
    const id = req.body.checkbox;
    const listTitle = req.body.listName;
    console.log(listTitle);
    if(listTitle === "Today") {
        Item.deleteOne({_id: id}).then(() => {
            console.log("Successfully deleted the item.");
            res.redirect("/");
        }).catch(err => {
            console.log(err);
        });
    } else {
        List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: id}}}).then(() => {
            res.redirect("/" + listTitle);
        }).catch(err => {
            console.log(err);
        });
    }
});

app.get("/:customListName",function(req,res) {
    const customListName = _.lowerCase(req.params.customListName);
    List.findOne({name:customListName}).then(result => {
        if(!result) {
            const list = new List({
                name: req.params.customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        } else {
            res.render("list", {
                listTitle: result.name,
                newListItem: result.items,
            });
        }
    }).catch(err => {
        console.log(err);
    });
})

app.get("/about", function(req,res) {
    res.render("about");
})

app.listen(port, function() {
    console.log("Server is running on port: ", port);
});


