
const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

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
      match: [/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"]
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^(?:\+91[\s-]?)?[6-9]\d{9}$/, "Please enter a valid Indian phone number"]
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
