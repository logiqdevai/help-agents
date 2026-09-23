import { Injectable, Logger } from '@nestjs/common';
import Retell from 'retell-sdk';
import { RetellConfig } from '../retell.config';
import { toHttpException } from '../utils/retell.utils';

@Injectable()
export class RetellPhoneNumbersService {
  private readonly logger = new Logger(RetellPhoneNumbersService.name);

  constructor(private readonly retellConfig: RetellConfig) {}

  async createPhoneNumber(params: Retell.PhoneNumberCreateParams) {
    try {
      return await this.retellConfig.getRetellClient().phoneNumber.create(params);
    } catch (error) {
      this.logger.error(`Error creating phone number: ${error.message}`);
      throw toHttpException(error);
    }
  }

  /** Imports a number from an external provider (e.g. Twilio) via SIP trunking. */
  async importPhoneNumber(params: Retell.PhoneNumberImportParams) {
    try {
      return await this.retellConfig.getRetellClient().phoneNumber.import(params);
    } catch (error) {
      this.logger.error(`Error importing phone number: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async getPhoneNumber(phoneNumber: string) {
    try {
      return await this.retellConfig.getRetellClient().phoneNumber.retrieve(phoneNumber);
    } catch (error) {
      this.logger.error(`Error getting phone number ${phoneNumber}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async listPhoneNumbers(params?: Retell.PhoneNumberListParams) {
    try {
      return await this.retellConfig.getRetellClient().phoneNumber.list(params);
    } catch (error) {
      this.logger.error(`Error listing phone numbers: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async updatePhoneNumber(phoneNumber: string, params: Retell.PhoneNumberUpdateParams) {
    try {
      return await this.retellConfig
        .getRetellClient()
        .phoneNumber.update(phoneNumber, params);
    } catch (error) {
      this.logger.error(`Error updating phone number ${phoneNumber}: ${error.message}`);
      throw toHttpException(error);
    }
  }

  async deletePhoneNumber(phoneNumber: string) {
    try {
      await this.retellConfig.getRetellClient().phoneNumber.delete(phoneNumber);
    } catch (error) {
      this.logger.error(`Error deleting phone number ${phoneNumber}: ${error.message}`);
      throw toHttpException(error);
    }
  }
}
