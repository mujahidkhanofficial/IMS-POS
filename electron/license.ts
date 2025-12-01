import { machineIdSync } from 'node-machine-id';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const SECRET_SALT = 'IMS_POS_SECURE_SALT_2024_!@#';

export class LicenseManager {
    private licensePath: string;

    constructor() {
        this.licensePath = path.join(app.getPath('userData'), 'license.key');
    }

    getMachineId(): string {
        try {
            return machineIdSync(true);
        } catch (error) {
            console.error('Failed to get machine ID:', error);
            return 'UNKNOWN-MACHINE-ID';
        }
    }

    generateExpectedKey(machineId: string): string {
        return crypto
            .createHash('sha256')
            .update(machineId + SECRET_SALT)
            .digest('hex')
            .toUpperCase();
    }

    validateKey(inputKey: string): boolean {
        const machineId = this.getMachineId();
        const expectedKey = this.generateExpectedKey(machineId);
        return inputKey.trim().toUpperCase() === expectedKey;
    }

    saveKey(key: string): boolean {
        if (this.validateKey(key)) {
            try {
                fs.writeFileSync(this.licensePath, key.trim().toUpperCase());
                return true;
            } catch (error) {
                console.error('Failed to save license key:', error);
                return false;
            }
        }
        return false;
    }

    checkLicense(): boolean {
        if (!fs.existsSync(this.licensePath)) {
            return false;
        }
        try {
            const savedKey = fs.readFileSync(this.licensePath, 'utf-8');
            return this.validateKey(savedKey);
        } catch (error) {
            return false;
        }
    }
}

export const licenseManager = new LicenseManager();
