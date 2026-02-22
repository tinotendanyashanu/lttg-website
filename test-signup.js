const { registerPartner } = require('./lib/actions/auth');

async function test() {
  const formData = new FormData();
  formData.append('name', 'Test User');
  formData.append('email', 'test@test.com');
  formData.append('password', 'password123');
  formData.append('country', 'USA');
  formData.append('partnerType', 'partner');
  formData.append('termsAccepted', 'true');

  try {
    const result = await registerPartner(null, formData);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

test();
