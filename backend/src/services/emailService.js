async function sendOrderConfirmation(order, user) {
  // Mocked for local development. Swap this for SMTP, SES, or a transactional email provider.
  console.log(`Mock email: order ${order._id} confirmation sent to ${user.email}`);
}

module.exports = { sendOrderConfirmation };

