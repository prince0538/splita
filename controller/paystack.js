const paymentModel = require("../models/payment");
const groupModel = require("../models/group");
const userModel = require("../models/user")
const axios = require("axios");

exports.initailizePaystackPayment = async (req, res) => {
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
    const paymentData = {
      amount: group.contributionAmount * 100,
      currency: "NGN",
      email: user.email,
      callback_url: "https://www.google.com/",
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
        },
      },
    );
    const payment = await paymentModel.create({
      amount: group.contributionAmount,
      reference: `TCA-Splita-${response.data?.data.reference}`,
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

exports.verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    console.log(reference);


    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
        },
      },
    );
    const payment = await paymentModel.findOne({ reference: `TCA-Splita-${reference}` })
    if (!payment) {
        return res.status(404).json({
            message: "Payment not found",
        });
    }
    // console.log(data);
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