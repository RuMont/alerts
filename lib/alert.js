"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alert = void 0;
class Alert {
    constructor(options = {}) {
        this.autoCloseInterval = null;
        this.removeBinded = this.remove.bind(this);
        this.timeVisible = 0;
        this._autoClose = false;
        this.progressInterval = null;
        this.isPaused = false;
        this.unpause = () => (this.isPaused = false);
        this.pause = () => (this.isPaused = true);
        this.DEFAULT_OPTIONS = {
            position: 'top-right',
            text: 'Sample Text',
            autoClose: 5000,
            onClose: () => undefined,
            onOpen: () => undefined,
            canClose: true,
            showProgress: true,
            pauseOnHover: true,
            type: 'default',
        };
        this.createContainer = (position) => {
            const container = document.createElement('div');
            container.classList.add('alert__container');
            container.dataset['position'] = position;
            document.body.append(container);
            return container;
        };
        this.elementRef = document.createElement('div');
        this.elementRef.classList.add('alert');
        requestAnimationFrame(() => setTimeout(() => {
            this.elementRef.classList.add('show');
            this['onOpen']();
        }, 250));
        this.update(Object.assign(Object.assign({}, this.DEFAULT_OPTIONS), options));
    }
    remove() {
        if (this.autoCloseInterval != null)
            cancelAnimationFrame(this.autoCloseInterval);
        if (this.progressInterval != null)
            cancelAnimationFrame(this.progressInterval);
        const container = this.elementRef.parentElement;
        this.elementRef.classList.remove('show');
        this.elementRef.addEventListener('transitionend', () => {
            this.elementRef.remove();
            this['onClose']();
            if (container != null && container.hasChildNodes())
                return;
            container === null || container === void 0 ? void 0 : container.remove();
        });
    }
    set text(value) {
        this.elementRef.textContent = value;
    }
    set position(value) {
        const currentContainer = this.elementRef.parentElement;
        const selector = `.alert__container[data-position="${value}"]`;
        const container = document.querySelector(selector) || this.createContainer(value);
        container.append(this.elementRef);
        if (currentContainer != null && currentContainer.hasChildNodes())
            return;
        currentContainer === null || currentContainer === void 0 ? void 0 : currentContainer.remove();
    }
    set autoClose(value) {
        this._autoClose = value;
        this.timeVisible = 0;
        if (this._autoClose === false)
            return;
        let lastTime = null;
        const func = (time) => {
            if (lastTime == null) {
                lastTime = time;
                this.autoCloseInterval = requestAnimationFrame(func);
                return;
            }
            if (!this.isPaused) {
                this.timeVisible += time - lastTime;
                if (this.timeVisible >= this._autoClose) {
                    this.remove();
                    return;
                }
            }
            lastTime = time;
            this.autoCloseInterval = requestAnimationFrame(func);
        };
        this.autoCloseInterval = requestAnimationFrame(func);
    }
    set canClose(value) {
        this.elementRef.classList.toggle('can-close', value);
        if (value)
            this.elementRef.addEventListener('click', this.removeBinded);
        else
            this.elementRef.removeEventListener('click', this.removeBinded);
    }
    set showProgress(value) {
        if (this._autoClose === false) {
            value = false;
            this.elementRef.classList.toggle('progress', false);
            return;
        }
        this.elementRef.classList.toggle('progress', value);
        this.elementRef.style.setProperty('--progress', '1');
        if (value) {
            const func = () => {
                if (!this.isPaused) {
                    this.elementRef.style.setProperty('--progress', (1 - this.timeVisible / this._autoClose).toString());
                }
                this.progressInterval = requestAnimationFrame(func);
            };
            this.progressInterval = requestAnimationFrame(func);
        }
    }
    set pauseOnHover(value) {
        if (value) {
            this.elementRef.addEventListener('mouseover', this.pause);
            this.elementRef.addEventListener('mouseleave', this.unpause);
        }
        else {
            this.elementRef.removeEventListener('mouseover', this.pause);
            this.elementRef.removeEventListener('mouseleave', this.unpause);
        }
    }
    set type(value) {
        this.elementRef.classList.forEach(_class => {
            if (_class.includes(value)) {
                this.elementRef.classList.remove(_class);
            }
        });
        this.elementRef.classList.add(`alert__type-${value}`);
    }
    update(options) {
        Object.entries(options).forEach(([key, value]) => {
            this[key] = value;
        });
    }
}
exports.Alert = Alert;
