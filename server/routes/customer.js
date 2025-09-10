import express from "express";
import {
  signupPersonalInfo,
  signupAddress,
  signupGuarantorsAndId,
  finalizeSignup
} from "../controllers/customerController.js";

const router = express.Router();

console.log("Customer router is being loaded...");

router.post("/sign-up/personal-info", signupPersonalInfo);
console.log("✅ Route registered: POST /sign-up/personal-info");

router.post("/sign-up/address", signupAddress);
console.log("✅ Route registered: POST /sign-up/address, handler:", typeof signupAddress);

router.post("/sign-up/guarantors-id", signupGuarantorsAndId);
console.log("✅ Route registered: POST /sign-up/guarantors-id");

router.post("/sign-up/finalize", finalizeSignup);
console.log("✅ Route registered: POST /sign-up/finalize");

export default router;
