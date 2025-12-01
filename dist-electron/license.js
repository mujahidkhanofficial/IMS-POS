"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseManager = exports.LicenseManager = void 0;
const node_machine_id_1 = require("node-machine-id");
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const SALT = 'IMS-POS-SECRET-SALT-V1-PRODUCTION-SECURE';
const LICENSE_FILE = 'license.key';
const LOG_FILE = 'license-debug.log';
class LicenseManager {
    machineId;
    licensePath;
    logPath;
    constructor() {
        this.licensePath = path_1.default.join(electron_1.app.getPath('userData'), LICENSE_FILE);
        this.logPath = path_1.default.join(electron_1.app.getPath('userData'), LOG_FILE);
        console.log('LicenseManager: Log Path resolved to:', this.logPath);
        this.log('INFO', 'LicenseManager initialized.');
        this.machineId = this.getMachineIdInternal();
    }
    log(level, message, error) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] [${level}] ${message}`;
        if (error) {
            logMessage += `\nStack: ${error.stack || error}`;
        }
        logMessage += '\n';
        console.log(logMessage.trim()); // Console log
        try {
            fs_1.default.appendFileSync(this.logPath, logMessage); // File log
        }
        catch (fsError) {
            console.error('Failed to write to log file:', fsError);
        }
    }
    getMachineIdInternal() {
        this.log('INFO', 'Attempting to retrieve Machine ID...');
        try {
            // Attempt to get original machine ID
            const id = (0, node_machine_id_1.machineIdSync)(true);
            this.log('INFO', `Machine ID retrieved successfully: ${id}`);
            return id;
        }
        catch (error) {
            this.log('ERROR', 'Failed to get native Machine ID. Falling back to generated ID.', error);
            try {
                const fallbackString = `${os_1.default.hostname()}-${os_1.default.platform()}-${os_1.default.arch()}-${os_1.default.cpus()[0]?.model || 'unknown'}`;
                const fallbackId = crypto_1.default.createHash('sha256').update(fallbackString).digest('hex');
                this.log('WARN', `Generated Fallback ID: ${fallbackId} (derived from: ${fallbackString})`);
                return fallbackId;
            }
            catch (fallbackError) {
                this.log('ERROR', 'CRITICAL: Failed to generate fallback ID.', fallbackError);
                return 'UNKNOWN-MACHINE-ID';
            }
        }
    }
    getMachineId() {
        return this.machineId;
    }
    generateExpectedKey() {
        try {
            return crypto_1.default.createHash('sha256').update(this.machineId + SALT).digest('hex').toUpperCase();
        }
        catch (error) {
            this.log('ERROR', 'Failed to generate expected key.', error);
            return '';
        }
    }
    validateKey(key) {
        if (!key)
            return false;
        try {
            const expected = this.generateExpectedKey();
            const isValid = key.trim().toUpperCase() === expected;
            this.log('INFO', `Key Validation: Input=${key.substring(0, 8)}... Expected=${expected.substring(0, 8)}... Valid=${isValid}`);
            return isValid;
        }
        catch (error) {
            this.log('ERROR', 'Error during key validation.', error);
            return false;
        }
    }
    loadLicense() {
        try {
            if (!fs_1.default.existsSync(this.licensePath)) {
                this.log('INFO', 'No license file found.');
                return null;
            }
            const key = fs_1.default.readFileSync(this.licensePath, 'utf8').trim();
            this.log('INFO', 'License file loaded.');
            return { key };
        }
        catch (error) {
            this.log('ERROR', 'Error loading license file.', error);
            return null;
        }
    }
    saveLicense(key) {
        try {
            fs_1.default.writeFileSync(this.licensePath, key.trim().toUpperCase());
            this.log('INFO', 'License saved successfully.');
        }
        catch (error) {
            this.log('ERROR', 'Error saving license file.', error);
        }
    }
}
exports.LicenseManager = LicenseManager;
exports.licenseManager = new LicenseManager();
//# sourceMappingURL=license.js.map