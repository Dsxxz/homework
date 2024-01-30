import {AuthService} from "./service/auth-service";
import {DevicesService} from "./service/devices_service";
import {AuthController} from "./routes/auth_controller";

const userService = new AuthService()
const devisesService=new DevicesService()
export const authController = new AuthController(userService, devisesService)
