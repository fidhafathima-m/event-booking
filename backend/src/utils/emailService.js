import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready");
  }
});

// Email templates
export const emailTemplates = {
  bookingConfirmation: (booking) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .booking-details { background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; }
        .status-confirmed { color: #4CAF50; font-weight: bold; }
        .status-pending { color: #FF9800; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmation</h1>
          <p>Event Booking Platform</p>
        </div>
        <div class="content">
          <p>Hello ${booking.contactPerson?.name || booking.user?.name},</p>
          <p>Your booking has been confirmed. Here are your booking details:</p>
          
          <div class="booking-details">
            <h2>Booking Details</h2>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Service:</strong> ${booking.service?.title}</p>
            <p><strong>Category:</strong> ${booking.service?.category}</p>
            <p><strong>Location:</strong> ${booking.service?.location}</p>
            <p><strong>Dates:</strong> ${new Date(
              booking.bookingDates.startDate
            ).toLocaleDateString()} - ${new Date(
    booking.bookingDates.endDate
  ).toLocaleDateString()}</p>
            <p><strong>Total Days:</strong> ${
              booking.bookingDates.totalDays
            }</p>
            <p><strong>Total Price:</strong> ₹${booking.totalPrice}</p>
            <p><strong>Status:</strong> <span class="status-${
              booking.status
            }">${booking.status}</span></p>
          </div>
          
          <h3>Contact Information</h3>
          <p><strong>Provider:</strong> ${
            booking.service?.contactInfo?.email
          }</p>
          <p><strong>Phone:</strong> ${booking.service?.contactInfo?.phone}</p>
          <p><strong>Address:</strong> ${
            booking.service?.contactInfo?.address
          }</p>
          
          <p>Please contact the service provider if you have any questions or need to make changes to your booking.</p>
          
          <p>Thank you for using our platform!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Event Booking Platform. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  bookingStatusUpdate: (booking, newStatus) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .booking-details { background: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
        .status-update { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Status Update</h1>
        </div>
        <div class="content">
          <p>Hello ${booking.contactPerson?.name || booking.user?.name},</p>
          
          <div class="status-update">
            <h3>Your booking status has been updated to: <strong>${newStatus}</strong></h3>
          </div>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Service:</strong> ${booking.service?.title}</p>
            <p><strong>Dates:</strong> ${new Date(
              booking.bookingDates.startDate
            ).toLocaleDateString()} - ${new Date(
    booking.bookingDates.endDate
  ).toLocaleDateString()}</p>
            ${
              newStatus === "cancelled" && booking.cancellationReason
                ? `<p><strong>Cancellation Reason:</strong> ${booking.cancellationReason}</p>`
                : ""
            }
          </div>
          
          ${
            newStatus === "cancelled"
              ? `
            <p>If you have any questions about this cancellation, please contact us.</p>
          `
              : ""
          }
          
          <p>Thank you for using our platform!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Event Booking Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Send booking confirmation email
export const sendBookingConfirmationEmail = async (booking) => {
  const mailOptions = {
    from: `"Event Booking Platform" <${process.env.EMAIL_USER}>`,
    to: booking.contactPerson?.email || booking.user?.email,
    subject: `Booking Confirmation - ${booking.service?.title}`,
    html: emailTemplates.bookingConfirmation(booking),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    throw error;
  }
};

// Send booking status update email
export const sendBookingStatusUpdateEmail = async (booking, newStatus) => {
  const mailOptions = {
    from: `"Event Booking Platform" <${process.env.EMAIL_USER}>`,
    to: booking.contactPerson?.email || booking.user?.email,
    subject: `Booking Status Update - ${booking.service?.title}`,
    html: emailTemplates.bookingStatusUpdate(booking, newStatus),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Status update email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending status update email:", error);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: `"Event Booking Platform" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Welcome to Event Booking Platform!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Event Booking Platform!</h1>
          </div>
          <div class="content">
            <p>Hello ${user.name},</p>
            <p>Thank you for registering with Event Booking Platform. We're excited to have you on board!</p>
            <p>With our platform, you can:</p>
            <ul>
              <li>Book venues, caterers, photographers, and more</li>
              <li>Manage all your bookings in one place</li>
              <li>Get the best deals for your events</li>
            </ul>
            <p style="text-align: center;">
              <a href="${
                process.env.FRONTEND_URL
              }/services" class="button">Browse Services</a>
            </p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Happy booking!</p>
            <p><strong>The Event Booking Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Event Booking Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};
