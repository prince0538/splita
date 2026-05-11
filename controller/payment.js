const paymentModel = require("../models/payment");
const groupModel = require("../models/group");
const userModel = require("../models/user");
const otpGenerator = require("otp-generator");
const axios = require("axios");

exports.initailizePayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const group = await groupModel.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const member = group.members.find((member) => member.toString() === userId);

    if (!member) {
      return res.status(404).json({
        message: "User is not a member of this group",
      });
    }
    
    const ref = otpGenerator.generate(12, {
      upperCaseAlphabets: true,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: true,
    });

    const reference = `TCA-Splita-${ref}`;
    const paymentData = {
      amount: Number(group.contributionAmount),
      currency: "NGN",
      reference,
      customer: {
        email: user.email,
        name: user.fullname,
      },
      redirect_url: "https://www.google.com/",
    };

    const response = await axios.post(
      "https://api.korapay.com/merchant/api/v1/charges/initialize",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_API_KEY}`,
        },
      },
    );
    const payment = await paymentModel.create({
      amount: paymentData.amount,
      reference,
      userId,
      groupId,
      groupName: group.groupName,
    });

    await payment.save();

    res.status(200).json({
      message: "Payment initialized successfully",
      data: response.data?.data,
      payment,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "Failed to initialize payment",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    console.log(reference);
    const payment = await paymentModel.findOne({ reference });
    console.log(payment);
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    const { data } = await axios.get(
      `https://api.korapay.com/merchant/api/v1/charges/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KORA_API_KEY}`,
        },
      },
    );
    console.log(data);
    if (data?.status === true && data?.data.status === "success") {
      payment.status = data?.data.status;
      await payment.save();

      return res.status(200).json({
        message: "Payment verified successfully",
        data: payment,
      });
    } else {
      payment.status = data?.data.status;
      await payment.save();

      return res.status(200).json({
        message: "Payment not yet verified",
        data: payment,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to verify payment",
    });
  }
};

exports.getAllPaymentByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const allPayments = await paymentModel
      .find({ userId })
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "All payment by User",
      data: allPayments,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};