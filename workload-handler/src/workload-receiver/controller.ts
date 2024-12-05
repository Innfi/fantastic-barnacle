import { Controller, Logger } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { MessagePayload } from "./interfaces";

@Controller()
export class WorkloadReceiverController {
  @MessagePattern('message')
  handleMessage(@Payload() payload: MessagePayload): any {
    Logger.log(`handleMessage] payload: ${JSON.stringify(payload)}`);

    return {
      result: 'ok',
    };
  }
}