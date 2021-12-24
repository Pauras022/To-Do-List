const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://pauras22:host123@cluster0.v1nol.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true });

const itemSchema = {
    name: String,
}

const Item = mongoose.model("Item", itemSchema);

const listSchema = {
    name: String,
    items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

const item1 = new Item({
    name: "Welcome to your todo list!"
})

const item2 = new Item({
    name: "Hit the + buttton to add a new item"
})

const item3 = new Item({
    name: "<-- Hit this check-box to delete a item"
})
const defItems = [item1, item2, item3];
const day = date.getDate();

app.get('/', function (req, res) {
    Item.find({}, function (err, results) {
        if (results.length == 0) {
            Item.insertMany(defItems, function (err) {
                res.render("list", { listTitle: day, newItems: defItems });
            })
        } else {
            res.render("list", { listTitle: day, newItems: results });
        }
    })
})

app.get("/:listName", function (req, res) {
    const customListName = _.capitalize(req.params.listName);
    List.findOne({ name: customListName }, function (err, result) {
        console.log(result);
        if (result!=null) {
            if(result.items.length==0){
                result.items=result.items.concat(defItems);
                result.save();
            }
                res.render("list", { listTitle: result.name, newItems: result.items });
        } else {
            const list = new List({
                name: customListName,
                items: defItems,
            })
            list.save();
            res.redirect("/"+customListName);
        }
    })
})

app.post("/", function (req, res) {

    var todoitem = req.body.new;
    console.log(req.body);
    const listName = req.body.list;
    const newitem = new Item({
        name: todoitem,
    })
    if (listName == "Friday," || listName == "Saturday," || listName == "Sunday," || listName == "Monday," || listName == "Tuesday," || listName == "Wednesday," || listName == "Thursday,"  ) {
        newitem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(newitem);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})

app.post("/delete", function (req, res) {
    const listName = req.body.listName;
    if (listName == "Friday," || listName == "Saturday," || listName == "Sunday," || listName == "Monday," || listName == "Tuesday," || listName == "Wednesday," || listName == "Thursday,"  ) {
        Item.deleteOne({ _id: req.body.checkbox }, function (err) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: req.body.checkbox } } }, function (err, result) {
            if (!err) {
                res.redirect("/" + listName);
            }else{
                console.log(err);
            }
        })
    }
})

app.listen(3000, function () {
    console.log("server is up")
})