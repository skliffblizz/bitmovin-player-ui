import {ContainerConfig, Container} from "./container";
import {Component, ComponentConfig} from "./component";
import {DOM} from "../dom";
import {UIManager, UIRecommendationConfig} from "../uimanager";

declare var require: any;

export class RecommendationOverlay extends Container<ContainerConfig> {

    constructor(config: ContainerConfig = {}) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-recommendation-overlay',
            hidden: true
        }, this.config);
    }

    configure(player: bitmovin.player.Player, uimanager: UIManager): void {
        let self = this;

        if (!uimanager.getConfig() || !uimanager.getConfig().recommendations || uimanager.getConfig().recommendations.length == 0) {
            // There are no recommendation items, so don't need to configure anything
            return;
        }

        for (let item of uimanager.getConfig().recommendations) {
            this.addComponent(new RecommendationItem({itemConfig: item}));
        }
        this.updateComponents(); // create container DOM elements

        // Display recommendations when playback has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, function () {
            self.show();
        });
        // Hide recommendations when playback starts, e.g. a restart
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, function () {
            self.hide();
        });
    }
}

interface RecommendationItemConfig extends ComponentConfig {
    itemConfig: UIRecommendationConfig;
}

class RecommendationItem extends Component<RecommendationItemConfig> {

    private numeral = require('numeral');

    constructor(config: RecommendationItemConfig) {
        super(config);

        this.config = this.mergeConfig(config, {
            cssClass: 'ui-recommendation-item',
            itemConfig: null // this must be passed in from outside
        }, this.config);
    }

    protected toDomElement(): JQuery {
        let config = (<RecommendationItemConfig>this.config).itemConfig; // TODO fix generics and get rid of cast

        var itemElement = DOM.JQuery(`<a></a>`, {
            'id': this.config.id,
            'class': this.getCssClasses(),
            'href': config.url
        });

        var bgElement = DOM.JQuery(`<div>`, {
            'class': 'thumbnail'
        }).css({"background-image": `url(${config.thumbnail})`});
        itemElement.append(bgElement);

        var titleElement = DOM.JQuery(`<span>`, {
            'class': 'title'
        }).html(config.title);
        itemElement.append(titleElement);

        var timeElement = DOM.JQuery(`<span>`, {
            'class': 'duration'
        }).html(this.numeral(config.duration).format('00:00:00'));
        itemElement.append(timeElement);

        return itemElement;
    }
}