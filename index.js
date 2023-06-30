const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const port = process.env.PORT || 5000;
app.use(express.json({ limit: "100mb" }));

app.use(express.urlencoded({ limit: "100mb", extended: true }));

const mongoURI =
  "mongodb+srv://disojakaran:karan@cluster0.acj6arl.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

//   schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
  },
  confirmpassword: String,
  image: {
    type: String,
    limit: 1000000,
  },
});
const userModel = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// sign up
app.post("/signup", async (req, res) => {
  const { email } = req.body;
  try {
    const useremail = await userModel.findOne({ email: email });
    if (useremail) {
      res.send({ message: "Email already exists", alert: false });
    } else {
      const data = userModel(req.body);
      await data.save();
      res.send({ message: "Signup Successful", alert: true });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// api login
app.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      // TODO: Compare the provided password with the stored password hash
      // For example, you can use a library like bcrypt to compare passwords
      const passwordMatch = password === user.password;

      if (passwordMatch) {
        const datasend = {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
        };

        res.send({ message: "Login Successful", alert: true, data: datasend });
        console.log(user);
      } else {
        res.send({ message: "Invalid credentials", alert: false });
      }
    } else {
      res.send({ message: "User not found", alert: false });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// product section

const schemaProduct = new mongoose.Schema({
  name: String,
  price: String,
  image: {
    type: String,
    limit: 1000000,
  },
  description: String,
  category: String,
});
const productModel = mongoose.model("Product", schemaProduct);

// upload product

app.post("/uploadProduct", async (req, res) => {
  try {
    const product = new productModel(req.body);
    await product.save();
    res.send({ message: "Product Added Successfully", alert: true });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// get produts
app.get("/product", async (req, res) => {
  try {
    const products = await productModel.find();
    res.send(products);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
