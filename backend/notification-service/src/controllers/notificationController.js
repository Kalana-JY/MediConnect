import Notification from "../models/Notification.js";
import { sendEmail } from "../services/emailService.js";
import { sendSMS } from "../services/smsService.js";

// ─── Email Templates ─────────────────────────────────────────────

const templates = {

  appointment_booked: (data) => ({
    subject: `Appointment Confirmed - #${data.appointmentNo}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a6fa0;">MediConnect - Appointment Confirmed</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your appointment has been successfully booked.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; color: #666;">Doctor</td><td style="padding: 8px; font-weight: bold;">${data.doctorName || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Hospital</td><td style="padding: 8px; font-weight: bold;">${data.hospitalName || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Date</td><td style="padding: 8px; font-weight: bold;">${data.appointmentDate}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Time</td><td style="padding: 8px; font-weight: bold;">${data.appointmentTime}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Appointment No</td><td style="padding: 8px; font-weight: bold;">#${data.appointmentNo}</td></tr>
        </table>
        <p style="color: #888; font-size: 12px;">Thank you for choosing MediConnect.</p>
      </div>
    `,
    sms: `MediConnect: Appointment #${data.appointmentNo} confirmed with ${data.doctorName || 'your doctor'} on ${data.appointmentDate} at ${data.appointmentTime}.`,
  }),

  appointment_cancelled: (data) => ({
    subject: `Appointment Cancelled - #${data.appointmentNo || ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">MediConnect - Appointment Cancelled</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your appointment has been cancelled.</p>
        <p style="color: #888; font-size: 12px;">If you did not request this cancellation, please contact support.</p>
      </div>
    `,
    sms: `MediConnect: Your appointment has been cancelled. Contact support if this was unexpected.`,
  }),

  consultation_completed: (data) => ({
    subject: `Consultation Completed`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a6fa0;">MediConnect - Consultation Summary</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your consultation with ${data.doctorName || 'your doctor'} has been completed.</p>
        <p>Duration: ${data.duration || 'N/A'} minutes</p>
        <p>You can view your prescription and medical records in the MediConnect app.</p>
        <p style="color: #888; font-size: 12px;">Thank you for choosing MediConnect.</p>
      </div>
    `,
    sms: `MediConnect: Your consultation with ${data.doctorName || 'the doctor'} is completed. Check the app for details.`,
  }),

  payment_confirmed: (data) => ({
    subject: `Payment Confirmed - Rs ${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a6fa0;">MediConnect - Payment Confirmed</h2>
        <p>Dear ${data.patientName},</p>
        <p>Your appointment payment has been successfully confirmed.</p>
        <h3 style="margin-top: 20px; color: #0f172a;">Appointment Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0 20px;">
          <tr><td style="padding: 8px; color: #666;">Doctor</td><td style="padding: 8px; font-weight: bold;">${data.doctorName || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Hospital</td><td style="padding: 8px; font-weight: bold;">${data.hospitalName || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Date</td><td style="padding: 8px; font-weight: bold;">${data.appointmentDate || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Time</td><td style="padding: 8px; font-weight: bold;">${data.appointmentTime || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Appointment No</td><td style="padding: 8px; font-weight: bold;">#${data.appointmentNo || 'N/A'}</td></tr>
        </table>
        <h3 style="margin-top: 8px; color: #0f172a;">Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
          <tr><td style="padding: 8px; color: #666;">Amount</td><td style="padding: 8px; font-weight: bold;">Rs ${data.amount}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Order ID</td><td style="padding: 8px; font-weight: bold;">${data.orderId || 'N/A'}</td></tr>
        </table>
        <p style="color: #888; font-size: 12px;">Thank you for your payment.</p>
      </div>
    `,
    sms: `MediConnect: Payment of Rs ${data.amount} confirmed. Order: ${data.orderId || 'N/A'}.`,
  }),
};

// todo: delete
export const testService = async (req, res) => {
  try {
    return res.json({ success: true, message: "Notification service is working!" });
  } catch (error) {
    console.error("Test service error:", error);
    return res.status(500).json({ success: false, error: "Notification service test failed." });
  }
};

// ─── Controller Methods ──────────────────────────────────────────

/**
 * Send a notification (generic).
 * POST /api/notifications/send
 */
export const sendNotification = async (req, res) => {
  try {
    const { recipientId, recipientType, type, channel, to, subject, message } = req.body;

    if (!to || !message || !type) {
      return res.status(400).json({ error: "to, message, and type are required." });
    }

    // Create notification record
    const notification = new Notification({
      recipientId: recipientId || "",
      recipientType: recipientType || "patient",
      type,
      channel: channel || "general",
      to,
      subject: subject || "",
      message,
    });

    // Send via appropriate channel
    let result;
    if (type === "email") {
      result = await sendEmail(to, subject || "MediConnect Notification", message);
    } else if (type === "sms") {
      result = await sendSMS(to, message);
    }

    if (result?.success) {
      notification.status = "sent";
      notification.sentAt = new Date();
    } else {
      notification.status = "failed";
      notification.error = result?.error || "Unknown error";
    }

    await notification.save();

    res.status(201).json({ success: result?.success, notification });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({ error: "Failed to send notification." });
  }
};

/**
 * Send templated notification for appointment booking.
 * POST /api/notifications/appointment-booked
 */
export const sendAppointmentBooked = async (req, res) => {
  try {
    const data = req.body;
    const template = templates.appointment_booked(data);
    const results = [];

    if (data.email) {
      const emailResult = await sendEmail(data.email, template.subject, template.html);

      const notification = new Notification({
        recipientId: data.patientId || "",
        recipientType: "patient",
        type: "email",
        channel: "appointment_booked",
        to: data.email,
        subject: template.subject,
        message: template.html,
        status: emailResult.success ? "sent" : "failed",
        sentAt: emailResult.success ? new Date() : undefined,
        error: emailResult.error || "",
      });

      await notification.save();
      results.push({ type: "email", success: emailResult.success, error: emailResult.error || "" });
    }

    // Send SMS if phone provided
    if (data.phone) {
      const smsNotification = new Notification({
        recipientId: data.patientId || "",
        recipientType: "patient",
        type: "sms",
        channel: "appointment_booked",
        to: data.phone,
        message: template.sms,
      });

      const smsResult = await sendSMS(data.phone, template.sms);
      smsNotification.status = smsResult.success ? "sent" : "failed";
      smsNotification.sentAt = smsResult.success ? new Date() : undefined;
      smsNotification.error = smsResult.error || "";
      await smsNotification.save();
      results.push({ type: "sms", success: smsResult.success, error: smsResult.error || "" });
    }

    const success = results.length > 0 && results.every((item) => item.success);
    res.status(201).json({ success, results });
  } catch (error) {
    console.error("Appointment booked notification error:", error);
    res.status(500).json({ error: "Failed to send notification." });
  }
};

/**
 * Send templated notification for appointment cancellation.
 * POST /api/notifications/appointment-cancelled
 */
export const sendAppointmentCancelled = async (req, res) => {
  try {
    const data = req.body;
    const template = templates.appointment_cancelled(data);
    const results = [];

    if (data.email) {
      const emailResult = await sendEmail(data.email, template.subject, template.html);
      const notification = new Notification({
        recipientId: data.patientId || "",
        recipientType: "patient",
        type: "email",
        channel: "appointment_cancelled",
        to: data.email,
        subject: template.subject,
        message: template.html,
        status: emailResult.success ? "sent" : "failed",
        sentAt: emailResult.success ? new Date() : undefined,
        error: emailResult.error || "",
      });
      await notification.save();
      results.push({ type: "email", success: emailResult.success, error: emailResult.error || "" });
    }

    if (data.phone) {
      const smsResult = await sendSMS(data.phone, template.sms);
      const notification = new Notification({
        recipientId: data.patientId || "",
        recipientType: "patient",
        type: "sms",
        channel: "appointment_cancelled",
        to: data.phone,
        message: template.sms,
        status: smsResult.success ? "sent" : "failed",
        sentAt: smsResult.success ? new Date() : undefined,
        error: smsResult.error || "",
      });
      await notification.save();
      results.push({ type: "sms", success: smsResult.success, error: smsResult.error || "" });
    }

    const success = results.length > 0 && results.every((item) => item.success);
    res.status(201).json({ success, results });
  } catch (error) {
    console.error("Appointment cancelled notification error:", error);
    res.status(500).json({ error: "Failed to send notification." });
  }
};

/**
 * Send templated notification for consultation completion.
 * POST /api/notifications/consultation-completed
 */
export const sendConsultationCompleted = async (req, res) => {
  try {
    const data = req.body;
    const template = templates.consultation_completed(data);
    const results = [];

    if (data.email) {
      const emailResult = await sendEmail(data.email, template.subject, template.html);
      const notification = new Notification({
        recipientId: data.patientId || "",
        recipientType: "patient",
        type: "email",
        channel: "consultation_completed",
        to: data.email,
        subject: template.subject,
        message: template.html,
        status: emailResult.success ? "sent" : "failed",
        sentAt: emailResult.success ? new Date() : undefined,
        error: emailResult.error || "",
      });
      await notification.save();
      results.push({ type: "email", success: emailResult.success, error: emailResult.error || "" });
    }

    if (data.phone) {
      const smsResult = await sendSMS(data.phone, template.sms);
      const notification = new Notification({
        recipientId: data.patientId || "",
        recipientType: "patient",
        type: "sms",
        channel: "consultation_completed",
        to: data.phone,
        message: template.sms,
        status: smsResult.success ? "sent" : "failed",
        sentAt: smsResult.success ? new Date() : undefined,
        error: smsResult.error || "",
      });
      await notification.save();
      results.push({ type: "sms", success: smsResult.success, error: smsResult.error || "" });
    }

    const success = results.length > 0 && results.every((item) => item.success);
    res.status(201).json({ success, results });
  } catch (error) {
    console.error("Consultation completed notification error:", error);
    res.status(500).json({ error: "Failed to send notification." });
  }
};

/**
 * Send templated notification for payment confirmation.
 * POST /api/notifications/payment-confirmed
 */
export const sendPaymentConfirmed = async (req, res) => {
  try {
    const data = req.body;
    const template = templates.payment_confirmed(data);
    const results = [];

    if (data.email) {
      const emailResult = await sendEmail(data.email, template.subject, template.html);
      const notification = new Notification({
        recipientId: data.patientId || "",
        recipientType: "patient",
        type: "email",
        channel: "payment_confirmed",
        to: data.email,
        subject: template.subject,
        message: template.html,
        status: emailResult.success ? "sent" : "failed",
        sentAt: emailResult.success ? new Date() : undefined,
        error: emailResult.error || "",
      });
      await notification.save();
      results.push({ type: "email", success: emailResult.success, error: emailResult.error || "" });
    }

    if (data.phone) {
      const smsResult = await sendSMS(data.phone, template.sms);
      const notification = new Notification({
        recipientId: data.patientId || "",
        recipientType: "patient",
        type: "sms",
        channel: "payment_confirmed",
        to: data.phone,
        message: template.sms,
        status: smsResult.success ? "sent" : "failed",
        sentAt: smsResult.success ? new Date() : undefined,
        error: smsResult.error || "",
      });
      await notification.save();
      results.push({ type: "sms", success: smsResult.success, error: smsResult.error || "" });
    }

    const success = results.length > 0 && results.every((item) => item.success);
    res.status(201).json({ success, results });
  } catch (error) {
    console.error("Payment confirmed notification error:", error);
    res.status(500).json({ error: "Failed to send notification." });
  }
};

/**
 * Get all notifications (admin).
 * GET /api/notifications
 */
export const getAllNotifications = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.channel) filter.channel = req.query.channel;
    if (req.query.status) filter.status = req.query.status;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
};

/**
 * Get notification by ID.
 * GET /api/notifications/:id
 */
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }
    res.json(notification);
  } catch (error) {
    console.error("Get notification error:", error);
    res.status(500).json({ error: "Failed to fetch notification." });
  }
};
