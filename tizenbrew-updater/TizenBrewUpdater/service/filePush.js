"use strict";

const AdbPacket = require('adbhost/lib/packet.js');
const commands = AdbPacket.commands;

module.exports = function (adb, path, fileName, data, cb) {
    global.currentClient.send(JSON.stringify({ type: 'message', message: 'Pushing file...'}));
    const shell = adb.createStream('sync:');
    setTimeout(() => {
        const statBuffer = new Buffer(8);
        statBuffer.write('STAT', 0);
        statBuffer.writeUInt32LE(path.length, 4);
        adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, statBuffer);

        adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, new Buffer(path))

        const filePath = `${path}/${fileName}`;
        const sendBuffer = new Buffer(8);
        sendBuffer.writeUInt32LE(0x444E4553, 0);
        sendBuffer.writeUInt32LE(filePath.length + 6, 4);
        adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, sendBuffer);

        adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, new Buffer(`${filePath},33261`))

        if (data.length > 1420) {
            const chunk = data.slice(0, 1420);
            const buffer = new Buffer(8 + chunk.length);
            buffer.write('DATA');
            buffer.writeUInt32LE(chunk.length, 4);
            chunk.copy(buffer, 8);
            adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, buffer);
            for (let i = 1420; i < data.length; i += 1420) {
                const chunk = data.slice(i, i + 1420);
                const buffer = new Buffer(8 + chunk.length);
                buffer.write('DATA');
                buffer.writeUInt32LE(chunk.length, 4);
                chunk.copy(buffer, 8);
                adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, buffer);
            }
        } else {
            const buffer = new Buffer(8 + data.length);
            buffer.write('DATA');
            buffer.writeUInt32LE(data.length, 4);
            data.copy(buffer, 8);
            adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, buffer);
        }

        const doneData = new Buffer(8);
        doneData.write('DONE');
        doneData.writeUInt32LE(0x15f2b865, 4);
        adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, doneData);

        const quitData = new Buffer(8);
        quitData.write('QUIT');
        adb._writePacket(commands.WRTE, shell._localId, shell._remoteId, quitData);
        cb();
    }, 1500);
}