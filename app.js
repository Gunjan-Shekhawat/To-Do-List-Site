
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

// in js , if we create const array then we r allowed to
// push new itmes in it but no assignment eg. arr = ['B'];
// can't change it to entirely different array.
const workitems=[];
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-gunjan:gunjan@45678@cluster0-gttif.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true})

const itemschema =  {
  name: String
}

const Item = mongoose.model("Item",itemschema);

const item1 = new Item ({
  name: "Buy Food"
})

const item2 = new Item ({
  name: "Cook Food"
})

const item3 = new Item ({
  name: "Eat Food"
})

const defaultitems = [item1,item2,item3];

const listschema = {
  name: String,
  items: [itemschema]
};

const List = mongoose.model("List",listschema);

app.get("/",function(req,res){

  Item.find({},function(err, founditems){
    // adding these items only when its initially empty
    if(founditems.length === 0){
      Item.insertMany(defaultitems,function(err){
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("No error !");
        }
      });
      // now as array has items , it will go to else part and render the items to
      // the website
      res.redirect("/");
    }
    else{
      res.render('list',{Listtitle:"Today", newlistitems : founditems});
    }

  })
  // res.render('list',{Listtitle:"Today", newlistitems : Item});
    // it then looks in views dir n search for an ejs file.
});

app.get("/:customlistname",function(req,res){
  const customlistname = _.capitalize(req.params.customlistname);
  List.findOne({name:customlistname},function(err,results){
    if(!err)
    {
      if(!results)
      {
        //creates a new list
        const list = new List({
        name: customlistname,
        items: defaultitems
      })
      list.save();
      res.redirect("/" + customlistname);
      }
      else{
        //show the existing list
        res.render("list",{Listtitle:results.name, newlistitems : results.items})
      }
    }
  })


})


app.post('/',function(req,res){
  const Itemname = req.body.newitem;
  const listname = req.body.list;
  // let item = req.body.newitem;
  // console.log(req.body);
  // if(req.body.list === "worklist")
  // {
  //   workitems.push(item);
  //   res.redirect("/work");
  // }
  // else{
  //   items.push(item);
  //   res.redirect("/");
  // }
  const item = new Item({
    name: Itemname
  })

  if(listname === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listname},function(err,results){
      results.items.push(item);
      results.save();
      res.redirect("/"+listname);
    })

  }

})

app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const listname = req.body.listname;

  if(listname=="Today")
  {
    Item.deleteMany({ _id: id }, function (err) {
    if(!err){
    console.log("Successful deletion");
    res.redirect("/");
  }
  });
  }
  else
  {
    List.findOneAndUpdate({name:listname},{$pull: {items: {_id:id}}},function(err,results){
      if(!err){
        res.redirect("/"+listname);
      }
    })
  }

})

app.get("/about",function(req,res){
  res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,()=>{
  console.log("Server running on port 3000");
})
