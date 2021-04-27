const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const e = require("express");
// const date = require(__dirname  + "/date.js");

// console.log(date());

const app = express();

mongoose.connect("mongodb://localhost:27017/dolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({ name: "Milan World" });
const item2 = new Item({ name: "Hello World" });
const item3 = new Item({ name: "MongoDB" });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems, function (error, docs) {});
// Item.deleteMany({ defaultItems });

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (error, docs) {});
      res.redirect("/");
    } else {
      res.render("list", { ListTitle: "Today", newlistItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function (err) {});
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          ListTitle: foundList.name,
          newlistItems: foundList.items,
        });
      }
    }
  });
});

// app.get("/work", function (req, res) {
//   res.render("list", { ListTitle: "Work List", newlistItems: workItem });
// });

// app.post("/work",function(req,res){
//     let item = req.body.newItem;
//     workItem.push(item);
//     res.redirect("/work");
// });

app.listen(3000, function () {
  console.log("Server Start");
});
