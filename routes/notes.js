const express = require("express");
const fetchuser = require("../middleware/fetchUser");
const router = express.Router();
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//Route 1: Get all the notes using: GET: "api/auth/getuser" . Login Required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
});
//Route 2: Add a new note using: POST: "api/auth/getuser" . Login Required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const { title, description, tag } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
    const note = await new Notes({ title, description, tag, user: req.user.id });
    let savednote= await note.save();
    res.json(savednote);
  }

catch (error){

    console.error(error.message);
    res.status(500).send("Some error Occured");
}


  });
// Route 4: Update an existing not PUT: "api/auth/getuser" . Login Required

router.put(
    "/updatenote/:id",
    fetchuser,
    async (req, res) => {

        const {title, description,tag}=req.body;
        try{
        const newNote={};
        if (title){
            newNote.title=title;
        };
        if (description){
            newNote.description=description;
        };
        if (tag){
            newNote.tag=tag;
        };

        var note=await Notes.findById(req.params.id);
        if (!note){
            return res.status(404).send("Not Found");
        }
        if ( note.user.toString()!= req.user.id ){
            return res.status(401).send("No Allowed");
        }
        note=await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
        return res.json(note);
    }
    catch (error){

        console.error(error.message);
        return res.status(500).send("Some error Occured");
    }




    });

    // Route 5: Deleting an existing not DELETE: "api/auth/getuser" . Login Required

router.delete(
    "/deletenote/:id",
    fetchuser,
    async (req, res) => {

        try{
        

        var note=await Notes.findById(req.params.id);
        if (!note){
            return res.status(404).send("Not Found");
        }
        if ( note.user.toString()!= req.user.id ){
            return res.status(401).send("No Allowed");
        }
        note=await Notes.findByIdAndDelete(req.params.id);
        return res.json({Success:"The note has been deleted",note: note});
    }
    catch (error){

        console.error(error.message);
        res.status(500).send("Some error Occured");
    }




    });


module.exports = router;
