const fs = require('fs');
const path = require('path');

const museDevicePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'web-muse',
  'src',
  'lib',
  'MuseDevice.js'
);

if (!fs.existsSync(museDevicePath)) {
  process.exit(0);
}

let patched = fs.readFileSync(museDevicePath, 'utf8');

patched = patched.replace(
  'import { MuseCircularBuffer } from "./CircularBuffer";',
  'import { MuseCircularBuffer } from "./CircularBuffer.js";'
);

if (!patched.includes('async #connectOptionalChar(service, cid, hook)')) {
  patched = patched.replace(
    [
      '  async #connectChar(service, cid, hook) {',
      '    const c = await service["getCharacteristic"](cid);',
      '    c["oncharacteristicvaluechanged"] = hook;',
      '    c["startNotifications"]();',
      '    return c;',
      '  }',
    ].join('\n'),
    [
      '  async #connectChar(service, cid, hook) {',
      '    const c = await service["getCharacteristic"](cid);',
      '    c["oncharacteristicvaluechanged"] = hook;',
      '    c["startNotifications"]();',
      '    return c;',
      '  }',
      '  async #connectOptionalChar(service, cid, hook) {',
      '    try {',
      '      return await this.#connectChar(service, cid, hook);',
      '    } catch (error) {',
      '      console.warn(`Optional Muse characteristic ${cid} is not available:`, error);',
      '      return null;',
      '    }',
      '  }',
    ].join('\n')
  );
}

[
  'BATTERY_CHARACTERISTIC',
].forEach((constantName) => {
  patched = patched.replace(
    new RegExp(`await this\\.#connectChar\\(\\n      service,\\n      this\\.#${constantName},`, 'g'),
    `await this.#connectOptionalChar(\n      service,\n      this.#${constantName},`
  );
});

[
  'GYROSCOPE_CHARACTERISTIC',
  'ACCELEROMETER_CHARACTERISTIC',
  'PPG1_CHARACTERISTIC',
  'PPG2_CHARACTERISTIC',
  'PPG3_CHARACTERISTIC',
  'EEG5_CHARACTERISTIC',
].forEach((constantName) => {
  patched = patched.replace(
    new RegExp(`await this\\.#connectOptionalChar\\(\\n      service,\\n      this\\.#${constantName},`, 'g'),
    `await this.#connectChar(\n      service,\n      this.#${constantName},`
  );
});

patched = patched.replace(
  [
    '    } catch (error) {',
    '      this.#dev = null;',
    '      this.#state = 0;',
    '      return;',
    '    }',
    '    let gatt = undefined;',
  ].join('\n'),
  [
    '    } catch (error) {',
    '      this.#dev = null;',
    '      this.#state = 0;',
    '      throw error;',
    '    }',
    '    let gatt = undefined;',
  ].join('\n')
);

patched = patched.replace(
  [
    '    } catch (error) {',
    '      this.#dev = null;',
    '      this.#state = 0;',
    '      return;',
    '    }',
    '    const service = await gatt["getPrimaryService"](this.#SERVICE);',
  ].join('\n'),
  [
    '    } catch (error) {',
    '      this.#dev = null;',
    '      this.#state = 0;',
    '      throw error;',
    '    }',
    '    const service = await gatt["getPrimaryService"](this.#SERVICE);',
  ].join('\n')
);

patched = patched.replace(
  [
    '    this.#dev.addEventListener("gattserverdisconnected", function () {',
    '      this.#dev = null;',
    '      this.#state = 0;',
    '      that.disconnected();',
    '    });',
  ].join('\n'),
  [
    '    this.#dev.addEventListener("gattserverdisconnected", function () {',
    '      that.#dev = null;',
    '      that.#state = 0;',
    '      that.disconnected();',
    '    });',
  ].join('\n')
);

fs.writeFileSync(museDevicePath, patched);
