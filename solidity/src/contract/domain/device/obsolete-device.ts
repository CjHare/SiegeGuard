import {IsNotEmpty, ValidateNested} from 'class-validator'
import {Device} from './device'
import {ObsoleteDeviceReason} from './obsolete-device-reason'
import {Timestamp} from '../time/timestamp'
import {validate} from '../domain-validator'

export class ObsoleteDevice extends Device {
  @IsNotEmpty()
  @ValidateNested()
  obsoleteReason!: ObsoleteDeviceReason

  @IsNotEmpty()
  @ValidateNested()
  obsoleteDate!: Timestamp

  private constructor(
    device: Device,
    obsoleteReason: ObsoleteDeviceReason,
    obsoleteDate: Timestamp
  ) {
    super(
      device.id,
      device.agentId,
      device.name,
      device.token,
      device.creationDate
    )
    this.obsoleteReason = obsoleteReason
    this.obsoleteDate = obsoleteDate
  }

  static obsolete(
    device: Device,
    obsoleteReason: ObsoleteDeviceReason,
    obsoleteDate: Timestamp
  ): ObsoleteDevice {
    return validate(new ObsoleteDevice(device, obsoleteReason, obsoleteDate))
  }
}
