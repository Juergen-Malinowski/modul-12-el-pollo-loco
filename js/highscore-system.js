/**
 * Owns Top-100 storage, shared highscore DOM rendering, and name entry.
 */
const HIGHSCORE_LIMIT = 100;
const HIGHSCORE_SCHEMA_KEY = "highscoreSchemaVersion";
const HIGHSCORE_SCHEMA_VERSION = "2";
var highscoreHandledForCurrentGame = false;
var highscoreFlowContext = "menu";

/** Returns the maximum number of stored highscore entries. */
function getHighscoreLimit() {
  return HIGHSCORE_LIMIT;
}

/** Clears one-time test data when the highscore schema changes. */
function initializeHighscoreStorage() {
  try {
    if (localStorage.getItem(HIGHSCORE_SCHEMA_KEY) === HIGHSCORE_SCHEMA_VERSION) return;
    localStorage.removeItem("highScoreTable");
    localStorage.removeItem("newHighscoreEntry");
    localStorage.setItem(HIGHSCORE_SCHEMA_KEY, HIGHSCORE_SCHEMA_VERSION);
  } catch (error) { }
}

/** Resets transient highscore state for a fresh game run. */
function resetHighscoreRunState() {
  highscoreHandledForCurrentGame = false;
  highscoreFlowContext = "menu";
  clearNewestHighscoreEntry();
}

/** Reads and sorts the stored Top-100 entries. */
function readHighscores() {
  try {
    if (localStorage.getItem(HIGHSCORE_SCHEMA_KEY) !== HIGHSCORE_SCHEMA_VERSION) return [];
    var list = JSON.parse(localStorage.getItem("highScoreTable") || "[]");
    if (!Array.isArray(list)) return [];
    return sortHighscores(list);
  } catch (error) {
    return [];
  }
}

/** Sorts score entries deterministically by score and creation time. */
function sortHighscores(list) {
  return list.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });
}

/** Reads the entry marked as the newest stored result. */
function readNewestHighscoreEntry() {
  try {
    return JSON.parse(localStorage.getItem("newHighscoreEntry") || "null");
  } catch (error) {
    return null;
  }
}

/** Removes the temporary newest-entry marker. */
function clearNewestHighscoreEntry() {
  try {
    localStorage.removeItem("newHighscoreEntry");
  } catch (error) { }
}

/** Creates one uniquely identifiable Top-100 entry. */
function createHighscoreEntry(name, score) {
  return {
    id: createHighscoreEntryId(),
    name: name,
    score: score,
    createdAt: Date.now()
  };
}

/** Creates a sufficiently unique local identifier for one score entry. */
function createHighscoreEntryId() {
  return Date.now().toString(36) + "-" +
    Math.random().toString(36).slice(2, 10);
}

/** Stores one score, trims the table to 100 entries, and marks the new row. */
function storeHighscore(name, score) {
  initializeHighscoreStorage();
  var entry = createHighscoreEntry(name, score);
  var list = readHighscores();
  list.push(entry);
  sortHighscores(list);
  list = list.slice(0, HIGHSCORE_LIMIT);
  localStorage.setItem("highScoreTable", JSON.stringify(list));
  localStorage.setItem("newHighscoreEntry", JSON.stringify(entry));
  showHighscoreSavedOverlay();
}

/** Opens the shared Top-100 overlay for menu, Game Over, or Victory. */
function openHighscore(context) {
  initializeHighscoreStorage();
  highscoreFlowContext = context || "menu";
  renderHighscoreTable();
  renderHighscoreActions();
  var overlay = document.getElementById("highscoreOverlay");
  if (overlay) overlay.style.display = "flex";
  scrollToNewestHighscore();
}

/** Rebuilds the shared Top-100 table from local storage. */
function renderHighscoreTable() {
  var content = document.getElementById("highscoreContent");
  if (!content) return;
  content.replaceChildren();
  var list = readHighscores();
  if (list.length === 0) {
    renderEmptyHighscore(content);
    return;
  }
  appendHighscoreRows(content, list, readNewestHighscoreEntry());
}

/** Renders the empty-table message. */
function renderEmptyHighscore(content) {
  var message = document.createElement("p");
  message.textContent = "No high score available.";
  content.appendChild(message);
}

/** Adds all score rows to the scrollable list. */
function appendHighscoreRows(content, list, newestEntry) {
  var container = document.createElement("div");
  container.className = "highscoreList";
  for (var i = 0; i < list.length; i++) {
    container.appendChild(createHighscoreRow(list[i], i, newestEntry));
  }
  content.appendChild(container);
}

/** Creates one safe DOM row without injecting the player name as HTML. */
function createHighscoreRow(entry, index, newestEntry) {
  var row = document.createElement("div");
  row.className = "highscoreRow";
  if (isNewestHighscoreEntry(entry, newestEntry)) row.classList.add("isNew");
  row.appendChild(createHighscoreCell("highscoreRank", index + 1 + "."));
  row.appendChild(createHighscoreCell("highscoreName", entry.name || "Player"));
  row.appendChild(createHighscoreCell("highscoreScore", (entry.score || 0) + " Points"));
  return row;
}

/** Creates one text-only highscore cell. */
function createHighscoreCell(className, text) {
  var cell = document.createElement("span");
  cell.className = className;
  cell.textContent = text;
  return cell;
}

/** Checks the persistent ID instead of ambiguous name and score values. */
function isNewestHighscoreEntry(entry, newestEntry) {
  return !!(newestEntry && newestEntry.id && entry.id === newestEntry.id);
}

/** Scrolls the shared list so a newly stored placement is immediately visible. */
function scrollToNewestHighscore() {
  var content = document.getElementById("highscoreContent");
  if (!content) return;
  var row = content.querySelector(".highscoreRow.isNew");
  if (!row) return;
  setTimeout(function () {
    row.scrollIntoView({ block: "center" });
  }, 0);
}

/** Builds context-specific actions below the shared Top-100 list. */
function renderHighscoreActions() {
  var actions = document.getElementById("highscoreActions");
  if (!actions) return;
  actions.replaceChildren();
  if (highscoreFlowContext === "victory") {
    actions.appendChild(createHighscoreAction("Play again", restartAfterVictoryHighscore));
    actions.appendChild(createHighscoreAction("Menu", returnToMenuAfterVictoryHighscore));
    return;
  }
  actions.appendChild(createHighscoreAction("Close", closeHighscore));
}

/** Creates one reusable highscore action button. */
function createHighscoreAction(label, handler) {
  var button = document.createElement("button");
  button.className = "highscoreActionButton";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", handler);
  return button;
}

/** Ignores Victory backdrop clicks but closes menu and Game Over views. */
function handleHighscoreBackdropClick() {
  if (highscoreFlowContext === "victory") return;
  closeHighscore();
}

/** Hides the shared highscore and clears its temporary row marker. */
function closeHighscore() {
  var overlay = document.getElementById("highscoreOverlay");
  if (overlay) overlay.style.display = "none";
  clearNewestHighscoreEntry();
}

/** Restarts a fresh run from the Victory highscore view. */
function restartAfterVictoryHighscore() {
  hideHighscoreOverlay();
  clearNewestHighscoreEntry();
  if (window.world) window.world.restartGame();
}

/** Returns to the start menu from the Victory highscore view. */
function returnToMenuAfterVictoryHighscore() {
  hideHighscoreOverlay();
  clearNewestHighscoreEntry();
  if (window.world) window.world.returnToMenu();
}

/** Hides the shared highscore without changing the current game flow. */
function hideHighscoreOverlay() {
  var overlay = document.getElementById("highscoreOverlay");
  if (overlay) overlay.style.display = "none";
}

/** Opens player-name entry for a qualifying score. */
function openHighscoreNameDialog(score, context) {
  if (highscoreHandledForCurrentGame ||
    document.getElementById("highscoreNameOverlay")) return;
  highscoreHandledForCurrentGame = true;
  highscoreFlowContext = context || "gameover";
  document.body.appendChild(createHighscoreNameOverlay(score));
  focusHighscoreNameInput();
}

/** Builds the player-name overlay and its actions. */
function createHighscoreNameOverlay(score) {
  var overlay = document.createElement("div");
  overlay.id = "highscoreNameOverlay";
  overlay.innerHTML =
    '<div id="highscoreNameBox">' +
    '<h2>🏆 New Highscore!</h2>' +
    '<p>Your score: <strong>' + score + '</strong></p>' +
    '<input id="highscoreNameInput" type="text" maxlength="16" placeholder="Your name" />' +
    '<div id="highscoreNameActions">' +
    '<button class="menuButton" type="button" id="saveHighscoreNameButton">Save</button>' +
    '<button class="menuButton" type="button" id="cancelHighscoreNameButton">Cancel</button>' +
    '</div></div>';
  bindHighscoreNameActions(overlay, score);
  return overlay;
}

/** Connects the Save and Cancel buttons without inline score handlers. */
function bindHighscoreNameActions(overlay, score) {
  var saveButton = overlay.querySelector("#saveHighscoreNameButton");
  var cancelButton = overlay.querySelector("#cancelHighscoreNameButton");
  if (saveButton) saveButton.addEventListener("click", function () {
    submitHighscoreName(score);
  });
  if (cancelButton) cancelButton.addEventListener("click", cancelHighscoreNameDialog);
}

/** Focuses the name input after the overlay was added to the document. */
function focusHighscoreNameInput() {
  setTimeout(function () {
    var input = document.getElementById("highscoreNameInput");
    if (input) input.focus();
  }, 50);
}

/** Validates and stores the entered player name. */
function submitHighscoreName(score) {
  var overlay = document.getElementById("highscoreNameOverlay");
  var input = document.getElementById("highscoreNameInput");
  if (!overlay || !input || overlay.dataset.submitted === "true") return;
  var name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }
  overlay.dataset.submitted = "true";
  storeHighscore(name, score);
  removeHighscoreNameDialog();
}

/** Cancels storage and continues the normal terminal flow. */
function cancelHighscoreNameDialog() {
  removeHighscoreNameDialog();
  if (highscoreFlowContext === "victory") openHighscore("victory");
}

/** Removes the player-name overlay. */
function removeHighscoreNameDialog() {
  var overlay = document.getElementById("highscoreNameOverlay");
  if (overlay) overlay.remove();
}

/** Shows confirmation after a score was stored. */
function showHighscoreSavedOverlay() {
  var overlay = document.getElementById("highscoreSavedOverlay");
  if (overlay) overlay.style.display = "flex";
  var button = document.getElementById("closeHighscoreSavedButton");
  if (button) button.focus();
}

/** Opens the shared highscore after saved-score confirmation. */
function closeHighscoreSaved() {
  var overlay = document.getElementById("highscoreSavedOverlay");
  if (overlay) overlay.style.display = "none";
  openHighscore(highscoreFlowContext);
}

