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
type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
type Position = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
type AlertType = 'default' | 'success' | 'info' | 'warning' | 'error';
export declare class Alert {
    private elementRef;
    private autoCloseInterval;
    private removeBinded;
    private timeVisible;
    private _autoClose;
    private progressInterval;
    private isPaused;
    private unpause;
    private pause;
    private readonly DEFAULT_OPTIONS;
    constructor(options?: Partial<AlertOptions>);
    remove(): void;
    private set text(value);
    private set position(value);
    private set autoClose(value);
    private set canClose(value);
    private set showProgress(value);
    private set pauseOnHover(value);
    private set type(value);
    update(options: AtLeastOne<AlertOptions>): void;
    private createContainer;
}
export {};
