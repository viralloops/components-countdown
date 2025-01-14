import type { Plugin, BlockProperties, ComponentDefinition } from 'grapesjs';

export type PluginOptions = {
  /**
   * The ID used to create the block and component
   * @default 'countdown'
   */
  id?: string;

  /**
   * The label used for the block and the component.
   * @default 'Countdown'
   */
  label?: string,

  /**
   * Object to extend the default block. Pass a falsy value to avoid adding the block.
   * @example
   * { label: 'Countdown', category: 'Extra', ... }
   */
  block?: Partial<BlockProperties>;

  /**
   * Object to extend the default component properties.
   * @example
   * { name: 'Countdown', droppable: false, ... }
   */
  props?: ComponentDefinition;

  /**
   * Custom CSS styles for the component. This will replace the default one.
   * @default ''
   */
  style?: string,

  /**
   * Additional CSS styles for the component. These will be appended to the default one.
   * @default ''
   */
  styleAdditional?: string,

  /**
   * Default start time.
   * @default ''
   * @example '2018-01-25 00:00'
   */
  startTime?: string,

  /**
   * Text to show when the countdown is ended.
   * @default 'EXPIRED'
   */
  endText?: string,

  /**
   * Date input type, eg. `date`, `datetime-local`
   * @default 'date'
   */
  dateInputType?: string,

  /**
   * Days label text used in component.
   * @default 'days'
   */
  labelDays?: string,

  /**
   * Hours label text used in component.
   * @default 'hours'
   */
  labelHours?: string,

  /**
   * Minutes label text used in component.
   * @default 'minutes'
   */
  labelMinutes?: string,

  /**
   * Seconds label text used in component.
   * @default 'seconds'
   */
  labelSeconds?: string,

  /**
   * Countdown component class prefix.
   * @default 'countdown'
   */
  classPrefix?: string,
};

type TElement = HTMLElement & { __gjsCountdownInterval: NodeJS.Timer };

declare global {
  interface Window { __gjsCountdownIntervals: TElement[]; }
}

const plugin: Plugin<PluginOptions> = (editor, opts = {}) => {
  const options: PluginOptions = {
    id: 'countdown',
    label: 'Countdown',
    block: {},
    props: {},
    style: '',
    styleAdditional: '',
    startTime: '',
    endText: 'EXPIRED',
    dateInputType: 'date',
    labelDays: 'days',
    labelHours: 'hours',
    labelMinutes: 'minutes',
    labelSeconds: 'seconds',
    classPrefix: 'countdown',
    ...opts,
  };

  const { block, props, style } = options;
  const id = options.id!;
  const label = options.label!;
  const pfx = options.classPrefix!;

  // Create block
  if (block) {
    editor.Blocks.add(id, {
      media: `<svg width="33" height="32" viewBox="0 0 33 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path d="M16.5 0C7.66129 0 0.5 7.16129 0.5 16C0.5 24.8387 7.66129 32 16.5 32C25.3387 32 32.5 24.8387 32.5 16C32.5 7.16129 25.3387 0 16.5 0ZM30.4355 16C30.4355 23.6581 24.2355 29.9355 16.5 29.9355C8.84194 29.9355 2.56452 23.7355 2.56452 16C2.56452 8.34194 8.76452 2.06452 16.5 2.06452C24.1581 2.06452 30.4355 8.26452 30.4355 16ZM20.829 21.6968L15.5903 17.8903C15.3903 17.7419 15.2742 17.5097 15.2742 17.2645V6.96774C15.2742 6.54194 15.6226 6.19355 16.0484 6.19355H16.9516C17.3774 6.19355 17.7258 6.54194 17.7258 6.96774V16.4065L22.2742 19.7161C22.6226 19.9677 22.6935 20.4516 22.4419 20.8L21.9129 21.529C21.6613 21.871 21.1774 21.9484 20.829 21.6968Z" fill="#D9D9D9"/>
</svg>
`,
      label,
      category: 'Extra',
      select: true,
      content: { type: id },
      ...block
    });
  };

  const coundownScript = function(props: Record<string, any>) {
    const startfrom: string = props.startfrom;
    const endTxt: string = props.endText;
    // @ts-ignore
    const el: TElement = this;
    const countDownDate = new Date(startfrom).getTime();
    const countdownEl = el.querySelector('[data-js=countdown]') as HTMLElement;
    const endTextEl = el.querySelector('[data-js=countdown-endtext]') as HTMLElement;
    const dayEl = el.querySelector('[data-js=countdown-day]')!;
    const hourEl = el.querySelector('[data-js=countdown-hour]')!;
    const minuteEl = el.querySelector('[data-js=countdown-minute]')!;
    const secondEl = el.querySelector('[data-js=countdown-second]')!;
    const oldInterval = el.__gjsCountdownInterval;
    oldInterval && clearInterval(oldInterval);

    const connected: TElement[] = window.__gjsCountdownIntervals || [];
    const toClean: TElement[] = [];
    connected.forEach((item: TElement) => {
      if (!item.isConnected) {
        clearInterval(item.__gjsCountdownInterval);
        toClean.push(item);
      }
    });
    connected.indexOf(el) < 0 && connected.push(el);
    window.__gjsCountdownIntervals = connected.filter(item => toClean.indexOf(item) < 0);

    const setTimer = function (days: number, hours: number, minutes: number, seconds: number) {
      dayEl.innerHTML = `${days < 10 ? '0' + days : days}`;
      hourEl.innerHTML = `${hours < 10 ? '0' + hours : hours}`;
      minuteEl.innerHTML = `${minutes < 10 ? '0' + minutes : minutes}`;
      secondEl.innerHTML = `${seconds < 10 ? '0' + seconds : seconds}`;
    }

    const moveTimer = function() {
      const now = new Date().getTime();
      const distance = countDownDate - now;
      const days = Math.floor(distance / 86400000);
      const hours = Math.floor((distance % 86400000) / 3600000);
      const minutes = Math.floor((distance % 3600000) / 60000);
      const seconds = Math.floor((distance % 60000) / 1000);

      setTimer(days, hours, minutes, seconds);

      if (distance < 0) {
        clearInterval(el.__gjsCountdownInterval);
        endTextEl.innerHTML = endTxt;
        countdownEl.style.display = 'none';
        endTextEl.style.display = '';
      }
    };

    if (countDownDate) {
      el.__gjsCountdownInterval = setInterval(moveTimer, 1000);
      endTextEl.style.display = 'none';
      countdownEl.style.display = '';
      moveTimer();
    } else {
      setTimer(0, 0, 0, 0);
    }
  };

  // Create component
  editor.Components.addType(id, {
    model: {
      defaults: {
        startfrom: options.startTime,
        classes: [pfx],
        endText: options.endText,
        droppable: false,
        script: coundownScript,
        'script-props': ['startfrom', 'endText'],
        traits: [{
          label: 'Start',
          name: 'startfrom',
          changeProp: true,
          type: options.dateInputType,
        },{
          label: 'End text',
          name: 'endText',
          changeProp: true,
        }],
        // @ts-ignore
        components: `
          <span data-js="countdown" class="${pfx}-cont">
            <div class="${pfx}-block">
              <div data-js="countdown-day" class="${pfx}-digit"></div>
              <div class="${pfx}-label">${options.labelDays}</div>
            </div>
            <div class="${pfx}-block">
              <div data-js="countdown-hour" class="${pfx}-digit"></div>
              <div class="${pfx}-label">${options.labelHours}</div>
            </div>
            <div class="${pfx}-block">
              <div data-js="countdown-minute" class="${pfx}-digit"></div>
              <div class="${pfx}-label">${options.labelMinutes}</div>
            </div>
            <div class="${pfx}-block">
              <div data-js="countdown-second" class="${pfx}-digit"></div>
              <div class="${pfx}-label">${options.labelSeconds}</div>
            </div>
          </span>
          <span data-js="countdown-endtext" class="${pfx}-endtext"></span>
        `,
        styles: (style || `
          .${pfx} {
            text-align: center;
          }

          .${pfx}-block {
            display: inline-block;
            margin: 0 10px;
            padding: 10px;
          }

          .${pfx}-digit {
            font-size: 5rem;
          }

          .${pfx}-endtext {
            font-size: 5rem;
          }

          .${pfx}-cont {
            display: inline-block;
          }
        `) + (options.styleAdditional),
        ...props,
      },
    },
  });
};

export default plugin;