const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/blog", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
  const postSchema = new mongoose.Schema({
    title: String,
    content: String,
  });

  const Post = mongoose.model("Post", postSchema);

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));

  // Routes
  app.get("/", async (req, res) => {
    try {
      const posts = await Post.find();
      res.render("index.ejs", { posts });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/create", (req, res) => {
    res.render("create.ejs");
  });

  app.post("/create", async (req, res) => {
    const { title, content } = req.body;
    const post = new Post({ title, content });
    await post.save();
    res.redirect("/");
  });

  app.get("/update/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render("update.ejs", { post });
  });

  app.post("/update/:id", async (req, res) => {
    const { title, content } = req.body;
    await Post.findByIdAndUpdate(req.params.id, { title, content });
    res.redirect("/");
  });

  app.post("/delete/:id", async (req, res) => {
    try {
      await Post.findByIdAndDelete(req.params.id);
      res.redirect("/");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});
