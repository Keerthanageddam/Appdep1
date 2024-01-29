const mongoose = require("mongoose");
const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });


const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use("/uploads",express.static("uploads"))

let connectToDB = async () => {
  try {
    mongoose.connect(
      "mongodb+srv://gaddamkeerthana2019:Keerthana123@cluster0.zfa5hxi.mongodb.net/UsersData?retryWrites=true&w=majority"
    );
    console.log("successfully connect to MDB");
  } catch (err) {
    console.log("Unable to connect to MDB");
    console.log(err);
  }
};

app.post("/signup", upload.array("profilePic"), async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  let userArr = await User.find().and({ email: req.body.email });

  if (userArr.length > 0) {
    res.json({ status: "failure", msg: "user already exist." });
  } else {
    try {
      let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        password: req.body.password,
        country: req.body.country,
        profilePic: req.files[0].path,
      });

      await newUser.save();
      res.json({ status: "success", msg: "user created successfully" });
    } catch (err) {
      res.json({ status: "failure", err: err});
    }
  }
});

app.delete("/deleteProfile",async(req,res)=>{
  console.log(req.query.email);
  try{
    await User.deleteMany({email:req.query.email});
  res.json({ status:"success",msg:"User deleted successfully"});
  }catch(err){

    res.json({ status:"failure",msg:"unable to delete profile"})
  }

    
})

app.post("/login", upload.none(), async (req, res) => {
  console.log(req.body);
  let fetchedData = await User.find().and({ email: req.body.email });

  if (fetchedData.length > 0) {
    if (fetchedData[0].password == req.body.password) {

      let dataToSend ={
        firstName:fetchedData[0].firstName,
        lastName:fetchedData[0].lastName,
        email:fetchedData[0].email,
        gender:fetchedData[0].gender,
        dateOfBirth:fetchedData[0].dateOfBirth,
        country:fetchedData[0].country,
        profilePic:fetchedData[0].profilePic,
      }
      // let dataToSend = {...fetchedData[0]};
      // delete dataToSend["password"]
    console.log(dataToSend);

 res.json({ status: "success", data:dataToSend });
    } else {
      res.json({ status: "failure", msg: "Invalid Password" });
    }
  } else {
    res.json({ status: "failure", msg: "User doesnot exist" });
  }
});

app.put("/updateProfile",upload.single("profilePic"),async(req,res)=>{
  console.log(req.body);

  console.log(req.file);

try{
  if(req.body.firstName.length>0){
    await User.updateMany(
      {email:req.body.email},
      {firstName:req.body.firstName});
  }
  if(req.body.lastName.length>0){
    await User.updateMany(
      {email:req.body.email},
      {lastName:req.body.lastName});
  }
  if(req.body.gender.length>0){
    await User.updateMany(
      {email:req.body.email},
      {gender:req.body.gender});
  }
  if(req.body.password.length>0){
    await User.updateMany(
      {email:req.body.email},
      {password:req.body.password});
  }
  if(req.file && req.file.path){
    await userSchema.updateMany({email:req.body.email})
    {profilePic:req.file.path}
  };
  res.json({status:"success",msg:"user details updated successfully"});


}catch(err){
  res.json({status:"failure",msg:"something went wrong",err:err});
}

});


  

app.listen(4567, () => {
  console.log("Listening to port 4567");
});

let userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  gender: String,
  dateOfBirth:String,
  password: String,
  country: String,
  profilePic: String,
});
let User = new mongoose.model("user", userSchema);

connectToDB();
