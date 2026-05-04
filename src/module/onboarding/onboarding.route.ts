import { Router } from "express";
import OnboardingController from "@module/onboarding/onboarding.controller.js"


class OnboardingRouter {

 public router: Router;

 constructor() {
  this.router = Router();
  this.initializeRoutes();
 }

 private initializeRoutes() {
  this.router.get("/current/:id", OnboardingController.getCurrentProcess);
  this.router.post("/step-one", OnboardingController.stepOne);
  this.router.patch("/step-two/:id", OnboardingController.stepTwo);
  this.router.patch("/step-three/:id", OnboardingController.stepThree);
 }
}

const onboardingRouter =  new OnboardingRouter().router;

export default onboardingRouter
export {onboardingRouter}