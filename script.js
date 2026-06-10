const STORAGE_KEY = "wc2026_predictor_2026_v2";
const SESSION_STORAGE_KEY = "wc2026_predictor_session_v1";
const SHARED_STATE_ENDPOINTS = ["api/shared-state", "storage.php"];
const SHARED_SYNC_INTERVAL_MS = 5000;
const ADMIN_PASSWORD = "ziko97";

const MATCH_SCORING = {
  correctResult: 5,
  goalDifference: 1
};

const GROUP_SCORING = {
  correctQualifiedTeams: 5,
  correctOrder: 8
};

const BEST_THIRD_QUALIFIERS_COUNT = 8;

const ROUND_FILTER_OPTIONS = [
  { value: "all", label: "All Matches" },
  { value: "Group Stage - Round 1", label: "Group Stage - Round 1" },
  { value: "Group Stage - Round 2", label: "Group Stage - Round 2" },
  { value: "Group Stage - Round 3", label: "Group Stage - Round 3" },
  { value: "Round of 32", label: "Round of 32" },
  { value: "Round of 16", label: "Round of 16" },
  { value: "Quarter Finals", label: "Quarter Finals" },
  { value: "Semi Finals", label: "Semi Finals" },
  { value: "Third Place Match", label: "Third Place Match" },
  { value: "Final", label: "Final" }
];

const scheduleSource = normalizeWorldCupData(
  typeof worldCupData !== "undefined" ? worldCupData : (globalThis.worldCupData || {})
);
const remoteStorageConfig = normalizeRemoteStorageConfig(globalThis.WC2026_CONFIG?.remoteStorage || {});

const dom = {
  startPredictionsBtn: document.getElementById("startPredictionsBtn"),
  syncBanner: document.getElementById("syncBanner"),
  statPlayers: document.getElementById("statPlayers"),
  statPredictions: document.getElementById("statPredictions"),
  statRound: document.getElementById("statRound"),
  statLeader: document.getElementById("statLeader"),
  loginPanel: document.querySelector(".login-panel"),
  loginForm: document.getElementById("loginForm"),
  welcomeCard: document.getElementById("welcomeCard"),
  heroLogoRail: document.getElementById("heroLogoRail"),
  roundFilter: document.getElementById("roundFilter"),
  groupFilter: document.getElementById("groupFilter"),
  statusFilter: document.getElementById("statusFilter"),
  matchesContainer: document.getElementById("matchesContainer"),
  groupsContainer: document.getElementById("groupsContainer"),
  playerSearchInput: document.getElementById("playerSearchInput"),
  podium: document.getElementById("podium"),
  leaderboardPanel: document.getElementById("leaderboardPanel"),
  leaderboardBody: document.getElementById("leaderboardBody"),
  historyContainer: document.getElementById("historyContainer"),
  adminGate: document.getElementById("adminGate"),
  adminWorkspace: document.getElementById("adminWorkspace"),
  toastStack: document.getElementById("toastStack"),
  particleField: document.getElementById("particleField")
};

const uiState = {
  leaderboardFlashUntil: 0,
  timerId: null,
  syncTimerId: null
};

const persistence = {
  backendAvailable: false,
  revision: 0,
  endpoint: "",
  etag: "",
  backendKind: "",
  status: "pending",
  message: "Connecting to shared storage..."
};

let state = createDefaultState();
let sessionState = loadSessionState();

init();

async function init() {
  buildParticles();
  renderHeroAtmosphere();
  renderSyncBanner();
  bindEvents();
  await hydrateState();
  recalculatePoints();
  populateMatchFilters();
  renderAll();
  startCountdownLoop();
  startSharedSyncLoop();
}

function createDefaultState() {
  return {
    players: [],
    groups: scheduleSource.groups.map(cloneObject),
    matches: scheduleSource.matches.map(cloneObject),
    matchPredictions: [],
    groupPredictions: [],
    scheduleVersion: scheduleSource.version
  };
}

function loadLocalSharedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    return normalizeStoredState(JSON.parse(raw));
  } catch (error) {
    console.warn("Could not load the local fallback state. Resetting to defaults.", error);
    return createDefaultState();
  }
}

function saveLocalSharedState(nextState = state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

function loadSessionState() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return createDefaultSessionState();
    }

    const parsed = JSON.parse(raw);
    return {
      activePlayerId: String(parsed?.activePlayerId || ""),
      adminUnlocked: Boolean(parsed?.adminUnlocked)
    };
  } catch (error) {
    console.warn("Could not load the local session. Resetting to defaults.", error);
    return createDefaultSessionState();
  }
}

function createDefaultSessionState() {
  return {
    activePlayerId: "",
    adminUnlocked: false
  };
}

function saveSessionState() {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionState));
}

function normalizeStoredState(parsed) {
  const baseState = {
    players: Array.isArray(parsed.players) ? parsed.players.map(normalizePlayer) : [],
    groups: scheduleSource.groups.map(cloneObject),
    matches: scheduleSource.matches.map(cloneObject),
    matchPredictions: Array.isArray(parsed.matchPredictions) ? parsed.matchPredictions : [],
    groupPredictions: Array.isArray(parsed.groupPredictions) ? parsed.groupPredictions : [],
    scheduleVersion: scheduleSource.version
  };

  const scheduleChanged = parsed.scheduleVersion !== scheduleSource.version;
  if (!scheduleChanged) {
    baseState.groups = Array.isArray(parsed.groups) && parsed.groups.length
      ? parsed.groups.map((group) => normalizeGroup(group, scheduleSource.groupLookup))
      : scheduleSource.groups.map(cloneObject);
    baseState.matches = Array.isArray(parsed.matches) && parsed.matches.length
      ? parsed.matches.map((match, index) => normalizeMatch(match, index, scheduleSource.groupLookup))
      : scheduleSource.matches.map(cloneObject);
  }

  syncGroupPredictionDeadlines(baseState.groups, baseState.matches);
  reconcilePredictions(baseState);
  return baseState;
}

function reconcilePredictions(nextState) {
  const validMatchIds = new Set(nextState.matches.map((match) => String(match.id)));
  const validGroupIds = new Set(nextState.groups.map((group) => String(group.id)));
  const validPlayerIds = new Set(nextState.players.map((player) => String(player.id)));

  nextState.matchPredictions = nextState.matchPredictions
    .filter((prediction) => validMatchIds.has(String(prediction.matchId)) && validPlayerIds.has(String(prediction.playerId)))
    .map((prediction) => ({
      ...prediction,
      matchId: String(prediction.matchId),
      playerId: String(prediction.playerId)
    }));

  nextState.groupPredictions = nextState.groupPredictions
    .filter((prediction) => validGroupIds.has(String(prediction.groupId)) && validPlayerIds.has(String(prediction.playerId)))
    .map((prediction) => ({
      ...prediction,
      groupId: String(prediction.groupId),
      playerId: String(prediction.playerId),
      predictedThird: String(prediction.predictedThird || ""),
      predictedThirdQualifies: Boolean(prediction.predictedThirdQualifies)
    }));
}

function reconcileSessionState() {
  const validPlayerIds = new Set(state.players.map((player) => String(player.id)));
  if (!validPlayerIds.has(sessionState.activePlayerId)) {
    sessionState.activePlayerId = "";
  }
  saveSessionState();
}

async function hydrateState(options = {}) {
  const response = await fetchSharedState(options);
  if (!response) {
    state = loadLocalSharedState();
    reconcileSessionState();
    recalculatePoints();
    return;
  }

  persistence.backendAvailable = true;
  persistence.revision = Number(response.revision || 0);
  setPersistenceStatus("connected", "Shared storage connected. All devices see the same players and admin updates.");
  state = response.state ? normalizeStoredState(response.state) : createDefaultState();

  if (!response.state) {
    const initialized = await commitSharedState(state, 0, options);
    if (initialized?.ok) {
      persistence.revision = initialized.revision;
      state = normalizeStoredState(initialized.state);
    }
  }

  saveLocalSharedState(state);
  reconcileSessionState();
  recalculatePoints();
}

async function fetchSharedState({ silent = false } = {}) {
  let lastError = null;

  for (const backend of getSharedStateEndpointCandidates()) {
    try {
      const result = await readFromSharedBackend(backend);
      if (!result.payload.ok) {
        throw new Error(result.payload.message || "Shared storage response was not successful.");
      }

      persistence.endpoint = backend.id;
      persistence.backendKind = backend.kind;
      persistence.etag = result.etag || "";
      persistence.backendAvailable = true;
      setPersistenceStatus("connected", getConnectedStorageMessage(backend));
      return result.payload;
    } catch (error) {
      lastError = error;
    }
  }

  persistence.backendAvailable = false;
  setPersistenceStatus("disconnected", getSharedStorageUnavailableMessage());
  if (!silent) {
    console.warn("Shared storage is unavailable.", lastError);
    showToast(getSharedStorageUnavailableMessage(), "error");
  }
  return null;
}

async function commitSharedState(nextState, baseRevision, { silent = false } = {}) {
  let lastError = null;

  for (const backend of getSharedStateEndpointCandidates()) {
    try {
      const payload = await writeToSharedBackend(backend, nextState, baseRevision);
      if (!payload.ok || payload.conflict) {
        if (payload?.conflict) {
          persistence.endpoint = backend.id;
          persistence.backendKind = backend.kind;
          persistence.etag = payload.etag || persistence.etag;
          persistence.backendAvailable = true;
          setPersistenceStatus("connected", getConnectedStorageMessage(backend));
        } else if (!payload.ok) {
          lastError = new Error(payload.message || "Shared storage write failed.");
          continue;
        }
        return payload;
      }

      persistence.endpoint = backend.id;
      persistence.backendKind = backend.kind;
      persistence.etag = payload.etag || "";
      persistence.backendAvailable = true;
      setPersistenceStatus("connected", getConnectedStorageMessage(backend));
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  persistence.backendAvailable = false;
  setPersistenceStatus("disconnected", getSharedStorageUnavailableMessage());
  if (!silent) {
    console.warn("Could not save to shared storage.", lastError);
    showToast(getSharedStorageUnavailableMessage(), "error");
  }
  return null;
}

async function applySharedMutation(mutator, options = {}) {
  if (!persistence.backendAvailable) {
    const remote = await fetchSharedState({ silent: true });
    if (remote) {
      persistence.revision = Number(remote.revision || 0);
      state = remote.state ? normalizeStoredState(remote.state) : createDefaultState();
      saveLocalSharedState(state);
      reconcileSessionState();
      recalculatePoints();
      renderAll();
    } else {
      const error = new Error(getSharedStorageUnavailableMessage());
      showToast(error.message, "error");
      return { ok: false, error };
    }
  }

  const maxAttempts = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const sourceState = cloneObject(state);
    const draftState = normalizeStoredState(sourceState);
    let result;

    try {
      result = mutator(draftState);
    } catch (error) {
      if (error?.message) {
        showToast(error.message, "error");
      }
      return { ok: false, error };
    }

    reconcilePredictions(draftState);
    recalculatePoints(draftState);

    const saved = await commitSharedState(draftState, persistence.revision, options);
    if (saved?.ok) {
      persistence.revision = Number(saved.revision || persistence.revision);
      state = normalizeStoredState(saved.state);
      saveLocalSharedState(state);
      reconcileSessionState();
      recalculatePoints();
      return { ok: true, result, state };
    }

    if (saved?.conflict) {
      persistence.revision = Number(saved.revision || persistence.revision);
      state = normalizeStoredState(saved.state);
      saveLocalSharedState(state);
      reconcileSessionState();
      recalculatePoints();
      lastError = new Error("Shared data changed. Retrying with the latest version.");
      continue;
    }

    lastError = saved ? new Error(saved.message || "Could not save shared state.") : new Error("Could not save shared state.");
    break;
  }

  if (persistence.backendAvailable) {
    await hydrateState({ silent: true });
  }

  if (lastError?.message) {
    showToast(lastError.message, "error");
  }
  return { ok: false, error: lastError };
}

function startSharedSyncLoop() {
  if (uiState.syncTimerId) {
    window.clearInterval(uiState.syncTimerId);
  }

  uiState.syncTimerId = window.setInterval(() => {
    void syncSharedState();
  }, SHARED_SYNC_INTERVAL_MS);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void syncSharedState({ silent: true });
    }
  });

  window.addEventListener("focus", () => {
    void syncSharedState({ silent: true });
  });

  window.addEventListener("pageshow", () => {
    void syncSharedState({ silent: true });
  });

  window.addEventListener("online", () => {
    void syncSharedState({ silent: true });
  });
}

function shouldDeferSharedRefresh() {
  const activeElement = document.activeElement;
  return Boolean(activeElement?.closest(".match-form, .group-form, .admin-match-form, .admin-group-form"));
}

async function syncSharedState({ silent = true } = {}) {
  if (shouldDeferSharedRefresh()) {
    return;
  }

  const remote = await fetchSharedState({ silent });
  if (!remote || Number(remote.revision || 0) === persistence.revision) {
    return;
  }

  persistence.revision = Number(remote.revision || persistence.revision);
  state = normalizeStoredState(remote.state || createDefaultState());
  saveLocalSharedState(state);
  reconcileSessionState();
  recalculatePoints();
  populateMatchFilters();
  renderAll();
}

function bindEvents() {
  dom.startPredictionsBtn.addEventListener("click", () => {
    const targetId = getActivePlayer() ? "matches" : "login";
    document.getElementById(targetId).scrollIntoView({ behavior: "smooth", block: "start" });
  });

  dom.roundFilter.addEventListener("change", renderMatches);
  dom.groupFilter.addEventListener("change", renderMatches);
  dom.statusFilter.addEventListener("change", renderMatches);
  dom.playerSearchInput.addEventListener("input", () => {
    renderLeaderboard();
    renderHistory();
  });

  document.addEventListener("submit", (event) => {
    void handleSubmit(event);
  });
  document.addEventListener("click", (event) => {
    void handleClick(event);
  });
  document.addEventListener("change", handleChange);
}

async function handleSubmit(event) {
  const form = event.target;

  if (form.id === "loginForm") {
    event.preventDefault();
    await handleLogin(form);
    return;
  }

  if (form.matches(".match-form")) {
    event.preventDefault();
    await handleMatchPrediction(form);
    return;
  }

  if (form.matches(".group-form")) {
    event.preventDefault();
    await handleGroupPrediction(form);
    return;
  }

  if (form.matches(".admin-login-form")) {
    event.preventDefault();
    handleAdminLogin(form);
    return;
  }

  if (form.matches(".admin-match-form")) {
    event.preventDefault();
    await handleAdminMatchUpdate(form);
    return;
  }

  if (form.matches(".admin-group-form")) {
    event.preventDefault();
    await handleAdminGroupUpdate(form);
  }
}

async function handleClick(event) {
  const target = event.target;

  if (target.matches("[data-action='calculate-points']")) {
    recalculatePoints();
    uiState.leaderboardFlashUntil = Date.now() + 1500;
    renderAll();
    showToast("Points calculated", "success");
    return;
  }

  if (target.matches("[data-action='reset-data']")) {
    const confirmed = window.confirm("Reset all players, predictions, and results?");
    if (!confirmed) {
      return;
    }

    const result = await applySharedMutation((draftState) => {
      const nextState = createDefaultState();
      draftState.players = nextState.players;
      draftState.groups = nextState.groups;
      draftState.matches = nextState.matches;
      draftState.matchPredictions = nextState.matchPredictions;
      draftState.groupPredictions = nextState.groupPredictions;
      draftState.scheduleVersion = nextState.scheduleVersion;
    });
    if (!result.ok) {
      return;
    }

    sessionState = createDefaultSessionState();
    saveSessionState();
    populateMatchFilters();
    renderAll();
    showToast("All data has been reset", "info");
    return;
  }

  if (target.matches("[data-action='export-leaderboard']")) {
    exportLeaderboard();
    return;
  }

  if (target.matches("[data-action='lock-admin']")) {
    sessionState.adminUnlocked = false;
    saveSessionState();
    renderAdmin();
  }
}

function handleChange(event) {
  if (event.target.id === "importMatchesInput") {
    void importMatchesFromFile(event.target.files?.[0]);
    return;
  }

  const groupForm = event.target.closest(".group-form");
  if (groupForm) {
    if (event.target.matches('select[name="predictedFirst"], select[name="predictedSecond"], select[name="predictedThird"]')) {
      ensureUniqueGroupSelection(groupForm, event.target);
    }
    syncGroupFormState(groupForm);
  }
}

async function handleLogin(form) {
  const formData = new FormData(form);
  const rawName = String(formData.get("playerName") || "").replace(/\s+/g, " ").trim();
  const playerPin = normalizePlayerPin(formData.get("playerPin"));

  if (!rawName) {
    showToast("Player name is required", "error");
    return;
  }

  if (!isValidPlayerPin(playerPin)) {
    showToast("PIN must be exactly 4 digits", "error");
    return;
  }

  const result = await applySharedMutation((draftState) => {
    const existingPlayer = draftState.players.find((player) => normalizeName(player.name) === normalizeName(rawName));
    let player = existingPlayer;

    if (!player) {
      player = {
        id: createId("player"),
        name: rawName,
        pin: playerPin,
        totalPoints: 0,
        matchPoints: 0,
        groupPoints: 0,
        exactScores: 0,
        createdAt: new Date().toISOString(),
        lastPredictionTime: null
      };
      draftState.players.push(player);
    } else if (!player.pin) {
      player.pin = playerPin;
    } else if (player.pin !== playerPin) {
      throw new Error("Wrong PIN for this player");
    }

    return {
      playerId: player.id,
      existingPlayer: Boolean(existingPlayer)
    };
  });

  if (!result.ok) {
    return;
  }

  sessionState.activePlayerId = result.result.playerId;
  saveSessionState();
  renderAll();
  form.reset();
  showToast(result.result.existingPlayer ? "Welcome back" : "Player saved", "success");
}

async function handleMatchPrediction(form) {
  const player = getActivePlayer();
  if (!player) {
    showToast("Log in to save predictions", "error");
    document.getElementById("login").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const matchId = String(form.dataset.matchId || "");
  const match = state.matches.find((item) => String(item.id) === matchId);
  if (!match) {
    showToast("Match not found", "error");
    return;
  }

  if (!isPredictionOpen(match.predictionDeadline)) {
    showToast("Deadline passed", "error");
    renderMatches();
    return;
  }

  const formData = new FormData(form);
  const predictedScoreA = parseScoreInput(formData.get("predictedScoreA"));
  const predictedScoreB = parseScoreInput(formData.get("predictedScoreB"));

  if (predictedScoreA === null || predictedScoreB === null) {
    showToast("Scores must be numbers 0 or higher", "error");
    return;
  }

  const now = new Date().toISOString();
  const result = await applySharedMutation((draftState) => {
    const draftPlayer = draftState.players.find((item) => item.id === player.id);
    const draftMatch = draftState.matches.find((item) => String(item.id) === matchId);
    const existingPrediction = getMatchPrediction(player.id, matchId, draftState);

    if (!draftPlayer) {
      throw new Error("Player session expired. Please log in again.");
    }

    if (!draftMatch) {
      throw new Error("Match not found");
    }

    if (!isPredictionOpen(draftMatch.predictionDeadline)) {
      throw new Error("Deadline passed");
    }

    if (existingPrediction) {
      throw new Error("You can submit only once for this match");
    }

    draftState.matchPredictions.push({
      id: createId("mp"),
      playerId: draftPlayer.id,
      playerName: draftPlayer.name,
      matchId,
      predictedScoreA,
      predictedScoreB,
      submittedAt: now,
      points: 0
    });
  });

  if (!result.ok) {
    return;
  }

  renderAll();
  showToast("Prediction saved", "success");
}

async function handleGroupPrediction(form) {
  const player = getActivePlayer();
  if (!player) {
    showToast("Log in to save predictions", "error");
    document.getElementById("login").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const groupId = String(form.dataset.groupId || "");
  const group = state.groups.find((item) => String(item.id) === groupId);
  if (!group) {
    showToast("Group not found", "error");
    return;
  }

  if (!isPredictionOpen(group.predictionDeadline)) {
    showToast("Deadline passed", "error");
    renderGroups();
    return;
  }

  const formData = new FormData(form);
  const predictedFirst = String(formData.get("predictedFirst") || "").trim();
  const predictedSecond = String(formData.get("predictedSecond") || "").trim();
  const predictedThird = String(formData.get("predictedThird") || "").trim();
  const predictedThirdQualifies = formData.get("predictedThirdQualifies") === "on";

  if (!predictedFirst || !predictedSecond || !predictedThird) {
    showToast("Select 1st, 2nd, and 3rd place", "error");
    return;
  }

  if (!hasUniqueSelections([predictedFirst, predictedSecond, predictedThird])) {
    showToast("Each ranking position must have a different team", "error");
    return;
  }

  const now = new Date().toISOString();
  const result = await applySharedMutation((draftState) => {
    const draftPlayer = draftState.players.find((item) => item.id === player.id);
    const draftGroup = draftState.groups.find((item) => String(item.id) === groupId);
    const existingPrediction = getGroupPrediction(player.id, groupId, draftState);

    if (!draftPlayer) {
      throw new Error("Player session expired. Please log in again.");
    }

    if (!draftGroup) {
      throw new Error("Group not found");
    }

    if (!isPredictionOpen(draftGroup.predictionDeadline)) {
      throw new Error("Deadline passed");
    }

    if (predictedThirdQualifies && countPlayerBestThirdSelections(player.id, groupId, draftState) >= BEST_THIRD_QUALIFIERS_COUNT) {
      throw new Error(`You can only qualify ${BEST_THIRD_QUALIFIERS_COUNT} third-placed teams`);
    }

    if (existingPrediction) {
      throw new Error("You can submit only once for this group");
    }

    draftState.groupPredictions.push({
      id: createId("gp"),
      playerId: draftPlayer.id,
      playerName: draftPlayer.name,
      groupId,
      predictedFirst,
      predictedSecond,
      predictedThird,
      predictedThirdQualifies,
      submittedAt: now,
      points: 0
    });
  });

  if (!result.ok) {
    return;
  }

  renderAll();
  showToast("Prediction saved", "success");
}

function handleAdminLogin(form) {
  const password = String(new FormData(form).get("password") || "");
  if (password !== ADMIN_PASSWORD) {
    showToast("Wrong password", "error");
    return;
  }

  sessionState.adminUnlocked = true;
  saveSessionState();
  renderAdmin();
  showToast("Admin login success", "success");
}

async function handleAdminMatchUpdate(form) {
  const matchId = String(form.dataset.matchId || "");
  const match = state.matches.find((item) => String(item.id) === matchId);
  if (!match) {
    showToast("Match not found", "error");
    return;
  }

  const formData = new FormData(form);
  const matchDateRaw = String(formData.get("matchDate") || "").trim();
  const deadlineRaw = String(formData.get("predictionDeadline") || "").trim();
  const actualScoreAValue = String(formData.get("actualScoreA") || "").trim();
  const actualScoreBValue = String(formData.get("actualScoreB") || "").trim();
  const isFinished = formData.get("isFinished") === "on";

  if (!matchDateRaw) {
    showToast("Match date is required", "error");
    return;
  }

  const matchDate = parseDateTimeLocal(matchDateRaw);
  const predictionDeadline = deadlineRaw ? parseDateTimeLocal(deadlineRaw) : calculateDeadlineFromMatchDate(matchDate);
  const actualScoreA = actualScoreAValue === "" ? null : parseScoreInput(actualScoreAValue);
  const actualScoreB = actualScoreBValue === "" ? null : parseScoreInput(actualScoreBValue);

  if (!matchDate || !predictionDeadline) {
    showToast("Match date or deadline is invalid", "error");
    return;
  }

  if ((actualScoreAValue !== "" && actualScoreA === null) || (actualScoreBValue !== "" && actualScoreB === null)) {
    showToast("Actual scores must be numbers 0 or higher", "error");
    return;
  }

  if (isFinished && (actualScoreA === null || actualScoreB === null)) {
    showToast("Finished matches need both actual scores", "error");
    return;
  }

  const result = await applySharedMutation((draftState) => {
    const draftMatch = draftState.matches.find((item) => String(item.id) === matchId);
    if (!draftMatch) {
      throw new Error("Match not found");
    }

    draftMatch.matchDate = matchDate;
    draftMatch.predictionDeadline = predictionDeadline;
    draftMatch.actualScoreA = actualScoreA;
    draftMatch.actualScoreB = actualScoreB;
    draftMatch.isFinished = isFinished;

    syncGroupPredictionDeadlines(draftState.groups, draftState.matches);
  });

  if (!result.ok) {
    return;
  }

  renderAll();
  showToast("Match result updated", "success");
}

async function handleAdminGroupUpdate(form) {
  const groupId = String(form.dataset.groupId || "");
  const group = state.groups.find((item) => String(item.id) === groupId);
  if (!group) {
    showToast("Group not found", "error");
    return;
  }

  const formData = new FormData(form);
  const actualFirst = String(formData.get("actualFirst") || "").trim();
  const actualSecond = String(formData.get("actualSecond") || "").trim();
  const actualThird = String(formData.get("actualThird") || "").trim();
  const actualThirdQualifies = formData.get("actualThirdQualifies") === "on";

  const rankedTeams = [actualFirst, actualSecond, actualThird].filter(Boolean);
  if (rankedTeams.length > 0 && rankedTeams.length < 3) {
    showToast("Set all top 3 places or clear them", "error");
    return;
  }

  if (!hasUniqueSelections(rankedTeams)) {
    showToast("Group ranking positions must be different teams", "error");
    return;
  }

  const result = await applySharedMutation((draftState) => {
    const draftGroup = draftState.groups.find((item) => String(item.id) === groupId);
    if (!draftGroup) {
      throw new Error("Group not found");
    }

    if (actualThird && actualThirdQualifies && countActualBestThirdSelections(groupId, draftState) >= BEST_THIRD_QUALIFIERS_COUNT) {
      throw new Error(`Only ${BEST_THIRD_QUALIFIERS_COUNT} third-placed teams can qualify`);
    }

    draftGroup.actualFirst = actualFirst || null;
    draftGroup.actualSecond = actualSecond || null;
    draftGroup.actualThird = actualThird || null;
    draftGroup.actualThirdQualifies = actualThird ? actualThirdQualifies : null;
  });

  if (!result.ok) {
    return;
  }

  renderAll();
  showToast("Group ranking updated", "success");
}

function renderAll() {
  renderStats();
  renderWelcomeCard();
  renderMatches();
  renderGroups();
  renderLeaderboard();
  renderHistory();
  renderAdmin();
}

function renderStats() {
  const leaderboard = getLeaderboard();
  dom.statPlayers.textContent = String(state.players.length);
  dom.statPredictions.textContent = String(state.matchPredictions.length + state.groupPredictions.length);
  dom.statRound.textContent = getCurrentRoundLabel();
  dom.statLeader.textContent = leaderboard[0] ? leaderboard[0].name : "No leader yet";
}

function renderWelcomeCard() {
  const player = getActivePlayer();
  const syncNote = persistence.backendAvailable
    ? ""
    : `<br><span class="sync-inline-warning">Shared sync is offline on this device.</span>`;

  if (!player) {
    dom.loginPanel?.classList.remove("is-logged-in");
    dom.loginForm?.classList.remove("is-collapsed");
    dom.welcomeCard.innerHTML = `
      <p class="welcome-title">No player signed in</p>
      <p class="welcome-text">Log in with your player name and private PIN to save predictions before the deadline.${syncNote}</p>
    `;
    return;
  }

  const playerRank = getPlayerRank(player.id);
  dom.welcomeCard.innerHTML = `
    <p class="welcome-title">Welcome, ${escapeHtml(player.name)}</p>
    <p class="welcome-text">
      Total points: <strong>${player.totalPoints}</strong><br>
      Rank: <strong>${playerRank ? `#${playerRank}` : "Unranked"}</strong>${syncNote}
    </p>
  `;
  dom.loginPanel?.classList.add("is-logged-in");
  dom.loginForm?.classList.add("is-collapsed");
}

function renderSyncBanner() {
  if (!dom.syncBanner) {
    return;
  }

  dom.syncBanner.textContent = persistence.message;
  dom.syncBanner.className = `sync-banner sync-banner-${persistence.status}`;
}

function setPersistenceStatus(status, message) {
  persistence.status = status;
  persistence.message = message;
  renderSyncBanner();
}

function getSharedStorageUnavailableMessage() {
  if (remoteStorageConfig.provider === "firebase-rest" && !remoteStorageConfig.firebaseDatabaseUrl) {
    return "Shared storage is not configured yet. Add your Firebase Realtime Database URL in app-config.js.";
  }

  if (remoteStorageConfig.provider === "firebase-rest") {
    return "Shared storage offline. Check your Firebase database URL, database rules, and optional auth token.";
  }

  if (window.location.hostname.endsWith("github.io")) {
    return "Shared storage is not configured for GitHub Pages yet. Add Firebase settings in app-config.js.";
  }

  if (window.location.protocol === "file:") {
    return "Shared storage offline. Open the app through server.py or PHP, not file://.";
  }

  if (window.location.port === "5500" || window.location.port === "5501") {
    return "Shared storage offline. Live Server does not run the project backend. Use server.py or Apache/PHP.";
  }

  return "Shared storage offline. Start the project through `python3 server.py` on its own URL, or make sure storage.php is running.";
}

function getSharedStateEndpointCandidates() {
  const candidates = [];

  if (remoteStorageConfig.provider === "firebase-rest" && remoteStorageConfig.firebaseDatabaseUrl) {
    candidates.push({
      id: `firebase-rest:${remoteStorageConfig.firebaseDatabaseUrl}`,
      kind: "firebase-rest",
      databaseUrl: remoteStorageConfig.firebaseDatabaseUrl,
      auth: remoteStorageConfig.firebaseAuth,
      statePath: remoteStorageConfig.firebaseStatePath
    });
  }

  SHARED_STATE_ENDPOINTS.forEach((endpoint) => {
    candidates.push({
      id: `http-json:${endpoint}`,
      kind: "http-json",
      endpoint
    });
  });

  if (!persistence.endpoint) {
    return candidates;
  }

  const preferred = candidates.find((candidate) => candidate.id === persistence.endpoint);
  if (!preferred) {
    return candidates;
  }

  return [preferred].concat(candidates.filter((candidate) => candidate.id !== persistence.endpoint));
}

async function readFromSharedBackend(backend) {
  if (backend.kind === "firebase-rest") {
    const response = await fetch(buildFirebaseStateUrl(backend), {
      cache: "no-store",
      headers: {
        "X-Firebase-ETag": "true"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    return {
      payload: payload === null ? buildDefaultEnvelope() : payload,
      etag: extractEtag(response)
    };
  }

  const response = await fetch(buildSharedStateGetUrl(backend.endpoint), {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return {
    payload: await response.json(),
    etag: ""
  };
}

async function writeToSharedBackend(backend, nextState, baseRevision) {
  if (backend.kind === "firebase-rest") {
    return writeToFirebaseBackend(backend, nextState, baseRevision);
  }

  const response = await fetch(backend.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "replaceState",
      baseRevision,
      state: nextState
    })
  });

  return response.json();
}

async function writeToFirebaseBackend(backend, nextState, baseRevision) {
  let etag = persistence.endpoint === backend.id ? persistence.etag : "";

  if (!etag) {
    const current = await readFromSharedBackend(backend);
    etag = current.etag || "";
  }

  const nextEnvelope = {
    ok: true,
    revision: baseRevision + 1,
    updatedAt: new Date().toISOString(),
    state: nextState
  };

  const headers = {
    "Content-Type": "application/json"
  };

  if (etag) {
    headers["if-match"] = etag;
  }

  const response = await fetch(buildFirebaseStateUrl(backend), {
    method: "PUT",
    headers,
    body: JSON.stringify(nextEnvelope)
  });

  if (response.status === 412) {
    const payload = await response.json();
    return {
      ok: false,
      conflict: true,
      revision: Number(payload?.revision || 0),
      state: payload?.state || createDefaultState(),
      etag: extractEtag(response),
      message: "Shared data changed before this save completed."
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      message: `HTTP ${response.status}`
    };
  }

  const payload = await response.json();
  return {
    ...payload,
    etag: extractEtag(response)
  };
}

function buildSharedStateGetUrl(endpoint) {
  const url = new URL(endpoint, window.location.href);
  url.searchParams.set("t", String(Date.now()));
  return url.toString();
}

function buildFirebaseStateUrl(backend) {
  const cleanDatabaseUrl = String(backend.databaseUrl || "").replace(/\/+$/, "");
  const cleanPath = String(backend.statePath || "wc2026/shared-state").replace(/^\/+|\/+$/g, "");
  const url = new URL(`${cleanDatabaseUrl}/${cleanPath}.json`);
  if (backend.auth) {
    url.searchParams.set("auth", backend.auth);
  }
  return url.toString();
}

function extractEtag(response) {
  return response.headers.get("etag") || response.headers.get("ETag") || "";
}

function buildDefaultEnvelope() {
  return {
    ok: true,
    revision: 0,
    updatedAt: null,
    state: null
  };
}

function getConnectedStorageMessage(backend) {
  if (backend.kind === "firebase-rest") {
    return "Firebase shared storage connected. All devices on GitHub Pages see the same players and admin updates.";
  }

  return "Shared storage connected. All devices see the same players and admin updates.";
}

function normalizeRemoteStorageConfig(config) {
  const provider = String(config?.provider || "").trim().toLowerCase();
  const firebaseDatabaseUrl = String(config?.firebaseDatabaseUrl || "").trim().replace(/\/+$/, "");
  const firebaseAuth = String(config?.firebaseAuth || "").trim();
  const firebaseStatePath = String(config?.firebaseStatePath || "wc2026/shared-state")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return {
    provider,
    firebaseDatabaseUrl,
    firebaseAuth,
    firebaseStatePath
  };
}

function renderMatches() {
  const player = getActivePlayer();
  const filters = getMatchFilters();
  const matches = state.matches
    .slice()
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
    .filter((match) => {
      const isOpen = isPredictionOpen(match.predictionDeadline);
      const status = isOpen ? "open" : "closed";
      const roundMatch = filters.round === "all" || match.round === filters.round;
      const groupMatch = filters.group === "all" || getMatchGroupLabel(match) === filters.group;
      const statusMatch = filters.status === "all" || status === filters.status;
      return roundMatch && groupMatch && statusMatch;
    });

  if (!matches.length) {
    dom.matchesContainer.innerHTML = `<div class="empty-state">No matches fit the current filters.</div>`;
    return;
  }

  const groupedByRound = groupBy(matches, (match) => match.round);
  const roundMarkup = Object.keys(groupedByRound).map((roundName) => {
    const roundMatches = groupedByRound[roundName];
    const groupedByGroup = groupBy(roundMatches, (match) => isGroupStageRound(roundName) ? `Group ${match.group}` : "Knockout");
    const groupMarkup = Object.keys(groupedByGroup).map((groupName) => `
      <div class="round-group-block">
        <div class="round-group-header">
          <span class="card-kicker">${escapeHtml(groupName)}</span>
          <span class="muted">${groupedByGroup[groupName].length} match${groupedByGroup[groupName].length === 1 ? "" : "es"}</span>
        </div>
        <div class="cards-grid match-grid">
          ${groupedByGroup[groupName].map((match) => renderMatchCard(match, player)).join("")}
        </div>
      </div>
    `).join("");

    return `
      <section class="round-section panel">
        <div class="round-section-header">
          <h3>${escapeHtml(roundName)}</h3>
          <span class="chip">${roundMatches.length} match${roundMatches.length === 1 ? "" : "es"}</span>
        </div>
        <div class="round-group-stack">
          ${groupMarkup}
        </div>
      </section>
    `;
  }).join("");

  dom.matchesContainer.innerHTML = roundMarkup;
}

function renderMatchCard(match, player) {
  const isOpen = isPredictionOpen(match.predictionDeadline);
  const prediction = player ? getMatchPrediction(player.id, match.id) : null;
  const isLocked = !isOpen || Boolean(prediction);
  const submissions = state.matchPredictions
    .filter((item) => String(item.matchId) === String(match.id))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 4);

  const actualScore = match.actualScoreA !== null && match.actualScoreB !== null
    ? `${match.actualScoreA} - ${match.actualScoreB}`
    : "Pending";

  return `
    <article class="match-card">
      <div class="card-topline">
        <div>
          <span class="card-kicker">${escapeHtml(match.round)}</span>
          <h3>${escapeHtml(match.teamA)} vs ${escapeHtml(match.teamB)}</h3>
        </div>
        <div class="chip-row">
          <span class="chip">${escapeHtml(getMatchGroupLabel(match))}</span>
          <span class="status-pill ${isOpen ? "status-open" : "status-closed"}">${isOpen ? "Open for prediction" : "Prediction closed"}</span>
        </div>
      </div>

      <div class="match-battle">
        <div class="team-side home-side">
          ${renderTeamBlock(match.teamALogo, match.teamA)}
        </div>
        <div class="match-center">
          <span class="versus">VS</span>
          <span class="match-time-label">${escapeHtml(formatDateTime(match.matchDate))}</span>
        </div>
        <div class="team-side away-side">
          ${renderTeamBlock(match.teamBLogo, match.teamB)}
        </div>
      </div>

      <div class="chip-row">
        <span class="countdown-badge" data-deadline="${escapeHtml(match.predictionDeadline)}" data-open="${String(isOpen)}">${escapeHtml(formatCountdown(match.predictionDeadline))}</span>
        <span class="chip">Actual: ${escapeHtml(actualScore)}</span>
      </div>

      <form class="match-form" data-match-id="${escapeHtml(match.id)}">
        <div class="score-inputs">
          <label class="score-box">
            <span>${escapeHtml(match.teamA)}</span>
            <input type="number" min="0" step="1" name="predictedScoreA" value="${prediction ? prediction.predictedScoreA : ""}" ${isLocked ? "disabled" : ""}>
          </label>
          <span class="score-divider">:</span>
          <label class="score-box">
            <span>${escapeHtml(match.teamB)}</span>
            <input type="number" min="0" step="1" name="predictedScoreB" value="${prediction ? prediction.predictedScoreB : ""}" ${isLocked ? "disabled" : ""}>
          </label>
        </div>
        <div class="inline-actions">
          <button class="primary-button" type="submit" ${isLocked ? "disabled" : ""}>${prediction ? "Prediction Locked" : "Submit Prediction"}</button>
          <span class="deadline-note">Deadline: ${escapeHtml(formatDateTime(match.predictionDeadline))}</span>
        </div>
      </form>

      ${prediction ? `
        <p class="prediction-meta">
          ${escapeHtml(player.name)} - predicted at ${escapeHtml(formatDateTime(prediction.submittedAt))}
          ${match.isFinished ? `- earned ${prediction.points} pts` : ""}
        </p>
      ` : `<p class="prediction-meta">No prediction saved for this player yet.</p>`}

      <div>
        <span class="card-kicker">Latest submissions</span>
        <div class="mini-list">
          ${submissions.length ? submissions.map((item) => `
            <span class="mini-list-item">
              ${escapeHtml(item.playerName)} - ${item.predictedScoreA}-${item.predictedScoreB} - predicted at ${escapeHtml(formatDateTime(item.submittedAt))}
            </span>
          `).join("") : `<span class="mini-list-item">No predictions yet.</span>`}
        </div>
      </div>

      ${!player ? `
        <div class="disabled-layer">
          <div>
            <strong>Login required</strong>
            <p class="deadline-note">Enter a player name above to unlock predictions.</p>
          </div>
        </div>
      ` : ""}
    </article>
  `;
}

function renderGroups() {
  const player = getActivePlayer();
  if (!state.groups.length) {
    dom.groupsContainer.innerHTML = `<div class="empty-state">No groups available.</div>`;
    return;
  }

  dom.groupsContainer.innerHTML = state.groups
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((group) => renderGroupCard(group, player))
    .join("");

  applySavedGroupSelections();
}

function renderGroupCard(group, player) {
  const isOpen = isPredictionOpen(group.predictionDeadline);
  const prediction = player ? getGroupPrediction(player.id, group.id) : null;
  const isLocked = !isOpen || Boolean(prediction);
  const submissions = state.groupPredictions
    .filter((item) => String(item.groupId) === String(group.id))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 4);

  const optionMarkup = group.teams
    .map((team) => `<option value="${escapeHtml(team.name)}">${escapeHtml(team.name)}</option>`)
    .join("");

  return `
    <article class="group-card">
      <div class="card-topline">
        <div>
          <span class="card-kicker">${escapeHtml(group.name)}</span>
          <h3>Top 3 group ranking</h3>
        </div>
        <div class="chip-row">
          <span class="status-pill ${isOpen ? "status-open" : "status-closed"}">${isOpen ? "Open for prediction" : "Prediction closed"}</span>
        </div>
      </div>

      <div class="group-team-list" data-group-id="${escapeHtml(group.id)}">
        ${renderGroupTeamPreview(group, prediction)}
      </div>

      <form class="group-form" data-group-id="${escapeHtml(group.id)}">
        <div class="group-rank-grid">
          <label class="select-box">
            <span>1st place</span>
            <select name="predictedFirst" ${isLocked ? "disabled" : ""}>
              <option value="">Select team</option>
              ${optionMarkup}
            </select>
          </label>
          <label class="select-box">
            <span>2nd place</span>
            <select name="predictedSecond" ${isLocked ? "disabled" : ""}>
              <option value="">Select team</option>
              ${optionMarkup}
            </select>
          </label>
          <label class="select-box">
            <span>3rd place</span>
            <select name="predictedThird" ${isLocked ? "disabled" : ""}>
              <option value="">Select team</option>
              ${optionMarkup}
            </select>
          </label>
        </div>
        <label class="checkbox-row">
          <input type="checkbox" name="predictedThirdQualifies" ${prediction?.predictedThirdQualifies ? "checked" : ""} ${isLocked ? "disabled" : ""}>
          <span>3rd place qualifies as one of the best third-placed teams</span>
        </label>
        <div class="inline-actions">
          <button class="primary-button" type="submit" ${isLocked ? "disabled" : ""}>${prediction ? "Prediction Locked" : "Submit Group Prediction"}</button>
          <span class="countdown-badge" data-deadline="${escapeHtml(group.predictionDeadline)}" data-open="${String(isOpen)}">${escapeHtml(formatCountdown(group.predictionDeadline))}</span>
        </div>
      </form>

      <p class="prediction-meta">
        ${prediction
          ? `${escapeHtml(player.name)} - predicted at ${escapeHtml(formatDateTime(prediction.submittedAt))}${isGroupResultReady(group) ? ` - earned ${prediction.points} pts` : ""}`
          : "No prediction saved for this player yet."}
      </p>

      <div class="group-summary-grid">
        <span class="chip">Actual 1st: ${escapeHtml(group.actualFirst || "Pending")}</span>
        <span class="chip">Actual 2nd: ${escapeHtml(group.actualSecond || "Pending")}</span>
        <span class="chip">Actual 3rd: ${escapeHtml(group.actualThird || "Pending")}</span>
        <span class="chip">Best third: ${group.actualThird === null ? "Pending" : group.actualThirdQualifies ? "Yes" : "No"}</span>
      </div>

      <div>
        <span class="card-kicker">Latest submissions</span>
        <div class="mini-list">
          ${submissions.length ? submissions.map((item) => `
            <span class="mini-list-item">
              ${escapeHtml(item.playerName)} - ${escapeHtml(item.predictedFirst)} / ${escapeHtml(item.predictedSecond)} / ${escapeHtml(item.predictedThird || "-")} - best third: ${item.predictedThirdQualifies ? "Yes" : "No"} - predicted at ${escapeHtml(formatDateTime(item.submittedAt))}
            </span>
          `).join("") : `<span class="mini-list-item">No predictions yet.</span>`}
        </div>
      </div>

      ${!player ? `
        <div class="disabled-layer">
          <div>
            <strong>Login required</strong>
            <p class="deadline-note">Enter a player name above to unlock predictions.</p>
          </div>
        </div>
      ` : ""}
    </article>
  `;
}

function renderLeaderboard() {
  const searchTerm = normalizeName(dom.playerSearchInput.value);
  const leaderboard = getLeaderboard().filter((player) => normalizeName(player.name).includes(searchTerm));

  if (Date.now() < uiState.leaderboardFlashUntil) {
    dom.leaderboardPanel.classList.add("flash");
  } else {
    dom.leaderboardPanel.classList.remove("flash");
  }

  renderPodium(leaderboard.slice(0, 3));

  if (!leaderboard.length) {
    dom.leaderboardBody.innerHTML = `
      <tr>
        <td colspan="7"><div class="empty-state">No players match the search yet.</div></td>
      </tr>
    `;
    return;
  }

  dom.leaderboardBody.innerHTML = leaderboard.map((player, index) => `
    <tr>
      <td><span class="rank-badge">${index + 1}</span></td>
      <td class="table-player">${escapeHtml(player.name)}</td>
      <td>${player.totalPoints}</td>
      <td>${player.matchPoints}</td>
      <td>${player.groupPoints}</td>
      <td>${player.exactScores}</td>
      <td>${escapeHtml(player.lastPredictionTime ? formatDateTime(player.lastPredictionTime) : "No predictions yet")}</td>
    </tr>
  `).join("");
}

function renderPodium(players) {
  if (!players.length) {
    dom.podium.innerHTML = `<div class="empty-state">The podium will appear once players join.</div>`;
    return;
  }

  const order = [players[1], players[0], players[2]].filter(Boolean);
  dom.podium.innerHTML = order.map((player) => {
    const rank = players.indexOf(player) + 1;
    const medalClass = rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze";
    return `
      <article class="podium-card ${rank === 1 ? "first" : ""}">
        <span class="medal ${medalClass}">${rank}</span>
        <strong>${escapeHtml(player.name)}</strong>
        <p class="muted">${player.totalPoints} pts</p>
      </article>
    `;
  }).join("");
}

function renderHistory() {
  const searchTerm = normalizeName(dom.playerSearchInput.value);

  const matchEntries = state.matchPredictions.map((prediction) => {
    const match = state.matches.find((item) => String(item.id) === String(prediction.matchId));
    if (!match) {
      return null;
    }

    return {
      playerName: prediction.playerName,
      submittedAt: prediction.submittedAt,
      title: `${prediction.playerName} • ${match.teamA} vs ${match.teamB}`,
      predictionText: `${prediction.predictedScoreA} - ${prediction.predictedScoreB}`,
      actualText: match.actualScoreA !== null && match.actualScoreB !== null ? `${match.actualScoreA} - ${match.actualScoreB}` : "Pending",
      points: prediction.points || 0,
      status: getMatchHistoryStatus(prediction, match)
    };
  });

  const groupEntries = state.groupPredictions.map((prediction) => {
    const group = state.groups.find((item) => String(item.id) === String(prediction.groupId));
    if (!group) {
      return null;
    }

    return {
      playerName: prediction.playerName,
      submittedAt: prediction.submittedAt,
      title: `${prediction.playerName} • ${group.name}`,
      predictionText: `${prediction.predictedFirst} / ${prediction.predictedSecond} / ${prediction.predictedThird || "-"} • Best third: ${prediction.predictedThirdQualifies ? "Yes" : "No"}`,
      actualText: isGroupResultReady(group)
        ? `${group.actualFirst} / ${group.actualSecond} / ${group.actualThird} • Best third: ${group.actualThirdQualifies ? "Yes" : "No"}`
        : "Pending",
      points: prediction.points || 0,
      status: getGroupHistoryStatus(prediction, group)
    };
  });

  const entries = [...matchEntries, ...groupEntries]
    .filter(Boolean)
    .filter((entry) => normalizeName(entry.playerName).includes(searchTerm))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  if (!entries.length) {
    dom.historyContainer.innerHTML = `<div class="empty-state">No prediction history to show yet.</div>`;
    return;
  }

  dom.historyContainer.innerHTML = entries.map((entry) => `
    <article class="history-item">
      <div>
        <strong class="history-title">${escapeHtml(entry.title)}</strong>
        <p class="history-meta">
          Predicted: ${escapeHtml(entry.predictionText)}<br>
          Actual: ${escapeHtml(entry.actualText)}<br>
          Submitted at: ${escapeHtml(formatDateTime(entry.submittedAt))}
        </p>
      </div>
      <div>
        <span class="status-tag ${entry.status.className}">${escapeHtml(entry.status.label)}</span>
        <div class="history-points">${entry.points} pts</div>
      </div>
    </article>
  `).join("");
}

function renderAdmin() {
  if (!sessionState.adminUnlocked) {
    dom.adminGate.innerHTML = `
      <form class="admin-login-form">
        <label class="field-label" for="adminPasswordInput">Admin password</label>
        <div class="login-row">
          <input id="adminPasswordInput" name="password" type="password" placeholder="Enter admin password" required>
          <button class="primary-button" type="submit">Unlock Admin</button>
        </div>
        <p class="admin-help">Use the current app password to manage results and recalculate standings.</p>
      </form>
    `;
    dom.adminWorkspace.classList.add("hidden");
    dom.adminWorkspace.innerHTML = "";
    return;
  }

  dom.adminGate.innerHTML = `
    <div class="admin-controls">
      <div class="admin-actions">
        <button class="primary-button" type="button" data-action="calculate-points">Calculate Points</button>
        <button class="secondary-button" type="button" data-action="export-leaderboard">Export Leaderboard JSON</button>
        <button class="ghost-button" type="button" data-action="lock-admin">Lock Admin</button>
        <button class="ghost-button" type="button" data-action="reset-data">Reset All Data</button>
      </div>
      <div>
        <label class="field-label" for="importMatchesInput">Import matches JSON</label>
        <input class="file-input" id="importMatchesInput" type="file" accept="application/json">
      </div>
    </div>
  `;

  const adminMarkup = ROUND_FILTER_OPTIONS
    .filter((option) => option.value !== "all")
    .map((option) => {
      const roundMatches = state.matches
        .filter((match) => match.round === option.value)
        .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

      if (!roundMatches.length) {
        return "";
      }

      return `
        <section class="round-section panel">
          <div class="round-section-header">
            <h3>${escapeHtml(option.label)}</h3>
            <span class="chip">${roundMatches.length} match${roundMatches.length === 1 ? "" : "es"}</span>
          </div>
          <div class="admin-grid">
            ${roundMatches.map((match) => `
              <article class="admin-card">
                <div>
                  <span class="card-kicker">${escapeHtml(getMatchGroupLabel(match))}</span>
                  <h3>${escapeHtml(match.teamA)} vs ${escapeHtml(match.teamB)}</h3>
                </div>
                <form class="admin-match-form" data-match-id="${escapeHtml(match.id)}">
                  <label class="field-group">
                    <span>Match date</span>
                    <input type="datetime-local" name="matchDate" value="${escapeHtml(formatDateTimeLocal(match.matchDate))}">
                  </label>
                  <label class="field-group">
                    <span>Prediction deadline</span>
                    <input type="datetime-local" name="predictionDeadline" value="${escapeHtml(formatDateTimeLocal(match.predictionDeadline))}">
                  </label>
                  <div class="score-inputs">
                    <label class="score-box">
                      <span>${escapeHtml(match.teamA)} actual</span>
                      <input type="number" min="0" step="1" name="actualScoreA" value="${match.actualScoreA ?? ""}">
                    </label>
                    <label class="score-box">
                      <span>${escapeHtml(match.teamB)} actual</span>
                      <input type="number" min="0" step="1" name="actualScoreB" value="${match.actualScoreB ?? ""}">
                    </label>
                  </div>
                  <label class="chip">
                    <input type="checkbox" name="isFinished" ${match.isFinished ? "checked" : ""}>
                    Mark match as finished
                  </label>
                  <button class="primary-button" type="submit">Save Match</button>
                </form>
              </article>
            `).join("")}
          </div>
        </section>
      `;
    })
    .join("");

  const groupCards = state.groups
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((group) => `
      <article class="admin-card">
        <div>
          <span class="card-kicker">${escapeHtml(group.name)}</span>
          <h3>Actual top 3 ranking</h3>
        </div>
        <form class="admin-group-form" data-group-id="${escapeHtml(group.id)}">
          <div class="group-rank-grid">
            <label class="select-box">
              <span>1st place</span>
              <select name="actualFirst">
                <option value="">Select team</option>
                ${group.teams.map((team) => `
                  <option value="${escapeHtml(team.name)}" ${group.actualFirst === team.name ? "selected" : ""}>${escapeHtml(team.name)}</option>
                `).join("")}
              </select>
            </label>
            <label class="select-box">
              <span>2nd place</span>
              <select name="actualSecond">
                <option value="">Select team</option>
                ${group.teams.map((team) => `
                  <option value="${escapeHtml(team.name)}" ${group.actualSecond === team.name ? "selected" : ""}>${escapeHtml(team.name)}</option>
                `).join("")}
              </select>
            </label>
            <label class="select-box">
              <span>3rd place</span>
              <select name="actualThird">
                <option value="">Select team</option>
                ${group.teams.map((team) => `
                  <option value="${escapeHtml(team.name)}" ${group.actualThird === team.name ? "selected" : ""}>${escapeHtml(team.name)}</option>
                `).join("")}
              </select>
            </label>
          </div>
          <label class="checkbox-row">
            <input type="checkbox" name="actualThirdQualifies" ${group.actualThirdQualifies ? "checked" : ""}>
            <span>3rd place qualifies as one of the best third-placed teams</span>
          </label>
          <button class="primary-button" type="submit">Save Group Result</button>
        </form>
      </article>
    `)
    .join("");

  dom.adminWorkspace.classList.remove("hidden");
  dom.adminWorkspace.innerHTML = `
    ${adminMarkup}
    <section class="round-section panel">
      <div class="round-section-header">
        <h3>Group Results</h3>
        <span class="chip">${countActualBestThirdSelections()}/${BEST_THIRD_QUALIFIERS_COUNT} best third spots used</span>
      </div>
      <div class="admin-grid">
        ${groupCards}
      </div>
    </section>
  `;
}

function recalculatePoints(sourceState = state) {
  const playerMap = new Map();

  sourceState.players.forEach((player) => {
    player.totalPoints = 0;
    player.matchPoints = 0;
    player.groupPoints = 0;
    player.exactScores = 0;
    player.lastPredictionTime = null;
    playerMap.set(player.id, player);
  });

  sourceState.matchPredictions.forEach((prediction) => {
    const match = sourceState.matches.find((item) => String(item.id) === String(prediction.matchId));
    const player = playerMap.get(prediction.playerId);
    prediction.points = match ? calculateMatchPredictionPoints(prediction, match) : 0;
    if (!player) {
      return;
    }

    player.matchPoints += prediction.points;
    player.totalPoints += prediction.points;
    if (match && isExactScore(prediction, match)) {
      player.exactScores += 1;
    }
    player.lastPredictionTime = getLatestTime(player.lastPredictionTime, prediction.submittedAt);
    prediction.playerName = player.name;
  });

  sourceState.groupPredictions.forEach((prediction) => {
    const group = sourceState.groups.find((item) => String(item.id) === String(prediction.groupId));
    const player = playerMap.get(prediction.playerId);
    prediction.points = group ? calculateGroupPredictionPoints(prediction, group) : 0;
    if (!player) {
      return;
    }

    player.groupPoints += prediction.points;
    player.totalPoints += prediction.points;
    player.lastPredictionTime = getLatestTime(player.lastPredictionTime, prediction.submittedAt);
    prediction.playerName = player.name;
  });
}

function calculateMatchPredictionPoints(prediction, match) {
  if (!match.isFinished || match.actualScoreA === null || match.actualScoreB === null) {
    return 0;
  }

  const actualOutcome = getOutcome(match.actualScoreA, match.actualScoreB);
  const predictedOutcome = getOutcome(prediction.predictedScoreA, prediction.predictedScoreB);
  const actualDifference = match.actualScoreA - match.actualScoreB;
  const predictedDifference = prediction.predictedScoreA - prediction.predictedScoreB;

  if (predictedOutcome === actualOutcome) {
    return MATCH_SCORING.correctResult;
  }

  if (predictedDifference === actualDifference) {
    return MATCH_SCORING.goalDifference;
  }

  return 0;
}

function calculateGroupPredictionPoints(prediction, group) {
  if (!isGroupResultReady(group)) {
    return 0;
  }

  if (isExactGroupStandingPrediction(prediction, group)) {
    return GROUP_SCORING.correctOrder;
  }

  const predictedQualified = [prediction.predictedFirst, prediction.predictedSecond].sort();
  const actualQualified = [group.actualFirst, group.actualSecond].sort();

  if (predictedQualified[0] === actualQualified[0] && predictedQualified[1] === actualQualified[1]) {
    return GROUP_SCORING.correctQualifiedTeams;
  }

  return 0;
}

function getLeaderboard(sourceState = state) {
  return sourceState.players
    .slice()
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.exactScores !== a.exactScores) {
        return b.exactScores - a.exactScores;
      }
      if (b.matchPoints !== a.matchPoints) {
        return b.matchPoints - a.matchPoints;
      }
      return normalizeName(a.name).localeCompare(normalizeName(b.name));
    });
}

function getPlayerRank(playerId, sourceState = state) {
  const leaderboard = getLeaderboard(sourceState);
  const index = leaderboard.findIndex((player) => player.id === playerId);
  return index >= 0 ? index + 1 : null;
}

function getCurrentRoundLabel() {
  const nextOpenMatch = state.matches
    .slice()
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
    .find((match) => !match.isFinished);

  return nextOpenMatch ? nextOpenMatch.round : "Tournament complete";
}

function getActivePlayer() {
  return state.players.find((player) => player.id === sessionState.activePlayerId) || null;
}

function getMatchPrediction(playerId, matchId, sourceState = state) {
  return sourceState.matchPredictions.find((prediction) => prediction.playerId === playerId && String(prediction.matchId) === String(matchId)) || null;
}

function getGroupPrediction(playerId, groupId, sourceState = state) {
  return sourceState.groupPredictions.find((prediction) => prediction.playerId === playerId && String(prediction.groupId) === String(groupId)) || null;
}

function getMatchFilters() {
  return {
    round: dom.roundFilter.value || "all",
    group: dom.groupFilter.value || "all",
    status: dom.statusFilter.value || "all"
  };
}

function populateMatchFilters() {
  const availableGroups = [...new Set(state.matches.map(getMatchGroupLabel))];
  const previousRound = dom.roundFilter.value;
  const previousGroup = dom.groupFilter.value;
  const currentRound = getCurrentRoundOptionValue();

  dom.roundFilter.innerHTML = ROUND_FILTER_OPTIONS
    .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
    .join("");

  dom.groupFilter.innerHTML = [`<option value="all">All Groups</option>`]
    .concat(availableGroups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`))
    .join("");

  dom.roundFilter.value = ROUND_FILTER_OPTIONS.some((option) => option.value === previousRound)
    ? previousRound
    : currentRound;
  dom.groupFilter.value = availableGroups.includes(previousGroup) ? previousGroup : "all";
}

function getCurrentRoundOptionValue() {
  const currentRound = getCurrentRoundLabel();
  if (ROUND_FILTER_OPTIONS.some((option) => option.value === currentRound)) {
    return currentRound;
  }
  return "all";
}

function startCountdownLoop() {
  if (uiState.timerId) {
    window.clearInterval(uiState.timerId);
  }

  updateCountdownBadges();
  uiState.timerId = window.setInterval(updateCountdownBadges, 1000);
}

function updateCountdownBadges() {
  const badges = document.querySelectorAll("[data-deadline]");
  let needsRefresh = false;

  badges.forEach((badge) => {
    const deadline = badge.dataset.deadline;
    const isOpen = isPredictionOpen(deadline);
    badge.textContent = formatCountdown(deadline);
    if (badge.dataset.open !== String(isOpen)) {
      needsRefresh = true;
    }
  });

  if (needsRefresh) {
    renderStats();
    renderMatches();
    renderGroups();
  }

  if (Date.now() >= uiState.leaderboardFlashUntil && dom.leaderboardPanel.classList.contains("flash")) {
    dom.leaderboardPanel.classList.remove("flash");
  }
}

function buildParticles() {
  if (!dom.particleField || dom.particleField.childElementCount) {
    return;
  }

  dom.particleField.innerHTML = Array.from({ length: 22 }, (_, index) => {
    const size = 10 + (index % 5) * 2;
    const left = `${(index * 13) % 100}%`;
    const end = `${((index * 17) + 11) % 100}%`;
    const duration = `${13 + (index % 7) * 2}s`;
    const delay = `${(index % 6) * -2}s`;
    return `<span class="particle-ball" style="width:${size}px;height:${size}px;left:${left};--start-x:0;--end-x:calc(${end} - ${left});--duration:${duration};animation-delay:${delay};"></span>`;
  }).join("");
}

function renderHeroAtmosphere() {
  const teams = getTournamentTeams();
  if (dom.heroLogoRail) {
    const featuredTeams = teams.slice(0, 12);
    const railMarkup = featuredTeams.concat(featuredTeams).map((team) => `
      <span class="hero-logo-chip">
        ${renderInlineTeamLogo(team.logo, team.name)}
        <strong>${escapeHtml(team.name)}</strong>
      </span>
    `).join("");

    dom.heroLogoRail.innerHTML = `
      <div class="hero-logo-track">
        ${railMarkup}
      </div>
    `;
  }
}

function renderTeamBlock(logo, name) {
  return `
    <div class="team-block">
      ${renderInlineTeamLogo(logo, name)}
      <span class="team-name-wrap">
        <strong>${escapeHtml(name)}</strong>
      </span>
    </div>
  `;
}

function renderInlineTeamLogo(logo, teamName) {
  const fallback = getInitials(teamName);
  if (logo && String(logo).includes("/")) {
    return `
      <span class="team-logo-shell">
        <img class="team-logo-image" src="${escapeHtml(logo)}" alt="${escapeHtml(teamName)} logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid';">
        <span class="team-logo team-logo-fallback">${escapeHtml(fallback)}</span>
      </span>
    `;
  }

  return `<span class="team-logo">${escapeHtml(logo || fallback)}</span>`;
}

function getMatchHistoryStatus(prediction, match) {
  if (!match.isFinished || match.actualScoreA === null || match.actualScoreB === null) {
    return { label: "Pending", className: "status-pending" };
  }

  if (isExactScore(prediction, match)) {
    return { label: "Correct Score", className: "status-exact" };
  }

  if (prediction.points === MATCH_SCORING.correctResult) {
    return { label: "Correct Result", className: "status-winner" };
  }

  if (prediction.points === MATCH_SCORING.goalDifference) {
    return { label: "Goal Difference", className: "status-margin" };
  }

  return { label: "Wrong", className: "status-wrong" };
}

function getGroupHistoryStatus(prediction, group) {
  if (!isGroupResultReady(group)) {
    return { label: "Pending", className: "status-pending" };
  }

  if (prediction.points === GROUP_SCORING.correctOrder) {
    return { label: "Correct Order", className: "status-exact" };
  }

  if (prediction.points === GROUP_SCORING.correctQualifiedTeams) {
    return { label: "Qualified Teams", className: "status-winner" };
  }

  return { label: "Wrong", className: "status-wrong" };
}

function isExactScore(prediction, match) {
  return Boolean(
    match.isFinished &&
    match.actualScoreA !== null &&
    match.actualScoreB !== null &&
    prediction.predictedScoreA === match.actualScoreA &&
    prediction.predictedScoreB === match.actualScoreB
  );
}

function exportLeaderboard() {
  const leaderboard = getLeaderboard().map((player, index) => ({
    rank: index + 1,
    name: player.name,
    totalPoints: player.totalPoints,
    matchPoints: player.matchPoints,
    groupPoints: player.groupPoints,
    exactScores: player.exactScores,
    lastPredictionTime: player.lastPredictionTime
  }));

  const blob = new Blob([JSON.stringify(leaderboard, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "wc2026-leaderboard.json";
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Leaderboard exported", "success");
}

async function importMatchesFromFile(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed)) {
        throw new Error("The file must contain an array of matches.");
      }

      const result = await applySharedMutation((draftState) => {
        draftState.matches = parsed.map((match, index) => normalizeMatch(match, index, scheduleSource.groupLookup));
        syncGroupPredictionDeadlines(draftState.groups, draftState.matches);
        reconcilePredictions(draftState);
      });

      if (!result.ok) {
        return;
      }

      populateMatchFilters();
      renderAll();
      showToast("Matches imported", "success");
    } catch (error) {
      console.error(error);
      showToast("Invalid matches JSON", "error");
    }
  };
  reader.readAsText(file);
}

function applySavedGroupSelections() {
  state.groups.forEach((group) => {
    const form = document.querySelector(`.group-form[data-group-id="${group.id}"]`);
    if (!form) {
      return;
    }

    const player = getActivePlayer();
    const prediction = player ? getGroupPrediction(player.id, group.id) : null;
    const firstSelect = form.querySelector('select[name="predictedFirst"]');
    const secondSelect = form.querySelector('select[name="predictedSecond"]');
    const thirdSelect = form.querySelector('select[name="predictedThird"]');
    const bestThirdCheckbox = form.querySelector('input[name="predictedThirdQualifies"]');
    if (firstSelect && prediction) {
      firstSelect.value = prediction.predictedFirst;
    }
    if (secondSelect && prediction) {
      secondSelect.value = prediction.predictedSecond;
    }
    if (thirdSelect && prediction) {
      thirdSelect.value = prediction.predictedThird || "";
    }
    if (bestThirdCheckbox && prediction) {
      bestThirdCheckbox.checked = Boolean(prediction.predictedThirdQualifies);
    }

    syncGroupFormState(form);
  });
}

function syncGroupFormState(form) {
  if (!form) {
    return;
  }

  const groupId = String(form.dataset.groupId || "");
  const group = state.groups.find((item) => String(item.id) === groupId);
  if (!group) {
    return;
  }

  const firstSelect = form.querySelector('select[name="predictedFirst"]');
  const secondSelect = form.querySelector('select[name="predictedSecond"]');
  const thirdSelect = form.querySelector('select[name="predictedThird"]');
  const bestThirdCheckbox = form.querySelector('input[name="predictedThirdQualifies"]');
  const bestThirdRow = form.querySelector(".checkbox-row");
  const thirdSelectBox = thirdSelect?.closest(".select-box");
  const selects = [firstSelect, secondSelect, thirdSelect].filter(Boolean);

  selects.forEach((select) => {
    const otherSelectedValues = new Set(
      selects
        .filter((item) => item !== select)
        .map((item) => item.value)
        .filter(Boolean)
    );

    Array.from(select.options).forEach((option) => {
      if (!option.value) {
        option.disabled = false;
        return;
      }

      option.disabled = otherSelectedValues.has(option.value) && option.value !== select.value;
    });
  });

  const previewContainer = form.closest(".group-card")?.querySelector(".group-team-list");
  const hasThirdSelection = Boolean(thirdSelect?.value);
  if (bestThirdCheckbox) {
    if (!hasThirdSelection) {
      bestThirdCheckbox.checked = false;
    }
    bestThirdCheckbox.disabled = !hasThirdSelection || Boolean(thirdSelect?.disabled);
  }

  if (previewContainer) {
    previewContainer.innerHTML = renderGroupTeamPreview(group, {
      predictedFirst: firstSelect?.value || "",
      predictedSecond: secondSelect?.value || "",
      predictedThird: thirdSelect?.value || "",
      predictedThirdQualifies: Boolean(bestThirdCheckbox?.checked)
    });
  }

  if (bestThirdRow) {
    bestThirdRow.classList.toggle("is-active", Boolean(bestThirdCheckbox?.checked && thirdSelect?.value));
  }

  if (thirdSelectBox) {
    thirdSelectBox.classList.toggle("is-best-third", Boolean(bestThirdCheckbox?.checked && thirdSelect?.value));
  }
}

function ensureUniqueGroupSelection(form, changedSelect) {
  const changedValue = changedSelect?.value || "";
  if (!changedValue) {
    return;
  }

  const selects = Array.from(form.querySelectorAll('select[name="predictedFirst"], select[name="predictedSecond"], select[name="predictedThird"]'));
  selects.forEach((select) => {
    if (select !== changedSelect && select.value === changedValue) {
      select.value = "";
    }
  });
}

function renderGroupTeamPreview(group, prediction) {
  const orderedNames = [
    prediction?.predictedFirst || "",
    prediction?.predictedSecond || "",
    prediction?.predictedThird || ""
  ].filter(Boolean);

  const orderedTeams = [
    ...orderedNames
      .map((teamName) => group.teams.find((team) => team.name === teamName))
      .filter(Boolean),
    ...group.teams.filter((team) => !orderedNames.includes(team.name))
  ];

  return orderedTeams.map((team) => {
    const rank = getSelectedGroupRank(team.name, prediction);
    const isBestThird = rank === 3 && Boolean(prediction?.predictedThirdQualifies);
    const rankLabel = rank ? `${rank}${getOrdinalSuffix(rank)}` : "";

    return `
      <div class="group-team ${rank ? `group-team-selected group-team-rank-${rank}` : ""} ${isBestThird ? "group-team-best-third" : ""}">
        <span class="group-team-rank-badge ${isBestThird ? "group-team-rank-badge-green" : ""}">${escapeHtml(rankLabel || "-")}</span>
        ${renderInlineTeamLogo(team.logo, team.name)}
        <strong>${escapeHtml(team.name)}</strong>
      </div>
    `;
  }).join("");
}

function getSelectedGroupRank(teamName, prediction) {
  if (!prediction) {
    return null;
  }
  if (prediction.predictedFirst === teamName) {
    return 1;
  }
  if (prediction.predictedSecond === teamName) {
    return 2;
  }
  if (prediction.predictedThird === teamName) {
    return 3;
  }
  return null;
}

function getOrdinalSuffix(rank) {
  if (rank === 1) {
    return "st";
  }
  if (rank === 2) {
    return "nd";
  }
  if (rank === 3) {
    return "rd";
  }
  return "th";
}

function syncGroupPredictionDeadlines(groups, matches) {
  groups.forEach((group) => {
    const groupMatches = matches
      .filter((match) => match.group === group.id && isGroupStageRound(match.round))
      .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

    if (!groupMatches.length) {
      return;
    }

    if (!group.predictionDeadline || group.autoPredictionDeadline) {
      group.predictionDeadline = groupMatches[0].predictionDeadline || calculateDeadlineFromMatchDate(groupMatches[0].matchDate);
      group.autoPredictionDeadline = true;
    }
  });
}

function normalizeWorldCupData(data) {
  const groups = Array.isArray(data.groups) ? data.groups.map((group) => normalizeGroup(group)) : [];
  const groupLookup = buildTeamLookup(groups);
  const matchesSource = Array.isArray(data.matches) && data.matches.length
    ? data.matches
    : [];
  const matches = matchesSource.map((match, index) => normalizeMatch(match, index, groupLookup));

  syncGroupPredictionDeadlines(groups, matches);

  return {
    version: String(data.version || "wc2026-default-schedule"),
    groups,
    matches,
    groupLookup
  };
}

function normalizeGroup(group, lookup) {
  const id = String(group.id || "").trim();
  const teams = Array.isArray(group.teams) ? group.teams.map((team) => ({
    id: String(team.id || slugifyTeamName(team.name || "")),
    name: String(team.name || ""),
    logo: resolveTeamLogo(team.logo, lookup?.[normalizeName(team.name)]?.logo || "")
  })) : [];

  const normalizedGroup = {
    id,
    name: String(group.name || `Group ${id}`),
    teams,
    predictionDeadline: group.predictionDeadline ? String(group.predictionDeadline) : null,
    actualFirst: group.actualFirst || null,
    actualSecond: group.actualSecond || null,
    actualThird: group.actualThird || null,
    actualThirdQualifies: typeof group.actualThirdQualifies === "boolean" ? group.actualThirdQualifies : null,
    autoPredictionDeadline: !group.predictionDeadline
  };

  if (lookup && normalizedGroup.teams.length === 0) {
    normalizedGroup.teams = Object.values(lookup)
      .filter((team) => team.groupId === id)
      .map((team) => ({ id: team.id, name: team.name, logo: team.logo }));
  }

  return normalizedGroup;
}

function normalizeMatch(match, index, groupLookup) {
  if (!match || typeof match !== "object") {
    throw new Error("Invalid match object");
  }

  if (!match.teamA || !match.teamB || !match.matchDate) {
    throw new Error("Each match needs teams and a match date");
  }

  const teamAInfo = groupLookup[normalizeName(match.teamA)] || null;
  const teamBInfo = groupLookup[normalizeName(match.teamB)] || null;
  const actualScoreA = parseNullableScore(match.actualScoreA);
  const actualScoreB = parseNullableScore(match.actualScoreB);
  const matchDate = String(match.matchDate);
  const predictionDeadline = match.predictionDeadline
    ? String(match.predictionDeadline)
    : calculateDeadlineFromMatchDate(matchDate);

  return {
    id: String(match.id || `imported-${index + 1}`),
    round: String(match.round || "Round 1"),
    group: String(match.group || teamAInfo?.groupId || teamBInfo?.groupId || ""),
    teamA: String(match.teamA),
    teamB: String(match.teamB),
    teamALogo: resolveTeamLogo(match.teamALogo, teamAInfo?.logo || ""),
    teamBLogo: resolveTeamLogo(match.teamBLogo, teamBInfo?.logo || ""),
    matchDate,
    predictionDeadline,
    actualScoreA,
    actualScoreB,
    isFinished: Boolean(match.isFinished)
  };
}

function buildTeamLookup(groups) {
  return groups.reduce((lookup, group) => {
    group.teams.forEach((team) => {
      lookup[normalizeName(team.name)] = {
        id: team.id,
        name: team.name,
        logo: team.logo,
        groupId: group.id
      };
    });
    return lookup;
  }, {});
}

function getLatestTime(first, second) {
  if (!first) {
    return second;
  }
  if (!second) {
    return first;
  }
  return new Date(first) > new Date(second) ? first : second;
}

function getMatchGroupLabel(match) {
  return match.group ? `Group ${match.group}` : "Knockout";
}

function isPredictionOpen(deadline) {
  return new Date(deadline).getTime() > Date.now();
}

function parseScoreInput(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    return null;
  }
  return number;
}

function parseNullableScore(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = parseScoreInput(value);
  if (parsed === null) {
    throw new Error("Scores must be whole numbers 0 or higher");
  }
  return parsed;
}

function getOutcome(scoreA, scoreB) {
  if (scoreA === scoreB) {
    return "draw";
  }
  return scoreA > scoreB ? "home" : "away";
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDateTimeLocal(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseDateTimeLocal(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : toIsoLocalString(date);
}

function calculateDeadlineFromMatchDate(matchDate) {
  const date = new Date(matchDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setMinutes(date.getMinutes() - 15);
  return toIsoLocalString(date);
}

function toIsoLocalString(date) {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const hours = padNumber(date.getHours());
  const minutes = padNumber(date.getMinutes());
  const seconds = padNumber(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function formatCountdown(deadline) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) {
    return "Closed";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePlayerPin(value) {
  return String(value || "").replace(/\D+/g, "").slice(0, 4);
}

function isValidPlayerPin(value) {
  return /^\d{4}$/.test(String(value || ""));
}

function normalizePlayer(player) {
  return {
    ...player,
    id: String(player?.id || createId("player")),
    name: String(player?.name || "").trim(),
    pin: normalizePlayerPin(player?.pin),
    totalPoints: Number(player?.totalPoints || 0),
    matchPoints: Number(player?.matchPoints || 0),
    groupPoints: Number(player?.groupPoints || 0),
    exactScores: Number(player?.exactScores || 0),
    createdAt: player?.createdAt || new Date().toISOString(),
    lastPredictionTime: player?.lastPredictionTime || null
  };
}

function getInitials(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function hasUniqueSelections(values) {
  return new Set(values.filter(Boolean)).size === values.filter(Boolean).length;
}

function isGroupResultReady(group) {
  return Boolean(group.actualFirst && group.actualSecond && group.actualThird);
}

function isExactGroupStandingPrediction(prediction, group) {
  return Boolean(
    prediction.predictedFirst === group.actualFirst &&
    prediction.predictedSecond === group.actualSecond &&
    prediction.predictedThird === group.actualThird &&
    Boolean(prediction.predictedThirdQualifies) === Boolean(group.actualThirdQualifies)
  );
}

function resolveTeamLogo(logo, fallbackLogo = "") {
  const currentLogo = String(logo || "").trim();
  if (currentLogo && !shouldReplaceStoredTeamLogo(currentLogo)) {
    return currentLogo;
  }
  return String(fallbackLogo || currentLogo || "");
}

function shouldReplaceStoredTeamLogo(logo) {
  const normalizedLogo = String(logo || "").trim().toLowerCase();
  return (
    normalizedLogo.startsWith("images/teams/") ||
    normalizedLogo.includes("wikipedia.org") ||
    normalizedLogo.includes("wikimedia.org")
  );
}

function countPlayerBestThirdSelections(playerId, currentGroupId = "", sourceState = state) {
  return sourceState.groupPredictions.filter((prediction) => (
    prediction.playerId === playerId &&
    prediction.predictedThirdQualifies &&
    String(prediction.groupId) !== String(currentGroupId)
  )).length;
}

function countActualBestThirdSelections(currentGroupId = "", sourceState = state) {
  return sourceState.groups.filter((group) => (
    group.actualThirdQualifies &&
    String(group.id) !== String(currentGroupId)
  )).length;
}

function slugifyTeamName(value) {
  return normalizeName(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cloneObject(item) {
  return JSON.parse(JSON.stringify(item));
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function groupBy(items, getKey) {
  return items.reduce((result, item) => {
    const key = getKey(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}

function isGroupStageRound(roundName) {
  return String(roundName).startsWith("Group Stage");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  dom.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function getTournamentTeams() {
  return scheduleSource.groups
    .flatMap((group) => group.teams)
    .filter((team, index, allTeams) => allTeams.findIndex((item) => normalizeName(item.name) === normalizeName(team.name)) === index);
}
