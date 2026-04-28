import "reflect-metadata";
import { RegisterTechnicianDto } from "./apps/server/src/modules/technician/dto/technician.dto";
import { TechnicianSignupService } from "./apps/server/src/modules/technician/technician-signup.service";

async function test() {
  const service = new TechnicianSignupService();
  const dto = new RegisterTechnicianDto();
  dto.fullName = "John Doe";
  dto.email = "johndoe10@test.com";
  dto.password = "password123";
  dto.phone = "9999999912";
  dto.role = "plumbing" as any;
  dto.experienceYears = "1-3" as any;
  dto.city = "Delhi";
  dto.pincode = "110001";

  try {
    await service.signup(dto);
    console.log("Success!");
  } catch (err) {
    console.log("Controller Error:", err.message);
    if (err.stack) console.log(err.stack);
  }
}
test();
