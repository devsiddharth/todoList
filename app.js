//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://siddharthgoud02:Siddharthadmin@cluster0.sqpymcj.mongodb.net/todolistDB',{ useNewUrlParser: true });

const itemSchema ={
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "your todolist!"
});

const item2 = new Item({
  name: "Hit '+' button to add tasks to your todolist."
});

const item3 = new Item({
  name: "<--- hit this button to delete completed tasks in your todolist."
});

const defaultItems = [ item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", async function (req, res) {
  const Items = await Item.find({});

  if (!(await Item.exists())) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: Items });
  }
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});  
})

app.post("/", function(req, res){
  // *** Adding a New Item: ***
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();
 
  const item = new Item({
    name: itemName
  });
 
  if (listName === "Today"){
    // *** Save item to mongoose: ***
    item.save();
    // *** render item to home page: ***
    res.redirect("/");
  }
  else {
    List.findOne({name: listName})
    .then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {

  const listName = req.body.listName;
  const checkItemId = req.body.checkbox;

  if (listName == "Today") {
    deleteCheckedItem();
  } else {

    deleteCustomItem();
  }

  async function deleteCheckedItem() {
    await Item.deleteOne({ _id: checkItemId });
    res.redirect("/");
  }

  async function deleteCustomItem() {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkItemId } } }
    );
    res.redirect("/" + listName);
  }
});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});




  // Item.find({})
  // .then((Items) => {
  //   res.render("list", {listTitle: "Today", newListItems: Items});
  // })
  // .catch((err) => {
  //   console.log('Error');
  // })
