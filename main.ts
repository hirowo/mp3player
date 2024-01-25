//% weight=70 icon="\uf075" color=#33FF00 block="MP3プレイヤー"
namespace mp3payer {
    let dataArr: number[] = [0x7E, 0xFF, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xEF]
    let isConnected: boolean = false;
    let pow = DigitalPin.P2;
    export enum playType {
        //% block="Play"
        Play = 0x0D,
        //% block="Stop"
        Stop = 0x16,
        //% block="Play Next"
        PlayNext = 0x01,
        //% block="Play Previous"
        PlayPrevious = 0x02,
        //% block="Pause"
        Pause = 0x0E
    }

    export enum EQ {
        //% block="Normal"
        Normal = 0x00,
        //% block="Pop"
        Pop = 0x01,
        //% block="Rock"
        Rock = 0x02,
        //% block="Jazz"
        Jazz = 0x03,
        //% block="Classic"
        Classic = 0x04,
        //% block="Base"
        Base = 0x05
    }

    export enum isRepeat {
        //% block="No"
        No = 0,
        //% block="Yes"
        Yes = 1
    }

    function checkSum(): void {
        let total = 0;
        for (let i = 1; i < 7; i++) {
            total += dataArr[i]
        }
        total = 65536 - total
        dataArr[7] = total >> 8
        dataArr[8] = total & 0xFF
    }

    function sendData(): void {
        let myBuf = pins.createBuffer(10);
        for (let i = 0; i < 10; i++) {
            myBuf.setNumber(NumberFormat.UInt8BE, i, dataArr[i])
        }
        serial.writeBuffer(myBuf)
        basic.pause(100)
    }

    function innerCall(CMD: number, para1: number, para2: number): void {
        if (!isConnected) {
            connect(SerialPin.P0, SerialPin.P1)
        }
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        checkSum()
        sendData()
    }
    function sendcom(CMD: number, para1: number): void {
        if (!isConnected) {
            connect(SerialPin.P0, SerialPin.P1)
        }
        dataArr[3] = CMD
        dataArr[4] = para1
        checkSum()
        sendData()
    }

    /**
     * Connect DFPlayer Mini
     * @param pinRX RX Pin, eg: SerialPin.P0
     * @param pinTX TX Pin, eg: SerialPin.P1
     */
    //% blockId="dfplayermini_connect" block="DFPlayer miniとの接続, RX:%pinRX|TX:%pinTX"
    //% weight=100 blockGap=20
    export function connect(pinRX: SerialPin = SerialPin.P0, pinTX: SerialPin = SerialPin.P1): void {
        serial.redirect(pinRX, pinTX, BaudRate.BaudRate9600)
        isConnected = true
        basic.pause(100)
    }

    //% blockId="dfplayermini_press" block="press button:%myPlayType"
    //% weight=99 blockGap=20
    export function press(myPlayType: playType): void {
        innerCall(myPlayType, 0x00, 0x00)
    }

    //% blockId="dfplayermini_playFile" block="再生ファイル番号:%fileNumber|repeat:%setRepeat"
    //% weight=98 blockGap=20 fileNumber.min=1 fileNumber.max=255
    export function playFile(fileNumber: number, setRepeat: isRepeat): void {
        sendcom(0x03, fileNumber)
        if (setRepeat == 1) press(0x19)
    }

    //% blockId="dfplayermini_playFileInFolder" block="指定フォルダ内のファイルを再生:%folderNumber|file number:%fileNumber|repeat:%setRepeat"
    //% weight=97 blockGap=20 folderNumber.min=1 folderNumber.max=99 fileNumber.min=1 fileNumber.max=255
    export function playFileInFolder(folderNumber: number, fileNumber: number, setRepeat: isRepeat): void {
        innerCall(0x0F, folderNumber, fileNumber)
        if (setRepeat == 1) press(0x19)
    }



    //% blockId="dfplayermini_setVolume" block="音量を設定(0~30):%volume"
    //% weight=94 blockGap=20 volume.min=0 volume.max=30
    export function setVolume(volume: number): void {
        innerCall(0x06, 0x00, volume | 0)
    }

}