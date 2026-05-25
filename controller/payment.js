const paymentModel = require("../models/payment");
const groupModel = require("../models/group");
const userModel = require("../models/user");
const otpGenerator = require("otp-generator");
const axios = require("axios");
const crypto = require("crypto");

const terminalStatuses = ["success", "failed", "abandoned"];

const compareSignatures = (expectedSignature, receivedSignature) => {
  if (!expectedSignature || !receivedSignature) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(receivedSignature, "hex");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

const updatePaymentStatus = async (reference, status) => {
  if (!reference || !terminalStatuses.includes(status)) {
    return null;
  }

  const payment = await paymentModel.findOne({ reference });

  if (!payment || payment.status === "success") {
    return payment;
  }

  payment.status = status;
  await payment.save();

  return payment;
};

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

exports.koraWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-korapay-signature"];
    const secretKey = process.env.KORA_SECRET_KEY || process.env.KORA_API_KEY;

    if (!signature || !secretKey || !req.body?.data) {
      return res.status(401).json({
        message: "Invalid webhook request",
      });
    }

    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(JSON.stringify(req.body.data))
      .digest("hex");

    if (!compareSignatures(hash, signature)) {
      return res.status(401).json({
        message: "Invalid webhook signature",
      });
    }

    const event = req.body.event;
    const paymentData = req.body.data;
    if (event === "charge.success" && paymentData.status === "success") {
      await updatePaymentStatus(paymentData.reference, "success");
    }

    if (paymentData.status === "failed" || paymentData.status === "abandoned") {
      await updatePaymentStatus(paymentData.reference, paymentData.status);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Failed to process webhook",
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
