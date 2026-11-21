
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },

    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true
    },

    source: {
      type: String,
      required: [true, "Lead source is required"],
      enum: ["Website", "LinkedIn", "Referral", "Advertisement", "Other"]
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Lost"],
      default: "New"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
