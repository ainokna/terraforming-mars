
import { expect } from "chai";
import { DeimosDownPromo } from "../../../src/cards/promo/DeimosDownPromo";
import { Color } from "../../../src/Color";
import { Player } from "../../../src/Player";
import { Game } from "../../../src/Game";
import { SelectSpace } from "../../../src/inputs/SelectSpace";
import { OrOptions } from "../../../src/inputs/OrOptions";

describe("DeimosDownPromo", function () {
    it("Should play", function () {
        const card = new DeimosDownPromo();
        const player = new Player("test", Color.BLUE, false);
        const player2 = new Player("test2", Color.RED, false);
        const game = new Game("foobar", [player,player2], player);
        player2.plants = 5;

        const action = card.play(player, game);
        expect(action instanceof SelectSpace).to.eq(true);
        expect(game.getTemperature()).to.eq(-24);
        expect(player.steel).to.eq(4);
        expect(player2.plants).to.eq(5);
    });

    it("Can remove a plants", function(){
        const card = new DeimosDownPromo();
        const player = new Player("test", Color.BLUE, false);
        const player2 = new Player("test2", Color.RED, false);
        const game = new Game("foobar", [player,player2], player);
        player2.plants = 5;

        const action = card.play(player, game);
        expect(action instanceof SelectSpace).to.eq(true);
        expect(game.getTemperature()).to.eq(-24);
        expect(player.steel).to.eq(4);

        expect(game.interrupts.length).to.eq(1);

        // Choose Remove 5 plants option
        (game.interrupts[0].playerInput as OrOptions).options[0].cb([player2]);

        expect(player2.plants).to.eq(0);
    });

    it("Works fine in solo mode", function() {
        const card = new DeimosDownPromo();
        const player = new Player("test", Color.BLUE, false);
        const game = new Game("foobar", [player], player);

        player.plants = 15;
        const action = card.play(player, game);
        expect(action instanceof SelectSpace).to.eq(true);

        expect(game.getTemperature()).to.eq(-24);
        expect(player.steel).to.eq(4);
        expect(player.plants).to.eq(15); // not removed
    });
});
