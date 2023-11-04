import express from "express";
import blogModel from "../schema/Blog.js";

const BlogRouter = express.Router();

BlogRouter.post("/save", (req, res) => {
  if (req.body.title == "" || req.body.title == null) {
    return res.json({ message: "Title is requried", success: false });
  }
  const newBlog = new blogModel({
    ...req.body,
    createdBy: req.auth._id,
    username: req.auth.firstName,
  });

  newBlog.save();
  return res.json({
    message: "message received successfully",
    id: newBlog._id.toHexString(),
    success: true,
  });
});

BlogRouter.get("/all", async (req, res) => {
  try {
    const blog = await blogModel.find({});
    if (blog) {
      return res.json({ success: true, data: blog });
    }
    return res.json({ success: false, message: "No blogs found" });
  } catch (error) {
    console.log("error in getting all the blogs");
    return res.json({ success: false, message: error.message });
  }
});
BlogRouter.get("/find/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const blog = await blogModel.findById(id);
    if (blog) {
      return res.json({ success: true, data: blog });
    }
    return res.json({
      success: false,
      message: "No blog found with an id:" + id,
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
});

BlogRouter.get("/search/:query", async (req, res) => {
  const query = req.params.query;
  console.log(query);
  try {
    const listOfBlogs = await blogModel.find({
      title: { $regex: new RegExp(query, "i") },
    });
    return res.status(200).json({ success: true, data: listOfBlogs });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

BlogRouter.get("/hastag/:hastag", async (req, res) => {
  const hastag = req.params.hastag;
  console.log(hastag);
  try {
    const listOfBlogs = await blogModel.find({
      hastags: { $elemMatch: { $regex: new RegExp(hastag, "i") } },
    });
    return res.status(200).json({ success: true, data: listOfBlogs });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
});

export default BlogRouter;
