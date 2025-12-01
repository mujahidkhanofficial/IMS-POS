import { machineIdSync } from 'node-machine-id';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';

const SALT = 'IMS-POS-SECRET-SALT-V1-PRODUCTION-SECURE';
const LICENSE_FILE = 'license.key';
const LOG_FILE = 'license-debug.log';

export class LicenseManager {
    private machineId: string;
    private licensePath: string;
    private logPath: string;

    constructor() {
        this.licensePath = path.join(app.getPath('userData'), LICENSE_FILE);
        this.logPath = path.join(app.getPath('userData'), LOG_FILE);
        this.log('INFO', 'LicenseManager initialized.');
        this.machineId = this.getMachineIdInternal();
    }

    private log(level: 'INFO' | 'ERROR' | 'WARN', message: string, error?: any) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level}] ${message}`;
        if (error) {
            logMessage += `\nStack: ${error.stack || error}`;
        }
        logMessage += '\n';

        console.log(logMessage.trim()); // Console log
        try {
            fs.appendFileSync(this.logPath, logMessage); // File log
        } catch (fsError) {
            console.error('Failed to write to log file:', fsError);
        }
    }

    private getMachineIdInternal(): string {
        this.log('INFO', 'Attempting to retrieve Machine ID...');
        try {
            // Attempt to get original machine ID
            const id = machineIdSync(true);
            this.log('INFO', `Machine ID retrieved successfully: ${id}`);
            return id;
        } catch (error) {
            this.log('ERROR', 'Failed to get native Machine ID. Falling back to generated ID.', error);

            try {
                const fallbackString = `${os.hostname()}-${os.platform()}-${os.arch()}-${os.cpus()[0]?.model || 'unknown'}`;
                const fallbackId = crypto.createHash('sha256').update(fallbackString).digest('hex');
                this.log('WARN', `Generated Fallback ID: ${fallbackId} (derived from: ${fallbackString})`);
                return fallbackId;
            } catch (fallbackError) {
                this.log('ERROR', 'CRITICAL: Failed to generate fallback ID.', fallbackError);
                return 'UNKNOWN-MACHINE-ID';
            }
        }
    }

    public getMachineId(): string {
        return this.machineId;
    }

    public generateExpectedKey(): string {
        try {
            return crypto.createHash('sha256').update(this.machineId + SALT).digest('hex').toUpperCase();
        } catch (error) {
            this.log('ERROR', 'Failed to generate expected key.', error);
            return '';
        }
    }

    public validateKey(key: string): boolean {
        if (!key) return false;
        try {
            const expected = this.generateExpectedKey();
            const isValid = key.trim().toUpperCase() === expected;
            this.log('INFO', `Key Validation: Input=${key.substring(0, 8)}... Expected=${expected.substring(0, 8)}... Valid=${isValid}`);
            return isValid;
        } catch (error) {
            this.log('ERROR', 'Error during key validation.', error);
            return false;
        }
    }

    public loadLicense(): { key: string } | null {
        try {
            if (!fs.existsSync(this.licensePath)) {
                this.log('INFO', 'No license file found.');
                return null;
            }
            const key = fs.readFileSync(this.licensePath, 'utf8').trim();
            this.log('INFO', 'License file loaded.');
            return { key };
        } catch (error) {
            this.log('ERROR', 'Error loading license file.', error);
            return null;
        }
    }

    public saveLicense(key: string): void {
        try {
            fs.writeFileSync(this.licensePath, key.trim().toUpperCase());
            this.log('INFO', 'License saved successfully.');
        } catch (error) {
            this.log('ERROR', 'Error saving license file.', error);
        }
    }
}

export const licenseManager = new LicenseManager();
