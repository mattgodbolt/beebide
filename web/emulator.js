define(function (require) {
    var $ = require('jquery');
    var _ = require('underscore');
    var Cpu6502 = require('jsbeeb/6502');
    var canvasLib = require('jsbeeb/canvas');
    var Video = require('jsbeeb/video');
    var Debugger = require('jsbeeb/debug');
    var SoundChip = require('jsbeeb/soundchip');
    var DdNoise = require('jsbeeb/ddnoise');
    var models = require('jsbeeb/models');
    var Cmos = require('jsbeeb/cmos');
    var utils = require('jsbeeb/utils');
    var fdc = require('jsbeeb/fdc');
    var Promise = require('promise');
    utils.setBaseUrl('jsbeeb/');

    var ClocksPerSecond = (2 * 1000 * 1000) | 0;
    var MaxCyclesPerFrame = ClocksPerSecond / 10;

    function Emulator(container, state) {
        this.container = container;
        this.hub = container.layoutManager.eventHub;
        this.root = container.getElement().html($('#emulator').html());
        this.canvas = canvasLib.bestCanvas(this.root.find('.screen')[0]);
        this.frames = 0;
        this.frameSkip = 0;
        this.video = new Video.Video(this.canvas.fb32, _.bind(this.paint, this));

        var audioContext = typeof AudioContext !== 'undefined' ? new AudioContext()
            : typeof webkitAudioContext !== 'undefined' ? new webkitAudioContext()
            : null;

        if (audioContext) {
            this.soundChip = new SoundChip.SoundChip(audioContext.sampleRate);
            // NB must be assigned to some kind of object else it seems to get GC'd by
            // Safari...
            this.soundChip.jsAudioNode = audioContext.createScriptProcessor(2048, 0, 1);
            this.soundChip.jsAudioNode.onaudioprocess = _.bind(function pumpAudio(event) {
                var outBuffer = event.outputBuffer;
                var chan = outBuffer.getChannelData(0);
                this.soundChip.render(chan, 0, chan.length);
            }, this);
            this.soundChip.jsAudioNode.connect(audioContext.destination);
            this.ddNoise = new DdNoise.DdNoise(audioContext);
        } else {
            this.soundChip = new SoundChip.FakeSoundChip();
            this.ddNoise = new DdNoise.FakeDdNoise();
        }

        this.dbgr = new Debugger(this.video);
        var model = models.findModel('B');
        var cmos = new Cmos({
            load: function () {
                if (window.localStorage.cmosRam) {
                    return JSON.parse(window.localStorage.cmosRam);
                }
                return null;
            },
            save: function (data) {
                window.localStorage.cmosRam = JSON.stringify(data);
            }
        });
        var config = {};
        this.cpu = new Cpu6502(model, this.dbgr, this.video, this.soundChip, this.ddNoise, cmos, config);

        this.lastFrameTime = 0;
        this.onAnimFrame = _.bind(this.frameFunc, this);
        this.ready = false;
        Promise.all([this.cpu.initialise(), this.ddNoise.initialise()]).then(_.bind(function () {
            this.ready = true;
        }, this));

        this.hub.on('start', this.onStart, this);
    }

    Emulator.prototype.start = function () {
        if (this.running) return;
        this.running = true;
        requestAnimationFrame(this.onAnimFrame);
    };

    Emulator.prototype.onStart = function (e) {
        if (!this.ready) return;
        this.cpu.reset(true);
        var image = fdc.discFor(this.cpu.fdc, false, e.result);
        this.cpu.fdc.loadDisc(0, image);
        this.start();
        this.sendRawKeyboardToBBC(0,
            // Shift on power-on -> run !Boot from the disc
            utils.BBC.SHIFT,
            1000 // pause in ms
        );
    };

    Emulator.prototype.sendRawKeyboardToBBC = function () {
        var keysToSend = Array.prototype.slice.call(arguments, 0);
        var lastChar;
        var nextKeyMillis = 0;
        this.cpu.sysvia.disableKeyboard();

        var sendCharHook = this.cpu.debugInstruction.add(_.bind(function nextCharHook() {
            var millis = this.cpu.cycleSeconds * 1000 + this.cpu.currentCycles / (ClocksPerSecond / 1000);
            if (millis < nextKeyMillis) {
                return;
            }

            if (lastChar && lastChar != utils.BBC.SHIFT) {
                this.cpu.sysvia.keyToggleRaw(lastChar);
            }

            if (keysToSend.length === 0) {
                // Finished
                this.cpu.sysvia.enableKeyboard();
                sendCharHook.remove();
                return;
            }

            var ch = keysToSend[0];
            var debounce = lastChar === ch;
            lastChar = ch;
            if (debounce) {
                lastChar = undefined;
                nextKeyMillis = millis + 30;
                return;
            }

            var time = 50;
            if (typeof lastChar === "number") {
                time = lastChar;
                lastChar = undefined;
            } else {
                this.cpu.sysvia.keyToggleRaw(lastChar);
            }

            // remove first character
            keysToSend.shift();

            nextKeyMillis = millis + time;
        }, this));
    };

    Emulator.prototype.frameFunc = function (now) {
        requestAnimationFrame(this.onAnimFrame);
        if (this.running && this.lastFrameTime !== 0) {
            var sinceLast = now - this.lastFrameTime;
            var cycles = (sinceLast * ClocksPerSecond / 1000) | 0;
            cycles = Math.min(cycles, MaxCyclesPerFrame);
            try {
                if (!this.cpu.execute(cycles)) {
                    this.running = false; // TODO: breakpoint
                }
            } catch (e) {
                this.running = false;
                this.dbgr.debug(this.cpu.pc);
                throw e;
            }
        }
        this.lastFrameTime = now;
    };

    Emulator.prototype.paint = function paint(minx, miny, maxx, maxy) {
        this.frames++;
        if (this.frames < this.frameSkip) return;
        this.frames = 0;
        this.canvas.paint(minx, miny, maxx, maxy);
    };

    return Emulator;
});