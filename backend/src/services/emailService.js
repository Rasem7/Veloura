async function sendOrderConfirmation(order, user) {
  // Mocked for local development. Swap this for SMTP, SES, or a transactional email provider.
  console.log(`Mock email: order ${order._id} confirmation sent to ${user.email}`);
}

async function sendAuthCode(email, code, mode) {
  // Mocked by default. Replace with SMTP, SES, Resend, or SendGrid before real launch.
  console.log(`Mock email: ${mode} code ${code} sent to ${email}`);
  return { mock: true };
}

module.exports = { sendOrderConfirmation, sendAuthCode };
