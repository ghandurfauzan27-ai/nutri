const express = require("express");
const router = express.Router();
const childrenController = require("../controllers/childrenController");

router.get("/", childrenController.getAllChildren);
router.get("/:id", childrenController.getChildById);
router.post("/", childrenController.createChild);
router.put("/:id", childrenController.updateChild);
router.delete("/:id", childrenController.deleteChild);

module.exports = router;
