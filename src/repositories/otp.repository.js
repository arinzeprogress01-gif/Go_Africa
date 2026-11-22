// Temporary in-memory OTP store. Replace with Redis or MongoDB before production.
const records = new Map();

export const otpRepository = {
  async save(phone, record) { records.set(phone, record); },
  async findByPhone(phone) { return records.get(phone) || null; },
  async delete(phone) { records.delete(phone); }
};
