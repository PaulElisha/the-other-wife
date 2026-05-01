import { Router } from "express";
import OnboardingController from "@module/onboarding/onboarding.controller.js"


class OnboardingRouter {

 public router: Router;

 constructor() {
  this.router = Router();
  this.initializeRoutes();
 }

 private initializeRoutes() {
  this.router.get("/current", OnboardingController.getCurrentProcess);
  this.router.post("step-one", OnboardingController.stepOne);
  this.router.patch("step-two", OnboardingController.stepTwo);
  this.router.patch("step-three", OnboardingController.stepThree);
 }
}

const onboardingRouter =  new OnboardingRouter().router;

export default onboardingRouter
export {onboardingRouter}