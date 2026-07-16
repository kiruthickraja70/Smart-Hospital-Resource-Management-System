import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured. Emails will be logged to console.');
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  if (!transporter) {
    console.log('--- EMAIL (dev mode) ---');
    console.log(`To: ${to}\nSubject: ${subject}\n${html}`);
    return { success: true, dev: true };
  }

  await transporter.sendMail(mailOptions);
  return { success: true };
};

export const sendAppointmentConfirmation = async (appointment, patient, doctor) => {
  const date = new Date(appointment.date).toLocaleDateString();
  await sendEmail({
    to: patient.email,
    subject: 'Appointment Confirmation - Smart Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d6efd;">Appointment Confirmed</h2>
        <p>Dear ${patient.name},</p>
        <p>Your appointment has been successfully booked.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Doctor</strong></td><td style="padding: 8px; border: 1px solid #ddd;">Dr. ${doctor.name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Department</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${doctor.department}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${date}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${appointment.time}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Reason</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${appointment.reason}</td></tr>
        </table>
        <p style="margin-top: 20px;">Thank you for choosing Smart Hospital.</p>
      </div>
    `,
  });
};

export const sendAppointmentReminder = async (appointment, patient, doctor) => {
  const date = new Date(appointment.date).toLocaleDateString();
  await sendEmail({
    to: patient.email,
    subject: 'Appointment Reminder - Smart Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ffc107;">Appointment Reminder</h2>
        <p>Dear ${patient.name},</p>
        <p>This is a reminder for your upcoming appointment.</p>
        <p><strong>Dr. ${doctor.name}</strong> | ${date} at ${appointment.time}</p>
        <p>Please arrive 15 minutes early.</p>
      </div>
    `,
  });
};

export const sendAppointmentCancellation = async (appointment, patient, doctor) => {
  const date = new Date(appointment.date).toLocaleDateString();
  await sendEmail({
    to: patient.email,
    subject: 'Appointment Cancelled - Smart Hospital',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Appointment Cancelled</h2>
        <p>Dear ${patient.name},</p>
        <p>Your appointment with Dr. ${doctor.name} on ${date} at ${appointment.time} has been cancelled.</p>
        <p>Please contact us to reschedule if needed.</p>
      </div>
    `,
  });
};

export default sendEmail;
