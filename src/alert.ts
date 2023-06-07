interface AlertOptions {
  /**
   * sets the position of the alert
   */
  position: Position;
  /**
   * alert inner text
   */
  text: string;
  /**
   * ``false`` if alert needs to persist, otherwise a number in milliseconds
   */
  autoClose: number | false;
  /**
   * callback to execute when the {@link Alert.remove} function is executed
   * @returns {unknown}
   */
  onClose: () => unknown;
  /**
   * callback to execute when the alert is shown
   * @returns {unknown}
   */
  onOpen: () => unknown;
  /**
   * if the alert can be closed on click
   */
  canClose: boolean;
  /**
   * ``showProgress`` depends on ``autoClose`` not being false
   */
  showProgress: boolean;
  /**
   * Stop progress bar and ``autoClose`` on mouseover
   */
  pauseOnHover: boolean;
  /**
   * Type of the alert
   */
  type: AlertType;
}

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];
type Position =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';
type AlertType = 'default' | 'success' | 'info' | 'warning' | 'error';

export class Alert {
  private elementRef: HTMLDivElement;
  private autoCloseInterval: ReturnType<typeof requestAnimationFrame> | null =
    null;
  private removeBinded = this.remove.bind(this);
  private timeVisible = 0;
  private _autoClose: false | number = false;
  private progressInterval: ReturnType<typeof requestAnimationFrame> | null =
    null;
  private isPaused = false;
  private unpause = () => (this.isPaused = false);
  private pause = () => (this.isPaused = true);

  private readonly DEFAULT_OPTIONS: Partial<AlertOptions> = {
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

  constructor(options: Partial<AlertOptions> = {}) {
    this.elementRef = document.createElement('div');
    this.elementRef.classList.add('alert');
    requestAnimationFrame(() =>
      setTimeout(() => {
        this.elementRef.classList.add('show');
        (this['onOpen' as keyof this] as AlertOptions['onOpen'])();
      }, 250)
    );
    this.update({
      ...this.DEFAULT_OPTIONS,
      ...options,
    } as AtLeastOne<AlertOptions>);
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
      (this['onClose' as keyof this] as AlertOptions['onClose'])();
      if (container != null && container.hasChildNodes()) return;
      container?.remove();
    });
  }

  private set text(value: string) {
    this.elementRef.textContent = value;
  }

  private set position(value: Position) {
    const currentContainer = this.elementRef.parentElement;
    const selector = `.alert__container[data-position="${value}"]`;
    const container =
      document.querySelector(selector) || this.createContainer(value);
    container.append(this.elementRef);
    if (currentContainer != null && currentContainer.hasChildNodes()) return;
    currentContainer?.remove();
  }

  private set autoClose(value: false | number) {
    this._autoClose = value;
    this.timeVisible = 0;
    if (this._autoClose === false) return;
    let lastTime: number | null = null;
    const func = (time: number) => {
      if (lastTime == null) {
        lastTime = time;
        this.autoCloseInterval = requestAnimationFrame(func);
        return;
      }
      if (!this.isPaused) {
        this.timeVisible += time - lastTime;
        if (this.timeVisible >= (this._autoClose as number)) {
          this.remove();
          return;
        }
      }
      lastTime = time;
      this.autoCloseInterval = requestAnimationFrame(func);
    };
    this.autoCloseInterval = requestAnimationFrame(func);
  }

  private set canClose(value: boolean) {
    this.elementRef.classList.toggle('can-close', value);
    if (value) this.elementRef.addEventListener('click', this.removeBinded);
    else this.elementRef.removeEventListener('click', this.removeBinded);
  }

  private set showProgress(value: boolean) {
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
          this.elementRef.style.setProperty(
            '--progress',
            (1 - this.timeVisible / (this._autoClose as number)).toString()
          );
        }
        this.progressInterval = requestAnimationFrame(func);
      };
      this.progressInterval = requestAnimationFrame(func);
    }
  }

  private set pauseOnHover(value: boolean) {
    if (value) {
      this.elementRef.addEventListener('mouseover', this.pause);
      this.elementRef.addEventListener('mouseleave', this.unpause);
    } else {
      this.elementRef.removeEventListener('mouseover', this.pause);
      this.elementRef.removeEventListener('mouseleave', this.unpause);
    }
  }

  private set type(value: AlertType) {
    this.elementRef.classList.forEach(_class => {
      if (_class.includes(value)) {
        this.elementRef.classList.remove(_class);
      }
    });
    this.elementRef.classList.add(`alert__type-${value}`);
  }

  update(options: AtLeastOne<AlertOptions>) {
    Object.entries(options).forEach(([key, value]) => {
      this[key as keyof this] = value as this[keyof this];
    });
  }

  private createContainer = (position: string) => {
    const container = document.createElement('div');
    container.classList.add('alert__container');
    container.dataset['position'] = position;
    document.body.append(container);
    return container;
  };
}
