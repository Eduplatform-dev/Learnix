import express from "express";

import {
getAssignments,
getAssignmentById,
createAssignment,
updateAssignment,
deleteAssignment
} from "../controllers/assignmentController.js";

import {
authenticateToken,
authorize
} from "../middleware/auth.js";

const router = express.Router();


router.get(
"/",
authenticateToken,
getAssignments
);


router.get(
"/:id",
authenticateToken,
getAssignmentById
);


router.post(
"/",
authenticateToken,
createAssignment
);


router.put(
"/:id",
authenticateToken,
updateAssignment
);


router.delete(
"/:id",
authenticateToken,
authorize(["admin"]),
deleteAssignment
);

export default router;