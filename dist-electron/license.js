"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseManager = exports.LicenseManager = void 0;
const node_machine_id_1 = require("node-machine-id");
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const SECRET_SALT = 'IMS_POS_SECURE_SALT_2024_!@#';
class LicenseManager {
    licensePath;
    constructor() {
        this.licensePath = path_1.default.join(electron_1.app.getPath('userData'), 'license.key');
    }
    getMachineId() {
        try {
            return (0, node_machine_id_1.machineIdSync)(true);
        }
        catch (error) {
            console.error('Failed to get machine ID:', error);
            return 'UNKNOWN-MACHINE-ID';
        }
    }
    generateExpectedKey(machineId) {
        return crypto_1.default
            .createHash('sha256')
            .update(machineId + SECRET_SALT)
            .digest('hex')
            .toUpperCase();
    }
    validateKey(inputKey) {
        const machineId = this.getMachineId();
        const expectedKey = this.generateExpectedKey(machineId);
        return inputKey.trim().toUpperCase() === expectedKey;
    }
    saveKey(key) {
        if (this.validateKey(key)) {
            try {
                fs_1.default.writeFileSync(this.licensePath, key.trim().toUpperCase());
                return true;
            }
            catch (error) {
                console.error('Failed to save license key:', error);
                return false;
            }
        }
        return false;
    }
    checkLicense() {
        if (!fs_1.default.existsSync(this.licensePath)) {
            return false;
        }
        try {
            const savedKey = fs_1.default.readFileSync(this.licensePath, 'utf-8');
            return this.validateKey(savedKey);
        }
        catch (error) {
            return false;
        }
    }
}
exports.LicenseManager = LicenseManager;
exports.licenseManager = new LicenseManager();
//# sourceMappingURL=license.js.map