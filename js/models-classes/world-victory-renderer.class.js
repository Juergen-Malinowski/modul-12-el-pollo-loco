/**
 * Draws the Victory result window, highscore rows, and action buttons.
 */
class WorldVictoryRenderer {
  constructor(world, highscoreManager) {
    this.world = world;
    this.highscoreManager = highscoreManager;
  }

  /**
   * Draws the current Victory highscore window and action buttons.
   *
   * @param {CanvasRenderingContext2D} ctx - Game canvas context.
   */
  drawVictoryOptions(ctx) {
    if (!this.world.victoryWindowRect) return;
    this.drawVictoryWindow(ctx);
    this.drawVictoryTable(ctx);
    this.drawVictoryButtons(ctx);
  }

  /** Draws the Victory result window. */
  drawVictoryWindow(ctx) {
    const win = this.world.victoryWindowRect;
    ctx.save();
    ctx.fillStyle = getGameColor("--color-surface-light");
    ctx.strokeStyle = getGameColor("--color-border-dark");
    ctx.lineWidth = 4;
    ctx.fillRect(win.x, win.y, win.width, win.height);
    ctx.strokeRect(win.x, win.y, win.width, win.height);
    ctx.font = "bold 42px Zabars";
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Highscore", win.x + Math.floor(win.width / 2), win.y + 15);
    ctx.restore();
  }

  /** Draws the stored highscore table. */
  drawVictoryTable(ctx) {
    const win = this.world.victoryWindowRect;
    const list = this.highscoreManager.loadHighscores().slice(0, 10);
    const newEntry = this.highscoreManager.loadNewestHighscoreEntry();
    const columns = this.getVictoryTableColumns(win);

    ctx.save();
    this.drawVictoryTableHeader(ctx, win, columns);
    this.drawVictoryRows(ctx, win, columns, list, newEntry);
    ctx.restore();
  }

  /** Returns column positions for the Victory table. */
  getVictoryTableColumns(win) {
    return {
      rank: win.x + 40,
      name: win.x + 140,
      score: win.x + win.width - 120,
    };
  }

  /** Draws the Victory table header. */
  drawVictoryTableHeader(ctx, win, columns) {
    ctx.font = "bold 28px Zabars";
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.textAlign = "left";
    ctx.fillText("Rank", columns.rank, win.y + 70);
    ctx.fillText("Name", columns.name, win.y + 70);
    ctx.textAlign = "right";
    ctx.fillText("Score", columns.score, win.y + 70);
  }

  /** Draws all visible Victory highscore rows. */
  drawVictoryRows(ctx, win, columns, list, newEntry) {
    const fontSize = Math.max(20, Math.floor(win.height / 18));
    const lineHeight = Math.floor(fontSize * 1.15);
    const startY = win.y + 105;
    const blinkOn = Math.floor(Date.now() / 500) % 2 === 0;
    ctx.font = fontSize + "px Zabars";

    for (let i = 0; i < list.length; i++) {
      this.drawVictoryRow(
        ctx,
        columns,
        list[i],
        newEntry,
        i,
        startY + i * lineHeight,
        blinkOn,
      );
    }
  }

  /** Draws one Victory highscore row. */
  drawVictoryRow(ctx, columns, entry, newEntry, index, y, blinkOn) {
    const rank = index + 1 + ".";
    const name = entry && entry.name ? entry.name : "Player";
    const scoreValue = entry && typeof entry.score === "number" ? entry.score : 0;
    const highlighted =
      newEntry &&
      entry.name === newEntry.name &&
      entry.score === newEntry.score;

    ctx.fillStyle = this.getVictoryRowColor(highlighted, blinkOn);
    ctx.textAlign = "left";
    ctx.fillText(rank, columns.rank, y);
    ctx.fillText(name, columns.name, y);
    ctx.textAlign = "right";
    ctx.fillText(scoreValue + "", columns.score, y);
  }

  /** Returns the row color for the current highlight state. */
  getVictoryRowColor(highlighted, blinkOn) {
    if (!highlighted) return getGameColor("--color-text-dark");
    return getGameColor(
      blinkOn ? "--color-accent-danger" : "--color-surface-light",
    );
  }

  /** Draws Victory menu and replay buttons. */
  drawVictoryButtons(ctx) {
    const world = this.world;
    if (!world.victoryMenuButtonArea || !world.victoryPlayAgainButtonArea) return;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.font = "bold 32px Zabars";
    ctx.letterSpacing = "2px";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    this.drawVictoryButton(ctx, world.victoryMenuButtonArea, "Menu");
    this.drawVictoryButton(ctx, world.victoryPlayAgainButtonArea, "Play again?");
    ctx.restore();
  }

  /** Draws one Victory action button. */
  drawVictoryButton(ctx, area, label) {
    ctx.fillStyle = getGameColor("--color-ui-primary");
    ctx.strokeStyle = getGameColor("--color-border-dark");
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.fillText(
      label,
      area.x + Math.floor(area.width / 2),
      area.y + Math.floor(area.height / 2),
    );
  }
}
