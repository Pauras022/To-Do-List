const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

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
        if (result) {
                res.render("list", { listTitle: result.name, newItems: result.items });
        } else {
            const list = new List({
                name: customListName,
                items: defItems,
            })
            list.save();
            res.render("list", { listTitle: list.name, newItems: list.items });
        }
    })
})

app.post("/", function (req, res) {

    var todoitem = req.body.new;
    const listName = req.body.list;
    const newitem = new Item({
        name: todoitem,
    })
    if (listName == day) {
        newitem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(newitem);
            foundList.save();
        })
        res.redirect("/" + listName);
    }
})

app.post("/delete", function (req, res) {
    const listName = req.body.listName;
    if (listName == day) {
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
            }
        })
    }
})

app.listen(3000, function () {
    console.log("server is up")
})