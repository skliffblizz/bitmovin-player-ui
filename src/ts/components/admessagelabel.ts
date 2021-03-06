import {Label, LabelConfig} from './label';
import {UIInstanceManager} from '../uimanager';
import {StringUtils} from '../stringutils';
import { AdEvent, PlayerAPI } from 'bitmovin-player';

/**
 * A label that displays a message about a running ad, optionally with a countdown.
 */
export class AdMessageLabel extends Label<LabelConfig> {

  constructor(config: LabelConfig = {}) {
    super(config);

    this.config = this.mergeConfig(config, {
      cssClass: 'ui-label-ad-message',
      text: 'This ad will end in {remainingTime} seconds.',
    }, this.config);
  }

  configure(player: PlayerAPI, uimanager: UIInstanceManager): void {
    super.configure(player, uimanager);

    let config = this.getConfig();
    let text = config.text;

    let updateMessageHandler = () => {
      this.setText(StringUtils.replaceAdMessagePlaceholders(text, null, player));
    };

    let adStartHandler = (event: AdEvent) => {
      text = config.text; // TODO event.adMessage || config.text;
      updateMessageHandler();

      player.on(player.exports.PlayerEvent.TimeChanged, updateMessageHandler);
    };

    let adEndHandler = () => {
      player.off(player.exports.PlayerEvent.TimeChanged, updateMessageHandler);
    };

    player.on(player.exports.PlayerEvent.AdStarted, adStartHandler);
    player.on(player.exports.PlayerEvent.AdSkipped, adEndHandler);
    player.on(player.exports.PlayerEvent.AdError, adEndHandler);
    player.on(player.exports.PlayerEvent.AdFinished, adEndHandler);
  }
}