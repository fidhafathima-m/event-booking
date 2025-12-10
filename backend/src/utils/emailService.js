import sgMail from '@sendgrid/mail';
import dotenv from "dotenv";
dotenv.config();

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Verify SendGrid connection
const verifySendGrid = async () => {
  try {
    // Test connection by sending a simple validation request
    const [response] = await sgMail.send({
      to: process.env.EMAIL_USER, // Send test to yourself
      from: process.env.EMAIL_USER,
      subject: 'SendGrid Connection Test',
      text: 'SendGrid is working correctly!',
    });
    console.log('SendGrid is ready to send emails');
    return true;
  } catch (error) {
    console.error('SendGrid verification failed:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return false;
  }
};

// Call verification on startup
verifySendGrid();

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

// Send booking confirmation email with SendGrid
export const sendBookingConfirmationEmail = async (booking) => {
  const msg = {
    to: booking.contactPerson?.email || booking.user?.email,
    from: {
      email: process.env.EMAIL_USER,
      name: 'Event Booking Platform',
    },
    subject: `Booking Confirmation - ${booking.service?.title}`,
    html: emailTemplates.bookingConfirmation(booking),
    // Optional tracking
    trackingSettings: {
      clickTracking: {
        enable: true,
        enableText: false,
      },
      openTracking: {
        enable: true,
      },
    },
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log(`Booking confirmation email sent via SendGrid: ${response}`);
    return response;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('SendGrid error response body:', error.response.body);
    }
    
    throw error;
  }
};

// Send booking status update email
export const sendBookingStatusUpdateEmail = async (booking, newStatus) => {
  const msg = {
    to: booking.contactPerson?.email || booking.user?.email,
    from: {
      email: process.env.EMAIL_USER,
      name: 'Event Booking Platform',
    },
    subject: `Booking Status Update - ${booking.service?.title}`,
    html: emailTemplates.bookingStatusUpdate(booking, newStatus),
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log(`Status update email sent via SendGrid: ${response}`);
    return response;
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user) => {
  const msg = {
    to: user.email,
    from: {
      email: process.env.EMAIL_USER,
      name: 'Event Booking Platform',
    },
    subject: 'Welcome to Event Booking Platform!',
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
              <a href="${process.env.FRONTEND_URL}/services" class="button">Browse Services</a>
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
    const [response] = await sgMail.send(msg);
    console.log(`Welcome email sent via SendGrid to ${user.email}: ${response}`);
    return response;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Send OTP email with SendGrid
export const sendOTPEmail = async (email, otp, name) => {
  const msg = {
    to: email,
    from: {
      email: process.env.EMAIL_USER,
      name: 'EventBook',
    },
    subject: 'Email Verification OTP - EventBook',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #4f46e5; 
            letter-spacing: 10px;
            text-align: center;
            margin: 20px 0;
          }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>EventBook</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with EventBook. Please use the OTP below to verify your email address:</p>
            
            <div class="otp-code">${otp}</div>
            
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            
            <p>If you didn't create an account with EventBook, please ignore this email.</p>
            
            <p>Best regards,<br>The EventBook Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EventBook. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    // Add category for better tracking in SendGrid dashboard
    categories: ['otp', 'verification'],
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log(`OTP email sent via SendGrid to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email via SendGrid:', error);
    
    // Detailed error information
    if (error.response) {
      console.error('SendGrid response error:', error.response.body);
    }
    
    throw new Error('Failed to send OTP email');
  }
};

export default sgMail;
