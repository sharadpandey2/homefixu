import "reflect-metadata";
import { TechnicianSignupService } from "./src/modules/technician/technician-signup.service";

async function test() {
  const service = new TechnicianSignupService();
  const dto = {
    fullName: "John Doe",
    email: "johndoe11@test.com",
    phone: "9999999911",
    password: "password123",
    role: "plumbing",
    experienceYears: "1-3",
    city: "Delhi",
    pincode: "110001",
  };

  try {
    await service.signup(dto as any);
    console.log("Success!");
  } catch (err) {
    console.log("Controller Error:", err.message);
    if (err.stack) console.log(err.stack);
  }
}
test();
