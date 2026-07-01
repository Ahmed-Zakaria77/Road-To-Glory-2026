const STORAGE_KEY = "wc2026_predictor_2026_v2";
const SESSION_STORAGE_KEY = "wc2026_predictor_session_v1";
const SHARED_STATE_ENDPOINTS = ["api/shared-state", "storage.php"];
const SHARED_SYNC_INTERVAL_MS = 5000;
const ADMIN_PASSWORD = "ziko97";
const CHAT_MAX_MESSAGE_LENGTH = 280;
const CHAT_MAX_MESSAGES = 150;
const CHAT_EMOJIS = ["😀", "😂", "😍", "😎", "🔥", "⚽", "🏆", "👏", "🤝", "🥳", "😭", "😅"];
const CHAT_REACTION_EMOJIS = ["❤️", "😂", "🔥", "👏", "😢"];
const CHAT_BLOCKED_TERMS_EN = [
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "slut",
  "whore",
  "dick",
  "pussy",
  "motherfucker",
  "cunt",
  "nigger",
  "nigga"
];
const CHAT_BLOCKED_TERMS_AR = [
  "احا",
  "كسم",
  "كس ام",
  "كساخت",
  "متناك",
  "شرموط",
  "عرص",
  "خول",
  "قحبه",
  "قحبة",
  "طيز",
  "زبي",
  "زبك",
  "منيك",
  "منيكه",
  "ينيك"
];

const MATCH_SCORING = {
  exactScore: 6,
  correctResult: 5
};

const KNOCKOUT_MATCH_SCORING = {
  exactScore: 10,
  correctResult: 7
};

const FINAL_GROUP_STAGE_ROUND = "Group Stage - Round 3";
const ROUND_OF_32_ROUND = "Round of 32";

const SPECIAL_FEATURES = {
  doublePick: {
    key: "doublePick",
    label: "Double Pick",
    shortLabel: "X2",
    description: "Double the earned match points when your pick scores."
  },
  goalRush: {
    key: "goalRush",
    label: "Goal Rush",
    shortLabel: "GR",
    description: "Earn +1 bonus point for every real goal scored in the match."
  },
  perfectBoost: {
    key: "perfectBoost",
    label: "Perfect Boost",
    shortLabel: "PB",
    description: "An exact score pays 8 points instead of 6."
  },
  riskMode: {
    key: "riskMode",
    label: "Risk Mode",
    shortLabel: "RM",
    description: "All In: correct outcome pays 15 points, wrong outcome deducts 15."
  },
  extraTimeHunter: {
    key: "extraTimeHunter",
    label: "Extra Time Hunter",
    shortLabel: "ET",
    description: "Earn +3 bonus points if the real match reaches extra time."
  },
  cleanSheetMaster: {
    key: "cleanSheetMaster",
    label: "Clean Sheet Master",
    shortLabel: "CS",
    description: "Pick one team to keep a clean sheet and earn +5 if it happens."
  }
};

const GROUP_STAGE_SPECIAL_FEATURE_KEYS = ["doublePick", "goalRush", "perfectBoost"];
const ROUND_OF_32_SPECIAL_FEATURE_KEYS = ["riskMode", "extraTimeHunter", "cleanSheetMaster"];
const SPECIAL_FEATURE_KEYS = Object.keys(SPECIAL_FEATURES);
const SPECIAL_FEATURE_SCOPE_CONFIGS = {
  "group-stage-round-3": {
    key: "group-stage-round-3",
    title: "Round 3 Special Pick",
    note: "Use each feature once across the final group-stage round. Pick another one to switch instantly, or click the active one again to remove it.",
    scopeChip: "Round 3 only",
    loginSummary: "Log in to choose a special pick for this Round 3 match.",
    emptySummary: "Pick one optional feature for this match.",
    usedSummarySuffix: "already used on other Round 3 matches.",
    lockedEmptySummary: "Special picks are locked because the deadline has passed.",
    usageErrorLabel: "Round 3 match",
    featureKeys: GROUP_STAGE_SPECIAL_FEATURE_KEYS
  },
  "round-of-32": {
    key: "round-of-32",
    title: "Round of 32 Special Pick",
    note: "Each feature can be used only once across the entire Round of 32. Activate only one feature per match, switch before the deadline, or click the active one again to remove it.",
    scopeChip: "Round of 32 only",
    loginSummary: "Log in to choose a special pick for this Round of 32 match.",
    emptySummary: "Pick one optional feature for this Round of 32 match.",
    usedSummarySuffix: "already used on other Round of 32 matches.",
    lockedEmptySummary: "Round of 32 special picks are locked because the deadline has passed.",
    usageErrorLabel: "Round of 32 match",
    featureKeys: ROUND_OF_32_SPECIAL_FEATURE_KEYS
  }
};

const GROUP_SCORING = {
  correctQualifiedTeams: 8,
  thirdPlaceBonus: 2,
  qualifiedTeamsWithThirdBonus: 10
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

const ROUND_THEME_MAP = {
  "Group Stage - Round 2": "round-2",
  "Group Stage - Round 3": "round-3",
  "Round of 32": "knockout-finals",
  "Round of 16": "knockout-finals",
  "Quarter Finals": "knockout-finals",
  "Semi Finals": "knockout-finals",
  "Third Place Match": "knockout-finals",
  "Final": "knockout-finals"
};

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
  teamFilter: document.getElementById("teamFilter"),
  statusFilter: document.getElementById("statusFilter"),
  matchesContainer: document.getElementById("matchesContainer"),
  groupsContainer: document.getElementById("groupsContainer"),
  playerSearchInput: document.getElementById("playerSearchInput"),
  leaderboardPanel: document.getElementById("leaderboardPanel"),
  leaderboardBody: document.getElementById("leaderboardBody"),
  historyPlayerFilter: document.getElementById("historyPlayerFilter"),
  historyContainer: document.getElementById("historyContainer"),
  notificationShell: document.getElementById("notificationShell"),
  notificationButton: document.getElementById("notificationButton"),
  notificationBadge: document.getElementById("notificationBadge"),
  notificationPanel: document.getElementById("notificationPanel"),
  notificationMeta: document.getElementById("notificationMeta"),
  notificationList: document.getElementById("notificationList"),
  chatShell: document.getElementById("chatShell"),
  chatToggleButton: document.getElementById("chatToggleButton"),
  chatToggleBadge: document.getElementById("chatToggleBadge"),
  chatPanel: document.getElementById("chatPanel"),
  chatMeta: document.getElementById("chatMeta"),
  chatCountChip: document.getElementById("chatCountChip"),
  chatMessages: document.getElementById("chatMessages"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  chatCharCount: document.getElementById("chatCharCount"),
  chatEmojiToggle: document.getElementById("chatEmojiToggle"),
  chatEmojiTray: document.getElementById("chatEmojiTray"),
  adminGate: document.getElementById("adminGate"),
  adminWorkspace: document.getElementById("adminWorkspace"),
  toastStack: document.getElementById("toastStack"),
  particleField: document.getElementById("particleField")
};

const uiState = {
  leaderboardFlashUntil: 0,
  timerId: null,
  syncTimerId: null,
  notificationsOpen: false,
  chatOpen: false,
  chatEmojiOpen: false,
  historyFilterManuallyChanged: false,
  historyFilterPlayerContextId: "",
  adminRoundFilter: "",
  adminPredictionPlayerByMatch: {}
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

const derivedStateCache = new WeakMap();
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});
const chatTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

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
    chatMessages: [],
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
      adminUnlocked: Boolean(parsed?.adminUnlocked),
      notificationReadByPlayer: normalizeNotificationReadByPlayer(parsed?.notificationReadByPlayer),
      rankTrackingByPlayer: normalizeRankTrackingByPlayer(parsed?.rankTrackingByPlayer),
      chatLastSeenByPlayer: normalizeChatLastSeenByPlayer(parsed?.chatLastSeenByPlayer)
    };
  } catch (error) {
    console.warn("Could not load the local session. Resetting to defaults.", error);
    return createDefaultSessionState();
  }
}

function createDefaultSessionState() {
  return {
    activePlayerId: "",
    adminUnlocked: false,
    notificationReadByPlayer: {},
    rankTrackingByPlayer: {},
    chatLastSeenByPlayer: {}
  };
}

function getDerivedState(sourceState = state) {
  if (!sourceState || typeof sourceState !== "object") {
    return {
      playerById: new Map(),
      matchById: new Map(),
      groupById: new Map(),
      matchPredictionByKey: new Map(),
      groupPredictionByKey: new Map(),
      matchPredictionsByPlayerId: new Map(),
      groupPredictionsByPlayerId: new Map(),
      leaderboard: [],
      rankByPlayerId: new Map()
    };
  }

  const cached = derivedStateCache.get(sourceState);
  if (cached) {
    return cached;
  }

  const playerById = new Map();
  const matchById = new Map();
  const groupById = new Map();
  const matchPredictionByKey = new Map();
  const groupPredictionByKey = new Map();
  const matchPredictionsByPlayerId = new Map();
  const groupPredictionsByPlayerId = new Map();

  sourceState.players.forEach((player) => {
    playerById.set(String(player.id), player);
  });
  sourceState.matches.forEach((match) => {
    matchById.set(String(match.id), match);
  });
  sourceState.groups.forEach((group) => {
    groupById.set(String(group.id), group);
  });

  sourceState.matchPredictions.forEach((prediction) => {
    const playerId = String(prediction.playerId);
    const matchId = String(prediction.matchId);
    matchPredictionByKey.set(buildPredictionLookupKey(playerId, matchId), prediction);
    appendLookupListValue(matchPredictionsByPlayerId, playerId, prediction);
  });

  sourceState.groupPredictions.forEach((prediction) => {
    const playerId = String(prediction.playerId);
    const groupId = String(prediction.groupId);
    groupPredictionByKey.set(buildPredictionLookupKey(playerId, groupId), prediction);
    appendLookupListValue(groupPredictionsByPlayerId, playerId, prediction);
  });

  const leaderboard = sourceState.players.slice().sort(comparePlayersForLeaderboard);
  const rankByPlayerId = new Map(
    leaderboard.map((player, index) => [String(player.id), index + 1])
  );

  const derived = {
    playerById,
    matchById,
    groupById,
    matchPredictionByKey,
    groupPredictionByKey,
    matchPredictionsByPlayerId,
    groupPredictionsByPlayerId,
    leaderboard,
    rankByPlayerId
  };

  derivedStateCache.set(sourceState, derived);
  return derived;
}

function invalidateDerivedState(sourceState = state) {
  if (sourceState && typeof sourceState === "object") {
    derivedStateCache.delete(sourceState);
  }
}

function buildPredictionLookupKey(playerId, entityId) {
  return `${String(playerId)}::${String(entityId)}`;
}

function appendLookupListValue(map, key, value) {
  if (!map.has(key)) {
    map.set(key, []);
  }

  map.get(key).push(value);
}

function normalizeNotificationReadByPlayer(rawValue) {
  if (!rawValue || typeof rawValue !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawValue).map(([playerId, value]) => [
      String(playerId),
      Array.isArray(value)
        ? [...new Set(value.map((entryId) => String(entryId || "")).filter(Boolean))]
        : []
    ])
  );
}

function normalizeRankTrackingByPlayer(rawValue) {
  if (!rawValue || typeof rawValue !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawValue).map(([playerId, value]) => [
      String(playerId),
      {
        lastKnownRank: normalizeRankNumber(value?.lastKnownRank),
        latestChange: normalizeRankChangeEntry(value?.latestChange)
      }
    ])
  );
}

function normalizeChatLastSeenByPlayer(rawValue) {
  if (!rawValue || typeof rawValue !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(rawValue)
      .map(([playerId, value]) => [String(playerId), normalizeTimestamp(value)])
      .filter(([, value]) => Boolean(value))
  );
}

function normalizeRankChangeEntry(rawValue) {
  if (!rawValue || typeof rawValue !== "object") {
    return null;
  }

  const id = String(rawValue.id || "").trim();
  const detectedAt = String(rawValue.detectedAt || "").trim();
  if (!id || !detectedAt) {
    return null;
  }

  return {
    id,
    fromRank: normalizeRankNumber(rawValue.fromRank),
    toRank: normalizeRankNumber(rawValue.toRank),
    detectedAt
  };
}

function normalizeRankNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
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
    chatMessages: normalizeChatMessages(parsed.chatMessages),
    scheduleVersion: scheduleSource.version
  };

  const scheduleChanged = parsed.scheduleVersion !== scheduleSource.version;
  baseState.groups = Array.isArray(parsed.groups) && parsed.groups.length
    ? (
      scheduleChanged
        ? mergeStoredGroupsWithSchedule(parsed.groups)
        : parsed.groups.map((group) => normalizeGroup(
          group,
          scheduleSource.groupLookup,
          scheduleSource.groupDefaults[String(group?.id || "").trim()] || null
        ))
    )
    : scheduleSource.groups.map(cloneObject);
  baseState.matches = Array.isArray(parsed.matches) && parsed.matches.length
    ? (
      scheduleChanged
        ? mergeStoredMatchesWithSchedule(parsed.matches)
        : parsed.matches.map((match, index) => normalizeMatch(match, index, scheduleSource.groupLookup))
    )
    : scheduleSource.matches.map(cloneObject);

  syncGroupPredictionDeadlines(baseState.groups, baseState.matches);
  reconcilePredictions(baseState);
  return baseState;
}

function mergeStoredGroupsWithSchedule(storedGroups) {
  const storedGroupsById = new Map(
    storedGroups.map((group) => [String(group?.id || "").trim(), group])
  );

  return scheduleSource.groups.map((defaultGroup) => {
    const storedGroup = storedGroupsById.get(String(defaultGroup.id)) || null;
    if (!storedGroup) {
      return cloneObject(defaultGroup);
    }

    return normalizeGroup(
      {
        ...defaultGroup,
        ...storedGroup,
        id: defaultGroup.id,
        name: defaultGroup.name,
        teams: defaultGroup.teams.map(cloneObject),
        predictionDeadline: storedGroup.predictionDeadline ?? defaultGroup.predictionDeadline,
        actualFirst: storedGroup.actualFirst ?? defaultGroup.actualFirst,
        actualSecond: storedGroup.actualSecond ?? defaultGroup.actualSecond,
        actualThird: storedGroup.actualThird ?? defaultGroup.actualThird,
        actualThirdQualifies: typeof storedGroup.actualThirdQualifies === "boolean"
          ? storedGroup.actualThirdQualifies
          : defaultGroup.actualThirdQualifies
      },
      scheduleSource.groupLookup,
      scheduleSource.groupDefaults[String(defaultGroup.id)] || null
    );
  });
}

function mergeStoredMatchesWithSchedule(storedMatches) {
  const storedMatchesById = new Map(
    storedMatches.map((match) => [String(match?.id || "").trim(), match])
  );

  return scheduleSource.matches.map((defaultMatch, index) => {
    const storedMatch = storedMatchesById.get(String(defaultMatch.id)) || null;
    if (!storedMatch) {
      return cloneObject(defaultMatch);
    }

    return normalizeMatch(
      {
        ...defaultMatch,
        actualScoreA: storedMatch.actualScoreA ?? defaultMatch.actualScoreA,
        actualScoreB: storedMatch.actualScoreB ?? defaultMatch.actualScoreB,
        actualPenaltyWinner: storedMatch.actualPenaltyWinner ?? defaultMatch.actualPenaltyWinner,
        wentToExtraTime: Boolean(storedMatch.wentToExtraTime),
        isFinished: Boolean(storedMatch.isFinished),
        resultUpdatedAt: storedMatch.resultUpdatedAt ?? defaultMatch.resultUpdatedAt,
        teamALogo: storedMatch.teamALogo || defaultMatch.teamALogo,
        teamBLogo: storedMatch.teamBLogo || defaultMatch.teamBLogo
      },
      index,
      scheduleSource.groupLookup
    );
  });
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
      playerId: String(prediction.playerId),
      predictedPenaltyWinner: normalizeKnockoutWinnerChoice(prediction.predictedPenaltyWinner),
      specialFeature: normalizeSpecialFeature(prediction.specialFeature),
      specialFeatureTarget: normalizeSpecialFeatureTarget(prediction.specialFeatureTarget),
      basePoints: Number(prediction.basePoints || 0),
      specialBonusPoints: Number(prediction.specialBonusPoints || 0)
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

  nextState.chatMessages = normalizeChatMessages(nextState.chatMessages);
}

function reconcileSessionState() {
  const validPlayerIds = new Set(state.players.map((player) => String(player.id)));
  if (!validPlayerIds.has(sessionState.activePlayerId)) {
    sessionState.activePlayerId = "";
  }

  if (!sessionState.notificationReadByPlayer || typeof sessionState.notificationReadByPlayer !== "object") {
    sessionState.notificationReadByPlayer = {};
  }
  if (!sessionState.rankTrackingByPlayer || typeof sessionState.rankTrackingByPlayer !== "object") {
    sessionState.rankTrackingByPlayer = {};
  }
  if (!sessionState.chatLastSeenByPlayer || typeof sessionState.chatLastSeenByPlayer !== "object") {
    sessionState.chatLastSeenByPlayer = {};
  }

  Object.keys(sessionState.notificationReadByPlayer).forEach((playerId) => {
    if (!validPlayerIds.has(playerId)) {
      delete sessionState.notificationReadByPlayer[playerId];
    }
  });
  Object.keys(sessionState.rankTrackingByPlayer).forEach((playerId) => {
    if (!validPlayerIds.has(playerId)) {
      delete sessionState.rankTrackingByPlayer[playerId];
    }
  });
  Object.keys(sessionState.chatLastSeenByPlayer).forEach((playerId) => {
    if (!validPlayerIds.has(playerId)) {
      delete sessionState.chatLastSeenByPlayer[playerId];
    }
  });

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
  return Boolean(activeElement?.closest(".match-form, .group-form, .admin-match-form, .admin-player-prediction-form, .admin-group-form, .chat-form"));
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

  dom.roundFilter.addEventListener("change", handleMatchFilterChange);
  dom.groupFilter.addEventListener("change", handleMatchFilterChange);
  dom.teamFilter.addEventListener("change", handleMatchFilterChange);
  dom.statusFilter.addEventListener("change", handleMatchFilterChange);
  dom.playerSearchInput.addEventListener("input", renderLeaderboard);
  dom.historyPlayerFilter.addEventListener("change", () => {
    uiState.historyFilterManuallyChanged = true;
    uiState.historyFilterPlayerContextId = String(sessionState.activePlayerId || "");
    renderHistory();
  });

  document.addEventListener("submit", (event) => {
    void handleSubmit(event);
  });
  document.addEventListener("click", (event) => {
    void handleClick(event);
  });
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);
  document.addEventListener("keydown", handleKeydown);
}

function handleMatchFilterChange() {
  applyRoundTheme();
  renderMatches();
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

  if (form.id === "chatForm") {
    event.preventDefault();
    await handleChatMessage(form);
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

  if (form.matches(".admin-player-prediction-form")) {
    event.preventDefault();
    await handleAdminPlayerPredictionUpdate(form);
    return;
  }

  if (form.matches(".admin-group-form")) {
    event.preventDefault();
    await handleAdminGroupUpdate(form);
  }
}

async function handleClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (target.closest("[data-action='toggle-chat']")) {
    toggleChatPanel();
    return;
  }

  if (target.closest("[data-action='close-chat']")) {
    closeChatPanel();
    return;
  }

  if (target.closest("[data-action='toggle-emoji-picker']")) {
    toggleEmojiPicker();
    return;
  }

  if (target.closest("[data-action='insert-chat-emoji']")) {
    insertChatEmoji(target.closest("[data-action='insert-chat-emoji']"));
    return;
  }

  if (target.closest("[data-action='toggle-chat-reaction']")) {
    await handleChatReaction(target.closest("[data-action='toggle-chat-reaction']"));
    return;
  }

  if (target.closest("[data-action='toggle-notifications']")) {
    toggleNotifications();
    return;
  }

  if (target.closest("[data-action='toggle-special-feature']")) {
    handleSpecialFeatureToggle(target.closest("[data-action='toggle-special-feature']"));
    return;
  }

  if (uiState.notificationsOpen && !target.closest(".notification-shell")) {
    closeNotifications();
  }
  if (uiState.chatOpen && !target.closest(".chat-shell")) {
    closeChatPanel();
  }

  const actionTarget = target.closest("[data-action]");
  if (!actionTarget) {
    return;
  }

  if (actionTarget.matches("[data-action='calculate-points']")) {
    recalculatePoints();
    uiState.leaderboardFlashUntil = Date.now() + 1500;
    renderAll();
    showToast("Points calculated", "success");
    return;
  }

  if (actionTarget.matches("[data-action='reset-data']")) {
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
      draftState.chatMessages = nextState.chatMessages;
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

  if (actionTarget.matches("[data-action='export-leaderboard']")) {
    exportLeaderboard();
    return;
  }

  if (actionTarget.matches("[data-action='delete-player']")) {
    const select = document.getElementById("adminPlayerDelete");
    const playerId = String(select?.value || "");
    if (!playerId) {
      showToast("Select a player to delete", "error");
      return;
    }

    const player = state.players.find((item) => item.id === playerId);
    if (!player) {
      showToast("Player not found", "error");
      return;
    }

    const confirmed = window.confirm(`Delete player ${player.name} and all of their predictions?`);
    if (!confirmed) {
      return;
    }

    const result = await applySharedMutation((draftState) => {
      draftState.players = draftState.players.filter((item) => item.id !== playerId);
      draftState.matchPredictions = draftState.matchPredictions.filter((item) => item.playerId !== playerId);
      draftState.groupPredictions = draftState.groupPredictions.filter((item) => item.playerId !== playerId);
    });
    if (!result.ok) {
      return;
    }

    if (sessionState.activePlayerId === playerId) {
      sessionState.activePlayerId = "";
      saveSessionState();
    }

    renderAll();
    showToast("Player deleted", "success");
    return;
  }

  if (actionTarget.matches("[data-action='lock-admin']")) {
    sessionState.adminUnlocked = false;
    saveSessionState();
    renderAdmin();
  }
}

function handleKeydown(event) {
  if (event.key === "Escape" && uiState.notificationsOpen) {
    closeNotifications();
  }
  if (event.key === "Escape" && uiState.chatOpen) {
    closeChatPanel();
  }
}

function handleInput(event) {
  if (event.target.id === "chatInput") {
    renderChatCharacterCount();
    return;
  }

  const matchForm = event.target.closest(".match-form");
  if (matchForm) {
    syncMatchFormState(matchForm);
  }

  const adminMatchForm = event.target.closest(".admin-match-form");
  if (adminMatchForm) {
    syncAdminMatchFormState(adminMatchForm);
  }

  const adminPlayerPredictionForm = event.target.closest(".admin-player-prediction-form");
  if (adminPlayerPredictionForm) {
    syncAdminPlayerPredictionFormState(adminPlayerPredictionForm);
  }
}

function handleChange(event) {
  if (event.target.id === "importMatchesInput") {
    void importMatchesFromFile(event.target.files?.[0]);
    return;
  }

  if (event.target.id === "adminRoundFilter") {
    uiState.adminRoundFilter = String(event.target.value || "all");
    renderAdmin();
    return;
  }

  const matchForm = event.target.closest(".match-form");
  if (matchForm) {
    syncMatchFormState(matchForm);
  }

  const adminMatchForm = event.target.closest(".admin-match-form");
  if (adminMatchForm) {
    syncAdminMatchFormState(adminMatchForm);
  }

  const adminPlayerPredictionForm = event.target.closest(".admin-player-prediction-form");
  if (adminPlayerPredictionForm) {
    if (event.target.matches('select[name="playerId"]')) {
      uiState.adminPredictionPlayerByMatch[String(adminPlayerPredictionForm.dataset.matchId || "")] = String(event.target.value || "");
      loadAdminPlayerPredictionIntoForm(adminPlayerPredictionForm);
      return;
    }

    syncAdminPlayerPredictionFormState(adminPlayerPredictionForm);
  }

  const groupForm = event.target.closest(".group-form");
  if (groupForm) {
    if (event.target.matches('input[name="predictedThirdQualifies"]')) {
      enforceBestThirdSelectionLimit(groupForm, event.target);
    }
    if (event.target.matches('select[name="predictedFirst"], select[name="predictedSecond"], select[name="predictedThird"]')) {
      ensureUniqueGroupSelection(groupForm, event.target);
    }
    syncGroupFormState(groupForm);
  }
}

function handleSpecialFeatureToggle(button) {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const player = getActivePlayer();
  const form = button.closest(".match-form");
  if (!player || !(form instanceof HTMLFormElement)) {
    return;
  }

  const matchId = String(form.dataset.matchId || "");
  const match = state.matches.find((item) => String(item.id) === matchId);
  if (!match || !isSpecialFeatureMatch(match) || !isPredictionOpen(match.predictionDeadline)) {
    return;
  }

  const hiddenInput = form.querySelector('input[name="specialFeature"]');
  if (!(hiddenInput instanceof HTMLInputElement) || button.disabled) {
    return;
  }

  const featureKey = normalizeSpecialFeatureForMatch(button.dataset.feature, match);
  if (!featureKey) {
    return;
  }

  const nextFeature = hiddenInput.value === featureKey ? "" : featureKey;
  const targetSelect = form.querySelector('select[name="specialFeatureTarget"]');
  hiddenInput.value = nextFeature;
  if (targetSelect instanceof HTMLSelectElement && nextFeature !== "cleanSheetMaster") {
    targetSelect.value = "";
  }
  syncMatchFormStates();
}

function enforceBestThirdSelectionLimit(form, checkbox) {
  if (!checkbox?.checked) {
    return;
  }

  const player = getActivePlayer();
  if (!player) {
    return;
  }

  const groupId = String(form?.dataset.groupId || "");
  if (countPlayerBestThirdSelections(player.id, groupId) >= BEST_THIRD_QUALIFIERS_COUNT) {
    checkbox.checked = false;
    showToast(`Maximum best third selections is ${BEST_THIRD_QUALIFIERS_COUNT} teams`, "error");
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
        specialPoints: 0,
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
  const predictedPenaltyWinner = requiresKnockoutWinner(match, predictedScoreA, predictedScoreB)
    ? normalizeKnockoutWinnerChoice(formData.get("predictedPenaltyWinner"))
    : "";
  const specialFeature = isSpecialFeatureMatch(match)
    ? normalizeSpecialFeatureForMatch(formData.get("specialFeature"), match)
    : "";
  const specialFeatureTarget = specialFeature === "cleanSheetMaster"
    ? normalizeSpecialFeatureTarget(formData.get("specialFeatureTarget"))
    : "";

  if (predictedScoreA === null || predictedScoreB === null) {
    showToast("Scores must be numbers 0 or higher", "error");
    return;
  }

  if (requiresKnockoutWinner(match, predictedScoreA, predictedScoreB) && !predictedPenaltyWinner) {
    showToast("Choose the penalty shootout winner for knockout draws", "error");
    return;
  }

  if (specialFeature === "cleanSheetMaster" && !specialFeatureTarget) {
    showToast("Choose which team will keep the clean sheet", "error");
    return;
  }

  const previousPrediction = getMatchPrediction(player.id, matchId);
  const hadExistingPrediction = Boolean(previousPrediction);
  const previousSpecialFeature = normalizeSpecialFeatureForMatch(previousPrediction?.specialFeature, match);
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

    validateSpecialFeatureSelection(draftPlayer.id, draftMatch, specialFeature, draftState);

    if (existingPrediction) {
      existingPrediction.predictedScoreA = predictedScoreA;
      existingPrediction.predictedScoreB = predictedScoreB;
      existingPrediction.predictedPenaltyWinner = predictedPenaltyWinner;
      existingPrediction.specialFeature = specialFeature;
      existingPrediction.specialFeatureTarget = specialFeatureTarget;
      existingPrediction.submittedAt = now;
      existingPrediction.points = 0;
      existingPrediction.basePoints = 0;
      existingPrediction.specialBonusPoints = 0;
      return;
    }

    draftState.matchPredictions.push({
      id: createId("mp"),
      playerId: draftPlayer.id,
      playerName: draftPlayer.name,
      matchId,
      predictedScoreA,
      predictedScoreB,
      predictedPenaltyWinner,
      specialFeature,
      specialFeatureTarget,
      submittedAt: now,
      points: 0,
      basePoints: 0,
      specialBonusPoints: 0
    });
  });

  if (!result.ok) {
    return;
  }

  renderAll();
  if (specialFeature && previousSpecialFeature !== specialFeature) {
    showToast(`${getPredictionFeatureLabel(specialFeature)} activated for ${match.teamA} vs ${match.teamB}`, "success");
    return;
  }

  if (!specialFeature && previousSpecialFeature) {
    showToast(`Special feature removed from ${match.teamA} vs ${match.teamB}`, "success");
    return;
  }

  showToast(hadExistingPrediction ? "Prediction updated" : "Prediction saved", "success");
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

async function handleChatMessage(form) {
  const player = getActivePlayer();
  if (!player) {
    showToast("Log in first to use the player chat", "error");
    document.getElementById("login").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const formData = new FormData(form);
  const messageText = normalizeChatMessageText(formData.get("message"));
  if (!messageText) {
    showToast("Write a message before sending", "error");
    return;
  }

  if (containsBlockedChatLanguage(messageText)) {
    showToast("Please remove offensive words before sending your message", "error");
    return;
  }

  const result = await applySharedMutation((draftState) => {
    const draftPlayer = draftState.players.find((item) => item.id === player.id);
    if (!draftPlayer) {
      throw new Error("Player session expired. Please log in again.");
    }

    draftState.chatMessages.push({
      id: createId("chat"),
      playerId: draftPlayer.id,
      playerName: draftPlayer.name,
      text: messageText,
      createdAt: new Date().toISOString()
    });
    draftState.chatMessages = normalizeChatMessages(draftState.chatMessages);
  });

  if (!result.ok) {
    return;
  }

  form.reset();
  renderAll();
  showToast("Message sent", "success");
}

async function handleChatReaction(button) {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  const player = getActivePlayer();
  if (!player) {
    showToast("Log in first to react to chat messages", "error");
    return;
  }

  const messageId = String(button.dataset.messageId || "");
  const emoji = String(button.dataset.emoji || "");
  if (!messageId || !CHAT_REACTION_EMOJIS.includes(emoji)) {
    return;
  }

  const result = await applySharedMutation((draftState) => {
    const draftMessage = draftState.chatMessages.find((message) => String(message.id) === messageId);
    if (!draftMessage) {
      throw new Error("Chat message not found");
    }

    if (String(draftMessage.playerId) === player.id) {
      throw new Error("You cannot react to your own message");
    }

    draftMessage.reactions = normalizeChatReactions(draftMessage.reactions);
    const existingIndex = draftMessage.reactions.findIndex((reaction) => reaction.playerId === player.id);

    if (existingIndex >= 0 && draftMessage.reactions[existingIndex].emoji === emoji) {
      draftMessage.reactions.splice(existingIndex, 1);
    } else if (existingIndex >= 0) {
      draftMessage.reactions[existingIndex] = {
        playerId: player.id,
        playerName: player.name,
        emoji,
        reactedAt: new Date().toISOString()
      };
    } else {
      draftMessage.reactions.push({
        playerId: player.id,
        playerName: player.name,
        emoji,
        reactedAt: new Date().toISOString()
      });
    }

    draftState.chatMessages = normalizeChatMessages(draftState.chatMessages);
  });

  if (!result.ok) {
    return;
  }

  renderAll();
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
  const actualPenaltyWinnerRaw = formData.get("actualPenaltyWinner");
  const isFinished = formData.get("isFinished") === "on";
  const wentToExtraTime = isKnockoutMatch(match) && (
    formData.get("wentToExtraTime") === "on"
    || Boolean(normalizeKnockoutWinnerChoice(actualPenaltyWinnerRaw))
  );

  if (!matchDateRaw) {
    showToast("Match date is required", "error");
    return;
  }

  const matchDate = parseDateTimeLocal(matchDateRaw);
  const predictionDeadline = deadlineRaw ? parseDateTimeLocal(deadlineRaw) : calculateDeadlineFromMatchDate(matchDate);
  const actualScoreA = actualScoreAValue === "" ? null : parseScoreInput(actualScoreAValue);
  const actualScoreB = actualScoreBValue === "" ? null : parseScoreInput(actualScoreBValue);
  const actualPenaltyWinner = requiresKnockoutWinner(match, actualScoreA, actualScoreB)
    ? normalizeKnockoutWinnerChoice(actualPenaltyWinnerRaw)
    : "";

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

  if (isFinished && requiresKnockoutWinner(match, actualScoreA, actualScoreB) && !actualPenaltyWinner) {
    showToast("Choose the penalty shootout winner for knockout draws", "error");
    return;
  }

  const result = await applySharedMutation((draftState) => {
    const draftMatch = draftState.matches.find((item) => String(item.id) === matchId);
    if (!draftMatch) {
      throw new Error("Match not found");
    }

    const resultChanged = (
      draftMatch.actualScoreA !== actualScoreA
      || draftMatch.actualScoreB !== actualScoreB
      || normalizeKnockoutWinnerChoice(draftMatch.actualPenaltyWinner) !== actualPenaltyWinner
      || Boolean(draftMatch.wentToExtraTime) !== Boolean(wentToExtraTime)
      || draftMatch.isFinished !== isFinished
    );
    const nextResultReady = Boolean(isFinished && actualScoreA !== null && actualScoreB !== null);

    draftMatch.matchDate = matchDate;
    draftMatch.predictionDeadline = predictionDeadline;
    draftMatch.actualScoreA = actualScoreA;
    draftMatch.actualScoreB = actualScoreB;
    draftMatch.actualPenaltyWinner = (nextResultReady && requiresKnockoutWinner(draftMatch, actualScoreA, actualScoreB))
      ? actualPenaltyWinner
      : null;
    draftMatch.wentToExtraTime = nextResultReady ? Boolean(wentToExtraTime) : false;
    draftMatch.isFinished = isFinished;
    if (nextResultReady && resultChanged) {
      draftMatch.resultUpdatedAt = new Date().toISOString();
    } else if (!nextResultReady) {
      draftMatch.resultUpdatedAt = null;
    }

    syncGroupPredictionDeadlines(draftState.groups, draftState.matches);
  });

  if (!result.ok) {
    return;
  }

  renderAll();
  showToast("Match result updated", "success");
}

async function handleAdminPlayerPredictionUpdate(form) {
  const matchId = String(form.dataset.matchId || "");
  const playerId = String(new FormData(form).get("playerId") || "").trim();
  const match = state.matches.find((item) => String(item.id) === matchId);
  const player = state.players.find((item) => String(item.id) === playerId);

  if (!match) {
    showToast("Match not found", "error");
    return;
  }

  if (!playerId || !player) {
    showToast("Select a player first", "error");
    return;
  }

  const formData = new FormData(form);
  const predictedScoreA = parseScoreInput(formData.get("predictedScoreA"));
  const predictedScoreB = parseScoreInput(formData.get("predictedScoreB"));
  const predictedPenaltyWinner = requiresKnockoutWinner(match, predictedScoreA, predictedScoreB)
    ? normalizeKnockoutWinnerChoice(formData.get("predictedPenaltyWinner"))
    : "";
  const specialFeature = isSpecialFeatureMatch(match)
    ? normalizeSpecialFeatureForMatch(formData.get("specialFeature"), match)
    : "";
  const specialFeatureTarget = specialFeature === "cleanSheetMaster"
    ? normalizeSpecialFeatureTarget(formData.get("specialFeatureTarget"))
    : "";
  const existingPrediction = getMatchPrediction(playerId, matchId);
  const preserveSubmittedAt = formData.get("preserveSubmittedAt") === "on" && Boolean(existingPrediction);
  const submittedAtRaw = String(formData.get("submittedAt") || "").trim();
  const parsedSubmittedAt = submittedAtRaw
    ? normalizeTimestamp(parseDateTimeLocal(submittedAtRaw))
    : null;

  if (predictedScoreA === null || predictedScoreB === null) {
    showToast("Prediction scores must be numbers 0 or higher", "error");
    return;
  }

  if (requiresKnockoutWinner(match, predictedScoreA, predictedScoreB) && !predictedPenaltyWinner) {
    showToast("Choose the penalty shootout winner for knockout draws", "error");
    return;
  }

  if (specialFeature === "cleanSheetMaster" && !specialFeatureTarget) {
    showToast("Choose which team keeps the clean sheet", "error");
    return;
  }

  if (!preserveSubmittedAt && !parsedSubmittedAt) {
    showToast("Enter a valid submission time", "error");
    return;
  }

  const result = await applySharedMutation((draftState) => {
    const draftMatch = draftState.matches.find((item) => String(item.id) === matchId);
    const draftPlayer = draftState.players.find((item) => String(item.id) === playerId);
    const draftPrediction = getMatchPrediction(playerId, matchId, draftState);

    if (!draftMatch) {
      throw new Error("Match not found");
    }

    if (!draftPlayer) {
      throw new Error("Player not found");
    }

    validateSpecialFeatureSelection(draftPlayer.id, draftMatch, specialFeature, draftState);

    const fallbackSubmittedAt = normalizeTimestamp(
      draftPrediction?.submittedAt || draftMatch.predictionDeadline || draftMatch.matchDate || new Date().toISOString()
    ) || new Date().toISOString();
    const nextSubmittedAt = preserveSubmittedAt
      ? fallbackSubmittedAt
      : (parsedSubmittedAt || fallbackSubmittedAt);

    if (draftPrediction) {
      draftPrediction.predictedScoreA = predictedScoreA;
      draftPrediction.predictedScoreB = predictedScoreB;
      draftPrediction.predictedPenaltyWinner = predictedPenaltyWinner;
      draftPrediction.specialFeature = specialFeature;
      draftPrediction.specialFeatureTarget = specialFeatureTarget;
      draftPrediction.submittedAt = nextSubmittedAt;
      draftPrediction.playerName = draftPlayer.name;
      draftPrediction.points = 0;
      draftPrediction.basePoints = 0;
      draftPrediction.specialBonusPoints = 0;
      return { updated: true };
    }

    draftState.matchPredictions.push({
      id: createId("mp"),
      playerId: draftPlayer.id,
      playerName: draftPlayer.name,
      matchId,
      predictedScoreA,
      predictedScoreB,
      predictedPenaltyWinner,
      specialFeature,
      specialFeatureTarget,
      submittedAt: parsedSubmittedAt || fallbackSubmittedAt,
      points: 0,
      basePoints: 0,
      specialBonusPoints: 0
    });

    return { updated: false };
  });

  if (!result.ok) {
    return;
  }

  renderAll();
  showToast(result.result?.updated ? "Player prediction updated" : "Player prediction added", "success");
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

function normalizeSpecialFeature(value) {
  const normalizedValue = String(value || "").trim();
  return SPECIAL_FEATURE_KEYS.includes(normalizedValue) ? normalizedValue : "";
}

function getSpecialFeature(featureKey) {
  return SPECIAL_FEATURES[normalizeSpecialFeature(featureKey)] || null;
}

function getSpecialFeatureScope(match) {
  if (!match) {
    return "";
  }

  if (match.round === FINAL_GROUP_STAGE_ROUND && match.group) {
    return "group-stage-round-3";
  }

  if (match.round === ROUND_OF_32_ROUND) {
    return "round-of-32";
  }

  return "";
}

function getSpecialFeatureScopeConfig(matchOrScope) {
  const scopeKey = typeof matchOrScope === "string"
    ? matchOrScope
    : getSpecialFeatureScope(matchOrScope);

  return SPECIAL_FEATURE_SCOPE_CONFIGS[scopeKey] || null;
}

function getMatchSpecialFeatureKeys(match) {
  return getSpecialFeatureScopeConfig(match)?.featureKeys || [];
}

function normalizeSpecialFeatureForMatch(value, match) {
  const featureKey = normalizeSpecialFeature(value);
  return getMatchSpecialFeatureKeys(match).includes(featureKey) ? featureKey : "";
}

function isSpecialFeatureMatch(match) {
  return Boolean(getSpecialFeatureScope(match));
}

function getPlayerSpecialFeatureUsage(playerId, scopeKey, sourceState = state, excludeMatchId = "") {
  const derived = getDerivedState(sourceState);
  const usage = new Map();
  const predictions = derived.matchPredictionsByPlayerId.get(String(playerId)) || [];

  predictions.forEach((prediction) => {
    const matchId = String(prediction.matchId || "");
    if (excludeMatchId && matchId === String(excludeMatchId)) {
      return;
    }

    const match = derived.matchById.get(matchId) || null;
    const featureKey = normalizeSpecialFeatureForMatch(prediction.specialFeature, match);
    if (!featureKey || getSpecialFeatureScope(match) !== scopeKey) {
      return;
    }

    usage.set(featureKey, matchId);
  });

  return usage;
}

function getCurrentSpecialFeatureSelections(scopeKey) {
  const selections = new Map();

  document.querySelectorAll('.match-form input[name="specialFeature"]').forEach((input) => {
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const form = input.closest(".match-form");
    const matchId = String(form?.dataset.matchId || "");
    if (!matchId) {
      return;
    }

    const match = state.matches.find((item) => String(item.id) === matchId);
    if (!match || getSpecialFeatureScope(match) !== scopeKey) {
      return;
    }

    const featureKey = normalizeSpecialFeatureForMatch(input.value, match);
    if (!featureKey) {
      return;
    }

    selections.set(featureKey, matchId);
  });

  return selections;
}

function validateSpecialFeatureSelection(playerId, match, specialFeature, sourceState = state) {
  if (!specialFeature) {
    return;
  }

  const scopeConfig = getSpecialFeatureScopeConfig(match);
  if (!scopeConfig) {
    throw new Error("Special features are not available for this match.");
  }

  if (!getMatchSpecialFeatureKeys(match).includes(specialFeature)) {
    throw new Error("This feature is not available for the selected match.");
  }

  const existingUsage = getPlayerSpecialFeatureUsage(playerId, scopeConfig.key, sourceState, match.id);
  const usedMatchId = existingUsage.get(specialFeature);
  if (usedMatchId && usedMatchId !== String(match.id)) {
    throw new Error(`${getSpecialFeature(specialFeature)?.label || "This feature"} is already used on another ${scopeConfig.usageErrorLabel}.`);
  }
}

function getPredictionFeatureLabel(featureKey) {
  return getSpecialFeature(featureKey)?.label || "";
}

function getFeatureTargetLabel(targetValue, match) {
  const target = normalizeSpecialFeatureTarget(targetValue);
  if (target === "teamA") {
    return String(match?.teamA || "Home Team");
  }
  if (target === "teamB") {
    return String(match?.teamB || "Away Team");
  }
  return "";
}

function getPredictionFeatureDisplayText(prediction, match) {
  const featureKey = normalizeSpecialFeatureForMatch(prediction?.specialFeature, match);
  const feature = getSpecialFeature(featureKey);
  if (!feature) {
    return "";
  }

  if (featureKey === "cleanSheetMaster") {
    const targetLabel = getFeatureTargetLabel(prediction?.specialFeatureTarget, match);
    return targetLabel ? `${feature.label}: ${targetLabel}` : feature.label;
  }

  return feature.label;
}

function renderAll() {
  applyRoundTheme();
  renderStats();
  renderWelcomeCard();
  renderNotifications();
  renderMatches();
  renderGroups();
  renderLeaderboard();
  renderHistoryPlayerFilter();
  renderHistory();
  renderChat();
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

function renderNotifications() {
  if (!dom.notificationButton || !dom.notificationPanel || !dom.notificationList || !dom.notificationMeta) {
    return;
  }

  const player = getActivePlayer();
  const entries = player ? getPlayerNotificationEntries(player.id) : [];
  const urgentEntries = entries.filter((entry) => entry.persistent);
  const hasUrgentReminders = urgentEntries.length > 0;

  if (player && uiState.notificationsOpen) {
    markPlayerNotificationsAsRead(
      player.id,
      entries.filter((entry) => !entry.persistent).map((entry) => entry.id)
    );
  }

  const unreadIds = player ? getUnreadNotificationIds(player.id, entries) : new Set();
  const unreadCount = unreadIds.size;

  dom.notificationButton.setAttribute("aria-expanded", String(uiState.notificationsOpen));
  dom.notificationButton.classList.toggle("is-urgent", hasUrgentReminders);
  dom.notificationBadge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
  dom.notificationBadge.classList.toggle("hidden", unreadCount === 0);
  dom.notificationPanel.classList.toggle("hidden", !uiState.notificationsOpen);

  if (!player) {
    dom.notificationMeta.textContent = "Sign in to see match reminders, active special picks, special feature results, and rank updates.";
    dom.notificationList.innerHTML = `
      <div class="notification-empty">
        Log in with your player name first, then open the bell to see match reminders, active special picks, special feature results, and leaderboard changes.
      </div>
    `;
    return;
  }

  dom.notificationMeta.textContent = hasUrgentReminders
    ? `${urgentEntries.length} match${urgentEntries.length === 1 ? "" : "es"} today still need your prediction`
    : entries.length
      ? `${entries.length} update${entries.length === 1 ? "" : "s"} for ${player.name}`
      : `No reminders or rank updates yet for ${player.name}`;

  if (!entries.length) {
    dom.notificationList.innerHTML = `
      <div class="notification-empty">
        Your notifications will appear here when you have a same-day match reminder, an active special pick, a special feature result, or a leaderboard rank change.
      </div>
    `;
    return;
  }

  dom.notificationList.innerHTML = entries.map((entry) => `
    <article class="notification-item ${unreadIds.has(entry.id) ? "is-unread" : ""} ${entry.persistent ? "is-reminder" : ""}">
      <div class="notification-item-topline">
        <strong class="notification-item-title">${escapeHtml(entry.title)}</strong>
      </div>
      <div class="notification-item-subline">
        <span class="status-tag ${entry.status.className}">${escapeHtml(entry.status.label)}</span>
        <span class="chip">${escapeHtml(entry.context)}</span>
      </div>
      <p class="notification-item-copy">${escapeHtml(entry.summary)}</p>
      <p class="notification-item-copy">${escapeHtml(entry.actual)}</p>
      <div class="notification-item-time">${escapeHtml(entry.timeLabel || "Updated")}: ${escapeHtml(formatDateTime(entry.resolvedAt))}</div>
    </article>
  `).join("");
}

function renderSyncBanner() {
  if (!dom.syncBanner) {
    return;
  }

  dom.syncBanner.textContent = getPersistenceLabel(persistence.status);
  dom.syncBanner.title = persistence.message;
  dom.syncBanner.className = `sync-banner sync-banner-${persistence.status}`;
}

function setPersistenceStatus(status, message) {
  persistence.status = status;
  persistence.message = message;
  renderSyncBanner();
}

function getPersistenceLabel(status) {
  if (status === "connected") {
    return "Connected";
  }
  if (status === "disconnected") {
    return "Offline";
  }
  return "Connecting";
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
  const hasConfiguredFirebase = remoteStorageConfig.provider === "firebase-rest"
    && remoteStorageConfig.firebaseDatabaseUrl;

  if (hasConfiguredFirebase) {
    candidates.push({
      id: `firebase-rest:${remoteStorageConfig.firebaseDatabaseUrl}`,
      kind: "firebase-rest",
      databaseUrl: remoteStorageConfig.firebaseDatabaseUrl,
      auth: remoteStorageConfig.firebaseAuth,
      statePath: remoteStorageConfig.firebaseStatePath
    });
  }

  if (!hasConfiguredFirebase) {
    SHARED_STATE_ENDPOINTS.forEach((endpoint) => {
      candidates.push({
        id: `http-json:${endpoint}`,
        kind: "http-json",
        endpoint
      });
    });
  }

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
    return "concted";
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
  const filteredMatches = state.matches
    .slice()
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
    .filter((match) => {
      const isOpen = isPredictionOpen(match.predictionDeadline);
      const status = isOpen ? "open" : "closed";
      const roundMatch = filters.round === "all" || match.round === filters.round;
      const groupMatch = filters.group === "all" || getMatchGroupLabel(match) === filters.group;
      const teamMatch = filters.team === "all"
        || normalizeName(match.teamA) === filters.team
        || normalizeName(match.teamB) === filters.team;
      const statusMatch = filters.status === "all" || status === filters.status;
      return roundMatch && groupMatch && teamMatch && statusMatch;
    });

  const matches = sortMatchesForDisplay(filteredMatches, player);

  if (!matches.length) {
    dom.matchesContainer.innerHTML = `<div class="empty-state">No matches fit the current filters.</div>`;
    return;
  }

  const groupedByRound = groupBy(matches, (match) => match.round);
  const roundMarkup = Object.keys(groupedByRound).map((roundName) => {
    const roundMatches = groupedByRound[roundName];

    return `
      <section class="round-section panel">
        <div class="round-section-header">
          <h3>${escapeHtml(roundName)}</h3>
          <span class="chip">${roundMatches.length} match${roundMatches.length === 1 ? "" : "es"}</span>
        </div>
        <div class="cards-grid match-grid">
          ${roundMatches.map((match) => renderMatchCard(match, player)).join("")}
        </div>
      </section>
    `;
  }).join("");

  dom.matchesContainer.innerHTML = roundMarkup;
  syncMatchFormStates();
}

function renderMatchCard(match, player) {
  const isOpen = isPredictionOpen(match.predictionDeadline);
  const prediction = player ? getMatchPrediction(player.id, match.id) : null;
  const isLocked = !isOpen;
  const hasSpecialFeature = isSpecialFeatureMatch(match);
  const buttonLabel = !isOpen
    ? "Prediction Closed"
    : prediction
      ? "Update Prediction"
      : "Submit Prediction";

  const actualScore = formatMatchScoreline(match);

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

      <form
        class="match-form"
        data-match-id="${escapeHtml(match.id)}"
        data-initial-score-a="${escapeHtml(prediction ? prediction.predictedScoreA : "")}"
        data-initial-score-b="${escapeHtml(prediction ? prediction.predictedScoreB : "")}"
        data-initial-penalty-winner="${escapeHtml(prediction?.predictedPenaltyWinner || "")}"
        data-initial-special-feature="${escapeHtml(prediction?.specialFeature || "")}"
        data-initial-special-feature-target="${escapeHtml(prediction?.specialFeatureTarget || "")}"
      >
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
        ${isKnockoutMatch(match) ? renderShootoutPicker(match, prediction, isLocked) : ""}
        ${hasSpecialFeature ? renderSpecialFeaturePicker(match, prediction, isOpen) : ""}
        <div class="inline-actions">
          <button class="primary-button" type="submit" data-role="match-submit" ${isLocked ? "disabled" : ""}>${buttonLabel}</button>
          <span class="deadline-note">Deadline: ${escapeHtml(formatDateTime(match.predictionDeadline))}</span>
        </div>
      </form>

      ${prediction ? `
        <p class="prediction-meta">
          ${escapeHtml(getMatchPredictionMetaText(prediction, match))}
        </p>
      ` : `<p class="prediction-meta">No prediction saved for this player yet.</p>`}

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

function renderSpecialFeaturePicker(match, prediction, isOpen) {
  const scopeConfig = getSpecialFeatureScopeConfig(match);
  const selectedFeature = normalizeSpecialFeatureForMatch(prediction?.specialFeature, match);
  const selectedFeatureTarget = normalizeSpecialFeatureTarget(prediction?.specialFeatureTarget);

  if (!scopeConfig) {
    return "";
  }

  return `
    <div class="special-feature-panel">
      <div class="special-feature-header">
        <div>
          <strong>${escapeHtml(scopeConfig.title)}</strong>
          <p class="deadline-note">${escapeHtml(scopeConfig.note)}</p>
        </div>
        <div class="chip-row">
          <span class="chip special-feature-scope">${escapeHtml(scopeConfig.scopeChip)}</span>
          ${!isOpen ? `<span class="chip special-feature-lock-chip">${renderLockIcon()} Locked</span>` : ""}
        </div>
      </div>
      <input type="hidden" name="specialFeature" value="${escapeHtml(selectedFeature)}">
      <div class="special-feature-list" role="group" aria-label="Special prediction features">
        ${scopeConfig.featureKeys.map((featureKey) => {
          const feature = SPECIAL_FEATURES[featureKey];
          return `
            <button
              class="special-feature-button ${selectedFeature === featureKey ? "is-active" : ""} ${!isOpen ? "is-locked" : ""}"
              type="button"
              data-action="toggle-special-feature"
              data-role="special-feature-button"
              data-feature="${escapeHtml(featureKey)}"
              aria-pressed="${selectedFeature === featureKey ? "true" : "false"}"
              ${!isOpen ? "disabled" : ""}
            >
              ${!isOpen ? `<span class="special-feature-lock-mark" aria-hidden="true">${renderLockIcon()}</span>` : ""}
              <span class="special-feature-symbol" aria-hidden="true">${renderSpecialFeatureIcon(featureKey)}</span>
              <span class="special-feature-copy">
                <strong>${escapeHtml(feature.label)}</strong>
                <span>${escapeHtml(feature.description)}</span>
              </span>
            </button>
          `;
        }).join("")}
      </div>
      ${renderSpecialFeatureTargetPicker(match, selectedFeature, selectedFeatureTarget, isOpen)}
      <p class="special-feature-summary" data-role="special-feature-summary"></p>
    </div>
  `;
}

function renderSpecialFeatureTargetPicker(match, selectedFeature, selectedFeatureTarget, isOpen) {
  if (!getMatchSpecialFeatureKeys(match).includes("cleanSheetMaster")) {
    return "";
  }

  const shouldShow = selectedFeature === "cleanSheetMaster";

  return `
    <div class="shootout-picker special-feature-target-picker ${shouldShow ? "" : "hidden"} ${shouldShow && !selectedFeatureTarget ? "is-required" : ""}" data-role="special-feature-target-picker">
      <label class="select-box">
        <span>Clean sheet team</span>
        <select name="specialFeatureTarget" data-role="special-feature-target-select" ${!shouldShow || !isOpen ? "disabled" : ""}>
          <option value="">Select team</option>
          <option value="teamA" ${selectedFeatureTarget === "teamA" ? "selected" : ""}>${escapeHtml(match.teamA)}</option>
          <option value="teamB" ${selectedFeatureTarget === "teamB" ? "selected" : ""}>${escapeHtml(match.teamB)}</option>
        </select>
      </label>
      <p class="deadline-note">Required for Clean Sheet Master. Pick the team you expect to concede zero goals.</p>
    </div>
  `;
}

function renderShootoutPicker(match, prediction, isLocked) {
  const selectedWinner = normalizeKnockoutWinnerChoice(prediction?.predictedPenaltyWinner);
  const shouldShow = requiresKnockoutWinner(match, prediction?.predictedScoreA ?? null, prediction?.predictedScoreB ?? null);

  return `
    <div class="shootout-picker ${shouldShow ? "" : "hidden"}" data-role="shootout-picker">
      <label class="select-box">
        <span>Penalty shootout winner</span>
        <select name="predictedPenaltyWinner" data-role="shootout-winner-select" ${isLocked || !shouldShow ? "disabled" : ""}>
          <option value="">Select winner</option>
          <option value="teamA" ${selectedWinner === "teamA" ? "selected" : ""}>${escapeHtml(match.teamA)}</option>
          <option value="teamB" ${selectedWinner === "teamB" ? "selected" : ""}>${escapeHtml(match.teamB)}</option>
        </select>
      </label>
      <p class="deadline-note">Knockout matches cannot end in a draw. If you predict a level score, choose who advances on penalties.</p>
    </div>
  `;
}

function renderSpecialFeatureIcon(featureKey) {
  if (featureKey === "doublePick") {
    return `<span class="special-feature-text-icon">X2</span>`;
  }

  if (featureKey === "riskMode") {
    return `<span class="special-feature-emoji-icon">💣</span>`;
  }

  if (featureKey === "extraTimeHunter") {
    return `<span class="special-feature-emoji-icon">⏱️</span>`;
  }

  if (featureKey === "cleanSheetMaster") {
    return `<span class="special-feature-emoji-icon">🧤</span>`;
  }

  if (featureKey === "goalRush") {
    return `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <circle cx="12" cy="12" r="7.25" fill="none" stroke="currentColor" stroke-width="1.8"/>
        <path d="m12 8.65 2.35 1.7-.9 2.75h-2.9l-.9-2.75L12 8.65Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="m9.55 10.35-2.55-.3m7.45.3 2.55-.3m-6.35 3.05-1.45 2.25m5.6-2.25 1.45 2.25" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="m12 3 2.05 4.15 4.58.67-3.31 3.23.78 4.56L12 13.45 7.9 15.61l.78-4.56-3.31-3.23 4.58-.67L12 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="12" cy="10.4" r="1.1" fill="currentColor"/>
    </svg>
  `;
}

function getMatchPredictionMetaText(prediction, match) {
  const featureLabel = isSpecialFeatureMatch(match)
    ? getPredictionFeatureDisplayText(prediction, match)
    : "";
  const predictionSummary = formatPredictionScoreline(prediction, match);

  if (!match.isFinished) {
    return featureLabel
      ? `Prediction saved: ${predictionSummary}. ${featureLabel} is selected for this match until the deadline.`
      : `Prediction saved: ${predictionSummary}. You can update it until the deadline.`;
  }

  const parts = [`Prediction submitted - earned ${prediction.points || 0} pts`];
  const pointsBreakdown = getMatchPointsBreakdownText(prediction, match);
  if (pointsBreakdown) {
    parts.push(pointsBreakdown);
  }
  if (featureLabel) {
    parts.push(`Feature: ${featureLabel}`);
  }

  return parts.join(" • ");
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
          ? `${isGroupResultReady(group) ? `Prediction submitted - earned ${prediction.points} pts` : "Prediction submitted"}`
          : "No prediction saved for this player yet."}
      </p>

      <div class="group-summary-grid">
        <span class="chip">Actual 1st: ${escapeHtml(group.actualFirst || "Pending")}</span>
        <span class="chip">Actual 2nd: ${escapeHtml(group.actualSecond || "Pending")}</span>
        <span class="chip">Actual 3rd: ${escapeHtml(group.actualThird || "Pending")}</span>
        <span class="chip">Best third: ${group.actualThird === null ? "Pending" : group.actualThirdQualifies ? "Yes" : "No"}</span>
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

function syncMatchFormStates() {
  const player = getActivePlayer();
  const forms = Array.from(document.querySelectorAll(".match-form"))
    .filter((form) => form instanceof HTMLFormElement);
  const visibleMatchIdsByScope = new Map();

  forms.forEach((form) => {
    const matchId = String(form.dataset.matchId || "");
    const match = state.matches.find((item) => String(item.id) === matchId);
    const scopeKey = getSpecialFeatureScope(match);
    if (!scopeKey) {
      return;
    }

    if (!visibleMatchIdsByScope.has(scopeKey)) {
      visibleMatchIdsByScope.set(scopeKey, new Set());
    }

    visibleMatchIdsByScope.get(scopeKey).add(matchId);
  });

  const currentUsageByScope = new Map(
    Object.keys(SPECIAL_FEATURE_SCOPE_CONFIGS).map((scopeKey) => [
      scopeKey,
      getCurrentSpecialFeatureSelections(scopeKey)
    ])
  );
  const savedUsageByScope = new Map(
    Object.keys(SPECIAL_FEATURE_SCOPE_CONFIGS).map((scopeKey) => [
      scopeKey,
      player ? getPlayerSpecialFeatureUsage(player.id, scopeKey) : new Map()
    ])
  );

  savedUsageByScope.forEach((savedUsage, scopeKey) => {
    const currentUsage = currentUsageByScope.get(scopeKey) || new Map();
    const visibleMatchIds = visibleMatchIdsByScope.get(scopeKey) || new Set();

    savedUsage.forEach((usedMatchId, featureKey) => {
      if (!visibleMatchIds.has(usedMatchId) && !currentUsage.has(featureKey)) {
        currentUsage.set(featureKey, usedMatchId);
      }
    });

    currentUsageByScope.set(scopeKey, currentUsage);
  });

  forms.forEach((form) => {
    const matchId = String(form.dataset.matchId || "");
    const match = state.matches.find((item) => String(item.id) === matchId);
    const scopeKey = getSpecialFeatureScope(match);

    syncMatchFormState(form, {
      player,
      currentUsage: currentUsageByScope.get(scopeKey) || new Map()
    });
  });
}

function syncMatchFormState(form, sharedContext = null) {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const submitButton = form.querySelector('[data-role="match-submit"]');
  if (!(submitButton instanceof HTMLButtonElement)) {
    return;
  }

  const matchId = String(form.dataset.matchId || "");
  const match = state.matches.find((item) => String(item.id) === matchId);
  if (!match) {
    return;
  }

  const player = sharedContext?.player ?? getActivePlayer();
  const isOpen = isPredictionOpen(match.predictionDeadline);
  const initialScoreA = String(form.dataset.initialScoreA || "");
  const initialScoreB = String(form.dataset.initialScoreB || "");
  const initialPenaltyWinner = normalizeKnockoutWinnerChoice(form.dataset.initialPenaltyWinner);
  const initialSpecialFeature = normalizeSpecialFeatureForMatch(form.dataset.initialSpecialFeature, match);
  const initialSpecialFeatureTarget = normalizeSpecialFeatureTarget(form.dataset.initialSpecialFeatureTarget);
  const currentScoreA = String(form.elements.predictedScoreA?.value || "").trim();
  const currentScoreB = String(form.elements.predictedScoreB?.value || "").trim();
  const parsedCurrentScoreA = parseScoreInput(currentScoreA);
  const parsedCurrentScoreB = parseScoreInput(currentScoreB);
  const needsShootoutWinner = requiresKnockoutWinner(match, parsedCurrentScoreA, parsedCurrentScoreB);
  const shootoutPicker = form.querySelector('[data-role="shootout-picker"]');
  const shootoutWinnerSelect = form.querySelector('[data-role="shootout-winner-select"]');
  const currentPenaltyWinner = normalizeKnockoutWinnerChoice(shootoutWinnerSelect?.value);
  const specialFeatureInput = form.querySelector('input[name="specialFeature"]');
  const currentSpecialFeature = normalizeSpecialFeatureForMatch(specialFeatureInput?.value, match);
  const specialFeatureTargetPicker = form.querySelector('[data-role="special-feature-target-picker"]');
  const specialFeatureTargetSelect = form.querySelector('[data-role="special-feature-target-select"]');
  const currentSpecialFeatureTarget = normalizeSpecialFeatureTarget(specialFeatureTargetSelect?.value);
  const needsSpecialFeatureTarget = currentSpecialFeature === "cleanSheetMaster";
  const hasSavedPrediction = initialScoreA !== "" && initialScoreB !== "";
  const isDirty = hasSavedPrediction && (
    currentScoreA !== initialScoreA
    || currentScoreB !== initialScoreB
    || currentPenaltyWinner !== initialPenaltyWinner
    || currentSpecialFeature !== initialSpecialFeature
    || currentSpecialFeatureTarget !== initialSpecialFeatureTarget
  );

  if (shootoutPicker instanceof HTMLElement) {
    shootoutPicker.classList.toggle("hidden", !needsShootoutWinner);
    shootoutPicker.classList.toggle("is-required", needsShootoutWinner && !currentPenaltyWinner);
  }

  if (shootoutWinnerSelect instanceof HTMLSelectElement) {
    shootoutWinnerSelect.disabled = !isOpen || !needsShootoutWinner;
  }

  if (specialFeatureTargetPicker instanceof HTMLElement) {
    specialFeatureTargetPicker.classList.toggle("hidden", !needsSpecialFeatureTarget);
    specialFeatureTargetPicker.classList.toggle("is-required", needsSpecialFeatureTarget && !currentSpecialFeatureTarget);
  }

  if (specialFeatureTargetSelect instanceof HTMLSelectElement) {
    specialFeatureTargetSelect.disabled = !isOpen || !needsSpecialFeatureTarget;
  }

  submitButton.disabled = !isOpen
    || (needsShootoutWinner && !currentPenaltyWinner)
    || (needsSpecialFeatureTarget && !currentSpecialFeatureTarget);
  if (!isOpen) {
    submitButton.textContent = "Prediction Closed";
  } else if (needsShootoutWinner && !currentPenaltyWinner) {
    submitButton.textContent = "Choose Shootout Winner";
  } else if (needsSpecialFeatureTarget && !currentSpecialFeatureTarget) {
    submitButton.textContent = "Choose Clean Sheet Team";
  } else {
    submitButton.textContent = hasSavedPrediction && !isDirty
      ? "Update Prediction"
      : "Submit Prediction";
  }

  if (!isSpecialFeatureMatch(match)) {
    return;
  }

  const currentUsage = sharedContext?.currentUsage ?? getCurrentSpecialFeatureSelections(getSpecialFeatureScope(match));

  const featureButtons = Array.from(form.querySelectorAll('[data-role="special-feature-button"]'));
  featureButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    const featureKey = normalizeSpecialFeatureForMatch(button.dataset.feature, match);
    const isActive = featureKey === currentSpecialFeature;
    const usedMatchId = currentUsage.get(featureKey);
    const featureUsedElsewhere = Boolean(usedMatchId && usedMatchId !== matchId);
    const shouldDisable = !player || !isOpen || featureUsedElsewhere;

    button.disabled = shouldDisable;
    button.classList.toggle("is-active", isActive);
    button.classList.toggle("is-disabled", shouldDisable && !isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const summary = form.querySelector('[data-role="special-feature-summary"]');
  if (summary) {
    summary.textContent = getSpecialFeatureSummaryText(
      match,
      currentSpecialFeature,
      currentSpecialFeatureTarget,
      currentUsage,
      matchId,
      isOpen,
      Boolean(player)
    );
  }
}

function syncAdminMatchFormStates() {
  document.querySelectorAll(".admin-match-form").forEach((form) => {
    syncAdminMatchFormState(form);
  });
}

function syncAdminPlayerPredictionFormStates() {
  document.querySelectorAll(".admin-player-prediction-form").forEach((form) => {
    loadAdminPlayerPredictionIntoForm(form);
  });
}

function syncAdminMatchFormState(form) {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const matchId = String(form.dataset.matchId || "");
  const match = state.matches.find((item) => String(item.id) === matchId);
  if (!match || !isKnockoutMatch(match)) {
    return;
  }

  const scoreA = parseScoreInput(form.elements.actualScoreA?.value);
  const scoreB = parseScoreInput(form.elements.actualScoreB?.value);
  const needsShootoutWinner = requiresKnockoutWinner(match, scoreA, scoreB);
  const shootoutPicker = form.querySelector('[data-role="admin-shootout-picker"]');
  const shootoutWinnerSelect = form.querySelector('[data-role="admin-shootout-winner-select"]');

  if (shootoutPicker instanceof HTMLElement) {
    shootoutPicker.classList.toggle("hidden", !needsShootoutWinner);
    shootoutPicker.classList.toggle("is-required", needsShootoutWinner && !normalizeKnockoutWinnerChoice(shootoutWinnerSelect?.value));
  }

  if (shootoutWinnerSelect instanceof HTMLSelectElement) {
    shootoutWinnerSelect.disabled = !needsShootoutWinner;
  }
}

function syncAdminPlayerPredictionFormState(form) {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const matchId = String(form.dataset.matchId || "");
  const match = state.matches.find((item) => String(item.id) === matchId);
  if (!match) {
    return;
  }

  const playerId = String(form.elements.playerId?.value || "");
  const prediction = playerId ? getMatchPrediction(playerId, matchId) : null;
  const predictedScoreA = parseScoreInput(form.elements.predictedScoreA?.value);
  const predictedScoreB = parseScoreInput(form.elements.predictedScoreB?.value);
  const needsShootoutWinner = requiresKnockoutWinner(match, predictedScoreA, predictedScoreB);
  const shootoutPicker = form.querySelector('[data-role="admin-player-shootout-picker"]');
  const shootoutWinnerSelect = form.querySelector('[data-role="admin-player-shootout-winner-select"]');
  const currentSpecialFeature = normalizeSpecialFeatureForMatch(form.elements.specialFeature?.value, match);
  const needsSpecialFeatureTarget = currentSpecialFeature === "cleanSheetMaster";
  const targetPicker = form.querySelector('[data-role="admin-player-feature-target-picker"]');
  const targetSelect = form.querySelector('[data-role="admin-player-feature-target-select"]');
  const preserveCheckbox = form.querySelector('input[name="preserveSubmittedAt"]');
  const submittedAtInput = form.querySelector('input[name="submittedAt"]');
  const submitButton = form.querySelector('[data-role="admin-player-prediction-submit"]');
  const meta = form.querySelector('[data-role="admin-player-prediction-meta"]');
  const keepExistingTime = Boolean(preserveCheckbox?.checked && prediction);
  const currentPenaltyWinner = normalizeKnockoutWinnerChoice(shootoutWinnerSelect?.value);
  const currentSpecialFeatureTarget = normalizeSpecialFeatureTarget(targetSelect?.value);

  if (shootoutPicker instanceof HTMLElement) {
    shootoutPicker.classList.toggle("hidden", !needsShootoutWinner);
    shootoutPicker.classList.toggle("is-required", needsShootoutWinner && !currentPenaltyWinner);
  }

  if (shootoutWinnerSelect instanceof HTMLSelectElement) {
    shootoutWinnerSelect.disabled = !needsShootoutWinner;
  }

  if (targetPicker instanceof HTMLElement) {
    targetPicker.classList.toggle("hidden", !needsSpecialFeatureTarget);
    targetPicker.classList.toggle("is-required", needsSpecialFeatureTarget && !currentSpecialFeatureTarget);
  }

  if (targetSelect instanceof HTMLSelectElement) {
    targetSelect.disabled = !needsSpecialFeatureTarget;
  }

  if (preserveCheckbox instanceof HTMLInputElement) {
    preserveCheckbox.disabled = !prediction;
    if (!prediction) {
      preserveCheckbox.checked = false;
    }
  }

  if (submittedAtInput instanceof HTMLInputElement) {
    submittedAtInput.disabled = keepExistingTime;
  }

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = !playerId
      || predictedScoreA === null
      || predictedScoreB === null
      || (needsShootoutWinner && !currentPenaltyWinner)
      || (needsSpecialFeatureTarget && !currentSpecialFeatureTarget)
      || (!keepExistingTime && !(submittedAtInput instanceof HTMLInputElement && submittedAtInput.value));
  }

  if (meta instanceof HTMLElement) {
    meta.innerHTML = renderAdminPlayerPredictionMeta(match, prediction);
  }
}

function loadAdminPlayerPredictionIntoForm(form) {
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const matchId = String(form.dataset.matchId || "");
  const match = state.matches.find((item) => String(item.id) === matchId);
  if (!match) {
    return;
  }

  const playerId = String(form.elements.playerId?.value || "");
  const prediction = playerId ? getMatchPrediction(playerId, matchId) : null;
  const scoreAInput = form.querySelector('input[name="predictedScoreA"]');
  const scoreBInput = form.querySelector('input[name="predictedScoreB"]');
  const shootoutWinnerSelect = form.querySelector('select[name="predictedPenaltyWinner"]');
  const specialFeatureSelect = form.querySelector('select[name="specialFeature"]');
  const specialFeatureTargetSelect = form.querySelector('select[name="specialFeatureTarget"]');
  const submittedAtInput = form.querySelector('input[name="submittedAt"]');
  const preserveCheckbox = form.querySelector('input[name="preserveSubmittedAt"]');
  const submitButton = form.querySelector('[data-role="admin-player-prediction-submit"]');
  const defaultTimestamp = prediction?.submittedAt || match.predictionDeadline || match.matchDate || new Date().toISOString();

  if (scoreAInput instanceof HTMLInputElement) {
    scoreAInput.value = prediction?.predictedScoreA ?? "";
  }

  if (scoreBInput instanceof HTMLInputElement) {
    scoreBInput.value = prediction?.predictedScoreB ?? "";
  }

  if (shootoutWinnerSelect instanceof HTMLSelectElement) {
    shootoutWinnerSelect.value = normalizeKnockoutWinnerChoice(prediction?.predictedPenaltyWinner);
  }

  if (specialFeatureSelect instanceof HTMLSelectElement) {
    specialFeatureSelect.value = normalizeSpecialFeatureForMatch(prediction?.specialFeature, match);
  }

  if (specialFeatureTargetSelect instanceof HTMLSelectElement) {
    specialFeatureTargetSelect.value = normalizeSpecialFeatureTarget(prediction?.specialFeatureTarget);
  }

  if (submittedAtInput instanceof HTMLInputElement) {
    submittedAtInput.value = formatDateTimeLocal(defaultTimestamp);
    submittedAtInput.disabled = Boolean(prediction);
  }

  if (preserveCheckbox instanceof HTMLInputElement) {
    preserveCheckbox.checked = Boolean(prediction);
    preserveCheckbox.disabled = !prediction;
  }

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.textContent = prediction ? "Update Player Prediction" : "Add Player Prediction";
  }

  syncAdminPlayerPredictionFormState(form);
}

function getAdminPredictionPlayers(sourceState = state) {
  return sourceState.players
    .slice()
    .sort((firstPlayer, secondPlayer) => normalizeName(firstPlayer.name).localeCompare(normalizeName(secondPlayer.name)));
}

function getAdminSelectedPlayerId(matchId, players = getAdminPredictionPlayers()) {
  const normalizedMatchId = String(matchId || "");
  const availableIds = new Set(players.map((player) => String(player.id)));
  const rememberedPlayerId = String(uiState.adminPredictionPlayerByMatch?.[normalizedMatchId] || "");
  if (availableIds.has(rememberedPlayerId)) {
    return rememberedPlayerId;
  }

  const activePlayerId = String(sessionState.activePlayerId || "");
  if (availableIds.has(activePlayerId)) {
    uiState.adminPredictionPlayerByMatch[normalizedMatchId] = activePlayerId;
    return activePlayerId;
  }

  const predictionForMatch = state.matchPredictions.find((prediction) => (
    String(prediction.matchId) === normalizedMatchId && availableIds.has(String(prediction.playerId))
  ));
  if (predictionForMatch) {
    const predictedPlayerId = String(predictionForMatch.playerId);
    uiState.adminPredictionPlayerByMatch[normalizedMatchId] = predictedPlayerId;
    return predictedPlayerId;
  }

  const fallbackPlayerId = String(players[0]?.id || "");
  if (fallbackPlayerId) {
    uiState.adminPredictionPlayerByMatch[normalizedMatchId] = fallbackPlayerId;
  }
  return fallbackPlayerId;
}

function renderAdminPlayerPredictionEditor(match) {
  const players = getAdminPredictionPlayers();
  if (!players.length) {
    return `
      <section class="admin-player-prediction panel">
        <div class="admin-player-prediction-header">
          <div>
            <span class="card-kicker">Manage Player Prediction</span>
            <h4>Player prediction editor</h4>
          </div>
        </div>
        <div class="empty-state">Add players first, then the admin can create or adjust their match predictions here.</div>
      </section>
    `;
  }

  const selectedPlayerId = getAdminSelectedPlayerId(match.id, players);
  const prediction = selectedPlayerId ? getMatchPrediction(selectedPlayerId, match.id) : null;
  const predictionTimestamp = prediction?.submittedAt || match.predictionDeadline || match.matchDate || new Date().toISOString();
  const selectedFeature = normalizeSpecialFeatureForMatch(prediction?.specialFeature, match);
  const selectedFeatureTarget = normalizeSpecialFeatureTarget(prediction?.specialFeatureTarget);

  return `
    <section class="admin-player-prediction panel">
      <div class="admin-player-prediction-header">
        <div>
          <span class="card-kicker">Manage Player Prediction</span>
          <h4>Player prediction editor</h4>
        </div>
        <div class="chip-row" data-role="admin-player-prediction-meta">
          ${renderAdminPlayerPredictionMeta(match, prediction)}
        </div>
      </div>
      <form class="admin-player-prediction-form" data-match-id="${escapeHtml(match.id)}">
        <label class="field-group">
          <span>Player</span>
          <select name="playerId">
            ${players.map((player) => `
              <option value="${escapeHtml(player.id)}" ${selectedPlayerId === String(player.id) ? "selected" : ""}>${escapeHtml(player.name)}</option>
            `).join("")}
          </select>
        </label>
        <div class="score-inputs">
          <label class="score-box">
            <span>${escapeHtml(match.teamA)} predicted</span>
            <input type="number" min="0" step="1" name="predictedScoreA" value="${prediction?.predictedScoreA ?? ""}">
          </label>
          <label class="score-box">
            <span>${escapeHtml(match.teamB)} predicted</span>
            <input type="number" min="0" step="1" name="predictedScoreB" value="${prediction?.predictedScoreB ?? ""}">
          </label>
        </div>
        ${isKnockoutMatch(match) ? `
          <div class="shootout-picker admin-shootout-picker ${requiresKnockoutWinner(match, prediction?.predictedScoreA ?? null, prediction?.predictedScoreB ?? null) ? "" : "hidden"}" data-role="admin-player-shootout-picker">
            <label class="select-box">
              <span>Predicted penalty winner</span>
              <select name="predictedPenaltyWinner" data-role="admin-player-shootout-winner-select" ${requiresKnockoutWinner(match, prediction?.predictedScoreA ?? null, prediction?.predictedScoreB ?? null) ? "" : "disabled"}>
                <option value="">Select winner</option>
                <option value="teamA" ${normalizeKnockoutWinnerChoice(prediction?.predictedPenaltyWinner) === "teamA" ? "selected" : ""}>${escapeHtml(match.teamA)}</option>
                <option value="teamB" ${normalizeKnockoutWinnerChoice(prediction?.predictedPenaltyWinner) === "teamB" ? "selected" : ""}>${escapeHtml(match.teamB)}</option>
              </select>
            </label>
            <p class="deadline-note">Needed only when the predicted knockout score ends level.</p>
          </div>
        ` : ""}
        ${isSpecialFeatureMatch(match) ? `
          <div class="admin-form-grid">
            <label class="field-group">
              <span>Special feature</span>
              <select name="specialFeature">
                <option value="">No special feature</option>
                ${getMatchSpecialFeatureKeys(match).map((featureKey) => `
                  <option value="${escapeHtml(featureKey)}" ${selectedFeature === featureKey ? "selected" : ""}>${escapeHtml(getSpecialFeature(featureKey)?.label || featureKey)}</option>
                `).join("")}
              </select>
            </label>
            <label class="field-group ${selectedFeature === "cleanSheetMaster" ? "" : "hidden"}" data-role="admin-player-feature-target-picker">
              <span>Clean sheet team</span>
              <select name="specialFeatureTarget" data-role="admin-player-feature-target-select" ${selectedFeature === "cleanSheetMaster" ? "" : "disabled"}>
                <option value="">Select team</option>
                <option value="teamA" ${selectedFeatureTarget === "teamA" ? "selected" : ""}>${escapeHtml(match.teamA)}</option>
                <option value="teamB" ${selectedFeatureTarget === "teamB" ? "selected" : ""}>${escapeHtml(match.teamB)}</option>
              </select>
            </label>
          </div>
        ` : `
          <p class="deadline-note">No special features are available for this match.</p>
        `}
        <div class="admin-form-grid">
          <label class="field-group">
            <span>Submitted at</span>
            <input type="datetime-local" name="submittedAt" value="${escapeHtml(formatDateTimeLocal(predictionTimestamp))}" ${prediction ? "disabled" : ""}>
          </label>
          <label class="chip admin-toggle-chip">
            <input type="checkbox" name="preserveSubmittedAt" ${prediction ? "checked" : "disabled"}>
            Keep original submit time
          </label>
        </div>
        <div class="admin-form-footer">
          <p class="deadline-note">Use this to add a missing prediction, restore a lost special feature, or edit a player's pick without changing its original time.</p>
          <button class="primary-button" type="submit" data-role="admin-player-prediction-submit">${prediction ? "Update Player Prediction" : "Add Player Prediction"}</button>
        </div>
      </form>
    </section>
  `;
}

function renderAdminPlayerPredictionMeta(match, prediction) {
  if (!prediction) {
    return `<span class="chip">No saved prediction</span>`;
  }

  const savedAtLabel = prediction.submittedAt
    ? formatDateTime(prediction.submittedAt)
    : "Unknown time";

  const chips = [
    `<span class="chip">Saved: ${escapeHtml(savedAtLabel)}</span>`,
    `<span class="chip">Pick: ${escapeHtml(formatPredictionScoreline(prediction, match))}</span>`
  ];

  const featureText = getPredictionFeatureDisplayText(prediction, match);
  if (featureText) {
    chips.push(`<span class="chip">Feature: ${escapeHtml(featureText)}</span>`);
  }

  if (match.isFinished) {
    chips.push(`<span class="chip">${escapeHtml(getMatchPointsBreakdownText(prediction, match))}</span>`);
  }

  return chips.join("");
}

function getSpecialFeatureSummaryText(match, currentSpecialFeature, currentSpecialFeatureTarget, usageMap, matchId, isOpen, hasPlayer) {
  const scopeConfig = getSpecialFeatureScopeConfig(match);
  if (!scopeConfig) {
    return "";
  }

  if (!hasPlayer) {
    return scopeConfig.loginSummary;
  }

  if (!isOpen) {
    return currentSpecialFeature
      ? `${getPredictionFeatureDisplayText({
        specialFeature: currentSpecialFeature,
        specialFeatureTarget: currentSpecialFeatureTarget
      }, match)} is locked for this match.`
      : scopeConfig.lockedEmptySummary;
  }

  if (currentSpecialFeature) {
    if (currentSpecialFeature === "cleanSheetMaster" && !currentSpecialFeatureTarget) {
      return "Choose which team will keep the clean sheet.";
    }

    return `${getPredictionFeatureDisplayText({
      specialFeature: currentSpecialFeature,
      specialFeatureTarget: currentSpecialFeatureTarget
    }, match)} is active for this match.`;
  }

  const usedFeatures = scopeConfig.featureKeys
    .filter((featureKey) => {
      const usedMatchId = usageMap.get(featureKey);
      return Boolean(usedMatchId && usedMatchId !== matchId);
    })
    .map((featureKey) => getPredictionFeatureLabel(featureKey));

  if (usedFeatures.length) {
    return `${usedFeatures.join(", ")} ${scopeConfig.usedSummarySuffix}`;
  }

  return scopeConfig.emptySummary;
}

function renderLockIcon() {
  return `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M7.5 10.25V8.5a4.5 4.5 0 1 1 9 0v1.75h.5A1.75 1.75 0 0 1 18.75 12v7A1.75 1.75 0 0 1 17 20.75H7A1.75 1.75 0 0 1 5.25 19v-7A1.75 1.75 0 0 1 7 10.25h.5Zm1.5 0h6V8.5a3 3 0 1 0-6 0v1.75Z" fill="currentColor"/>
    </svg>
  `;
}

function getMatchPointsBreakdownText(prediction, match = null) {
  const basePoints = Number(prediction.basePoints || 0);
  const specialBonusPoints = Number(prediction.specialBonusPoints || 0);
  const feature = getSpecialFeature(prediction.specialFeature);

  if (!feature) {
    return `Base ${basePoints}`;
  }

  const featureLabel = match ? (getPredictionFeatureDisplayText(prediction, match) || feature.label) : feature.label;
  return `Base ${basePoints} + ${featureLabel} ${specialBonusPoints}`;
}

function renderLeaderboard() {
  const searchTerm = normalizeName(dom.playerSearchInput.value);
  const leaderboard = getLeaderboard().filter((player, index) => {
    if (!searchTerm) {
      return true;
    }

    const searchableText = [
      index + 1,
      player.name,
      player.totalPoints,
      player.matchPoints,
      player.specialPoints,
      player.groupPoints,
      player.exactScores,
      player.lastPredictionTime ? formatDateTime(player.lastPredictionTime) : "No predictions yet"
    ].join(" ");

    return normalizeName(searchableText).includes(searchTerm);
  });

  if (Date.now() < uiState.leaderboardFlashUntil) {
    dom.leaderboardPanel.classList.add("flash");
  } else {
    dom.leaderboardPanel.classList.remove("flash");
  }

  if (!leaderboard.length) {
    dom.leaderboardBody.innerHTML = `
      <tr>
        <td colspan="8"><div class="empty-state">No players match the search yet.</div></td>
      </tr>
    `;
    return;
  }

  dom.leaderboardBody.innerHTML = leaderboard.map((player, index) => `
    <tr>
      <td><span class="rank-badge ${getRankBadgeClass(index + 1)}">${index + 1}</span></td>
      <td class="table-player">${escapeHtml(player.name)}</td>
      <td>${player.totalPoints}</td>
      <td>${player.matchPoints}</td>
      <td>${player.specialPoints}</td>
      <td>${player.groupPoints}</td>
      <td>${player.exactScores}</td>
      <td>${escapeHtml(player.lastPredictionTime ? formatDateTime(player.lastPredictionTime) : "No predictions yet")}</td>
    </tr>
  `).join("");
}

function getRankBadgeClass(rank) {
  if (rank === 1) {
    return "rank-badge-gold";
  }
  if (rank === 2) {
    return "rank-badge-silver";
  }
  if (rank === 3) {
    return "rank-badge-bronze";
  }
  return "";
}

function renderHistory() {
  const activePlayer = getActivePlayer();
  const derived = getDerivedState();
  const selectedPlayerId = dom.historyPlayerFilter.value;
  const isFilteredByPlayer = selectedPlayerId !== "all";

  const matchEntries = state.matchPredictions.map((prediction) => {
    const match = derived.matchById.get(String(prediction.matchId)) || null;
    if (!match) {
      return null;
    }

    return {
      playerId: prediction.playerId,
      playerName: prediction.playerName,
      submittedAt: prediction.submittedAt,
      title: `${prediction.playerName} • ${match.teamA} vs ${match.teamB}`,
      predictionText: formatPredictionScoreline(prediction, match),
      featureText: isSpecialFeatureMatch(match)
        ? (
          getPredictionFeatureDisplayText(prediction, match)
            ? `Feature: ${getPredictionFeatureDisplayText(prediction, match)}`
            : "Feature: None"
        )
        : "",
      actualText: formatMatchScoreline(match),
      points: prediction.points || 0,
      pointsDetail: match.isFinished ? getMatchPointsBreakdownText(prediction, match) : "",
      isPublic: Boolean(match.isFinished && match.actualScoreA !== null && match.actualScoreB !== null),
      status: getMatchHistoryStatus(prediction, match)
    };
  });

  const groupEntries = state.groupPredictions.map((prediction) => {
    const group = derived.groupById.get(String(prediction.groupId)) || null;
    if (!group) {
      return null;
    }

    return {
      playerId: prediction.playerId,
      playerName: prediction.playerName,
      submittedAt: prediction.submittedAt,
      title: `${prediction.playerName} • ${group.name}`,
      predictionText: `${prediction.predictedFirst} / ${prediction.predictedSecond} / ${prediction.predictedThird || "-"} • Best third: ${prediction.predictedThirdQualifies ? "Yes" : "No"}`,
      featureText: "",
      actualText: isGroupResultReady(group)
        ? `${group.actualFirst} / ${group.actualSecond} / ${group.actualThird} • Best third: ${group.actualThirdQualifies ? "Yes" : "No"}`
        : "Pending",
      points: prediction.points || 0,
      pointsDetail: "",
      isPublic: isGroupResultReady(group),
      status: getGroupHistoryStatus(prediction, group)
    };
  });

  const entries = [...matchEntries, ...groupEntries]
    .filter(Boolean)
    .filter((entry) => entry.isPublic || entry.playerId === activePlayer?.id)
    .filter((entry) => !isFilteredByPlayer || entry.playerId === selectedPlayerId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  if (!entries.length) {
    dom.historyContainer.innerHTML = `<div class="empty-state">${isFilteredByPlayer ? "No visible prediction history for this player yet." : "No visible prediction history to show yet."}</div>`;
    return;
  }

  dom.historyContainer.innerHTML = entries.map((entry) => `
    <article class="history-item">
      <div>
        <strong class="history-title">${escapeHtml(entry.title)}</strong>
        <p class="history-meta">
          Predicted: ${escapeHtml(entry.predictionText)}<br>
          ${entry.featureText ? `${escapeHtml(entry.featureText)}<br>` : ""}
          Actual: ${escapeHtml(entry.actualText)}<br>
          ${entry.pointsDetail ? `${escapeHtml(entry.pointsDetail)}<br>` : ""}
          Submitted at: ${escapeHtml(formatDateTime(entry.submittedAt))}
        </p>
      </div>
      <div class="history-outcome">
        <span class="status-tag ${entry.status.className}">${escapeHtml(entry.status.label)}</span>
        <div class="history-points">${entry.points} pts</div>
      </div>
    </article>
  `).join("");
}

function renderHistoryPlayerFilter() {
  const previousValue = dom.historyPlayerFilter.value || "";
  const players = state.players
    .slice()
    .sort((a, b) => normalizeName(a.name).localeCompare(normalizeName(b.name)));
  const activePlayerId = String(sessionState.activePlayerId || "");
  const isValidPreviousValue = previousValue === "all" || players.some((player) => player.id === previousValue);
  const defaultValue = activePlayerId && players.some((player) => player.id === activePlayerId)
    ? activePlayerId
    : "all";
  const playerContextChanged = uiState.historyFilterPlayerContextId !== activePlayerId;
  const shouldResetToDefault = !uiState.historyFilterManuallyChanged || playerContextChanged || !isValidPreviousValue;

  dom.historyPlayerFilter.innerHTML = [
    `<option value="all">All players</option>`,
    ...players.map((player) => `<option value="${escapeHtml(player.id)}">${escapeHtml(player.name)}</option>`)
  ].join("");

  dom.historyPlayerFilter.value = shouldResetToDefault ? defaultValue : previousValue;
  uiState.historyFilterPlayerContextId = activePlayerId;
  if (shouldResetToDefault) {
    uiState.historyFilterManuallyChanged = false;
  }
}

function renderChat() {
  if (
    !dom.chatShell
    || !dom.chatToggleButton
    || !dom.chatToggleBadge
    || !dom.chatPanel
    || !dom.chatMessages
    || !dom.chatForm
    || !dom.chatMeta
    || !dom.chatCountChip
    || !dom.chatInput
    || !dom.chatCharCount
    || !dom.chatEmojiToggle
    || !dom.chatEmojiTray
  ) {
    return;
  }

  const player = getActivePlayer();
  const messages = state.chatMessages.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const shouldAutoScroll = isScrolledNearBottom(dom.chatMessages);
  const latestMessage = messages[messages.length - 1] || null;
  const latestFromActivePlayer = Boolean(player && latestMessage?.playerId === player.id);
  const unreadCount = uiState.chatOpen
    ? 0
    : getChatUnreadCount(player?.id || "", messages);

  if (player && uiState.chatOpen) {
    markChatMessagesAsSeen(player.id, messages);
  }

  dom.chatShell.classList.toggle("is-open", uiState.chatOpen);
  dom.chatToggleButton.setAttribute("aria-expanded", String(uiState.chatOpen));
  dom.chatPanel.classList.toggle("hidden", !uiState.chatOpen);
  dom.chatToggleBadge.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
  dom.chatToggleBadge.classList.toggle("hidden", unreadCount === 0);
  dom.chatEmojiToggle.setAttribute("aria-expanded", String(uiState.chatEmojiOpen));
  dom.chatEmojiTray.classList.toggle("hidden", !uiState.chatEmojiOpen);
  dom.chatEmojiTray.innerHTML = renderChatEmojiButtons();

  dom.chatCountChip.textContent = unreadCount
    ? `${unreadCount} new`
    : `${messages.length} message${messages.length === 1 ? "" : "s"}`;
  dom.chatMeta.textContent = player
    ? messages.length
      ? `Signed in as ${player.name}. Latest message ${formatChatTime(latestMessage.createdAt)}.`
      : `Signed in as ${player.name}. Start the conversation.`
    : "Log in to send messages. Guests can still read the chat.";

  dom.chatMessages.innerHTML = messages.length
    ? messages.map((message) => renderChatMessage(message, player)).join("")
    : `
      <div class="chat-empty">
        No chat messages yet. Be the first player to start the conversation.
      </div>
    `;

  dom.chatInput.disabled = !player;
  dom.chatInput.placeholder = player
    ? "Write a message to the other players..."
    : "Log in first to unlock chat";
  if (!player) {
    dom.chatInput.value = "";
    uiState.chatEmojiOpen = false;
    dom.chatEmojiToggle.setAttribute("aria-expanded", "false");
    dom.chatEmojiTray.classList.add("hidden");
  }

  const chatSubmitButton = dom.chatForm.querySelector('button[type="submit"]');
  if (chatSubmitButton instanceof HTMLButtonElement) {
    chatSubmitButton.disabled = !player;
  }
  dom.chatEmojiToggle.disabled = !player;

  renderChatCharacterCount();

  if (shouldAutoScroll || latestFromActivePlayer) {
    window.requestAnimationFrame(() => {
      dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    });
  }
}

function renderChatMessage(message, activePlayer) {
  const isOwnMessage = Boolean(activePlayer && message.playerId === activePlayer.id);
  const reactionBarMarkup = renderChatReactionBar(message, activePlayer);

  return `
    <article class="chat-message ${isOwnMessage ? "chat-message-own" : ""}">
      <div class="chat-message-topline">
        <strong>${escapeHtml(isOwnMessage ? `${message.playerName} (You)` : message.playerName)}</strong>
        <span>${escapeHtml(formatChatTime(message.createdAt))}</span>
      </div>
      <p class="chat-message-copy">${escapeHtml(message.text)}</p>
      ${reactionBarMarkup}
    </article>
  `;
}

function renderChatCharacterCount() {
  if (!dom.chatInput || !dom.chatCharCount) {
    return;
  }

  const currentLength = String(dom.chatInput.value || "").length;
  dom.chatCharCount.textContent = `${currentLength} / ${CHAT_MAX_MESSAGE_LENGTH}`;
  dom.chatCharCount.classList.toggle("is-limit", currentLength >= CHAT_MAX_MESSAGE_LENGTH);
}

function renderChatEmojiButtons() {
  return CHAT_EMOJIS.map((emoji) => `
    <button class="chat-emoji-button" type="button" data-action="insert-chat-emoji" data-emoji="${escapeHtml(emoji)}">
      <span aria-hidden="true">${escapeHtml(emoji)}</span>
    </button>
  `).join("");
}

function toggleChatPanel() {
  uiState.chatOpen = !uiState.chatOpen;
  if (!uiState.chatOpen) {
    uiState.chatEmojiOpen = false;
  }
  renderChat();
}

function closeChatPanel() {
  if (!uiState.chatOpen) {
    return;
  }

  uiState.chatOpen = false;
  uiState.chatEmojiOpen = false;
  renderChat();
}

function toggleEmojiPicker() {
  if (!getActivePlayer()) {
    showToast("Log in first to use emojis in chat", "error");
    return;
  }

  uiState.chatEmojiOpen = !uiState.chatEmojiOpen;
  renderChat();
}

function insertChatEmoji(button) {
  if (!(button instanceof HTMLButtonElement) || !dom.chatInput || dom.chatInput.disabled) {
    return;
  }

  const emoji = String(button.dataset.emoji || "");
  if (!emoji) {
    return;
  }

  const selectionStart = dom.chatInput.selectionStart ?? dom.chatInput.value.length;
  const selectionEnd = dom.chatInput.selectionEnd ?? dom.chatInput.value.length;
  const currentValue = String(dom.chatInput.value || "");
  const nextValue = `${currentValue.slice(0, selectionStart)}${emoji}${currentValue.slice(selectionEnd)}`.slice(0, CHAT_MAX_MESSAGE_LENGTH);
  const nextCursor = Math.min(selectionStart + emoji.length, nextValue.length);

  dom.chatInput.value = nextValue;
  dom.chatInput.focus();
  dom.chatInput.setSelectionRange(nextCursor, nextCursor);
  renderChatCharacterCount();
}

function renderChatReactionBar(message, activePlayer) {
  const activePlayerId = String(activePlayer?.id || "");
  const canReact = Boolean(activePlayerId) && activePlayerId !== String(message.playerId || "");
  const items = getChatReactionItems(message, activePlayerId);
  const visibleItems = items.filter((item) => item.count > 0 || canReact);

  if (!visibleItems.length) {
    return "";
  }

  return `
    <div class="chat-reaction-bar">
      ${visibleItems.map((item) => `
        <button
          class="chat-reaction-chip ${item.isActive ? "is-active" : ""} ${item.count > 0 ? "has-count" : ""}"
          type="button"
          data-action="toggle-chat-reaction"
          data-message-id="${escapeHtml(message.id)}"
          data-emoji="${escapeHtml(item.emoji)}"
          ${canReact ? "" : "disabled"}
          aria-pressed="${item.isActive ? "true" : "false"}"
          aria-label="${escapeHtml(`React with ${item.emoji}`)}"
        >
          <span class="chat-reaction-emoji" aria-hidden="true">${escapeHtml(item.emoji)}</span>
          ${item.count > 0 ? `<span class="chat-reaction-count">${item.count}</span>` : ""}
        </button>
      `).join("")}
    </div>
  `;
}

function getChatReactionItems(message, activePlayerId = "") {
  const counts = new Map();
  const reactions = normalizeChatReactions(message?.reactions);
  const activeReaction = reactions.find((reaction) => reaction.playerId === activePlayerId)?.emoji || "";

  reactions.forEach((reaction) => {
    counts.set(reaction.emoji, Number(counts.get(reaction.emoji) || 0) + 1);
  });

  return CHAT_REACTION_EMOJIS.map((emoji) => ({
    emoji,
    count: Number(counts.get(emoji) || 0),
    isActive: activeReaction === emoji
  }));
}

function toggleNotifications() {
  uiState.notificationsOpen = !uiState.notificationsOpen;
  renderNotifications();
}

function closeNotifications() {
  if (!uiState.notificationsOpen) {
    return;
  }

  uiState.notificationsOpen = false;
  renderNotifications();
}

function getPlayerNotificationEntries(playerId, sourceState = state) {
  const reminderEntries = getTodayPredictionReminderEntries(playerId, sourceState);
  const activeFeatureEntries = getActiveSpecialFeatureNotificationEntries(playerId, sourceState);
  const rankChangeEntry = getRankChangeNotificationEntry(playerId, sourceState);
  const specialFeatureEntries = getSpecialFeatureNotificationEntries(playerId, sourceState);

  return [rankChangeEntry, ...activeFeatureEntries, ...specialFeatureEntries, ...reminderEntries]
    .filter(Boolean)
    .sort((a, b) => {
      const aPriority = Number(a.sortPriority || 0);
      const bPriority = Number(b.sortPriority || 0);
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      if (a.persistent && b.persistent) {
        return new Date(a.resolvedAt) - new Date(b.resolvedAt);
      }

      return new Date(b.resolvedAt) - new Date(a.resolvedAt);
    });
}

function getTodayPredictionReminderEntries(playerId, sourceState = state) {
  const todayKey = getMatchDayKey(new Date());

  return sourceState.matches
    .filter((match) => (
      getMatchDayKey(match.matchDate) === todayKey &&
      !match.isFinished &&
      isPredictionOpen(match.predictionDeadline) &&
      !getMatchPrediction(playerId, match.id, sourceState)
    ))
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate))
    .map((match) => ({
      id: ["reminder", "today", getMatchDayKey(match.matchDate), String(match.id)].join(":"),
      resolvedAt: match.matchDate,
      title: `Prediction missing: ${match.teamA} vs ${match.teamB}`,
      context: `${match.round} • ${getMatchGroupLabel(match)}`,
      summary: "This match is today and you have not submitted your prediction yet.",
      actual: `Deadline: ${formatDateTime(match.predictionDeadline)}`,
      status: {
        label: "Prediction needed",
        className: "status-reminder"
      },
      timeLabel: "Kickoff",
      persistent: true,
      sortPriority: 3
    }));
}

function getActiveSpecialFeatureNotificationEntries(playerId, sourceState = state) {
  const derived = getDerivedState(sourceState);
  const predictions = derived.matchPredictionsByPlayerId.get(String(playerId)) || [];

  return predictions
    .map((prediction) => {
      const match = derived.matchById.get(String(prediction.matchId)) || null;
      if (!match || !isSpecialFeatureMatch(match) || match.isFinished) {
        return null;
      }

      const featureKey = normalizeSpecialFeatureForMatch(prediction.specialFeature, match);
      if (!featureKey) {
        return null;
      }

      return buildActiveSpecialFeatureNotificationEntry(prediction, match, featureKey);
    })
    .filter(Boolean);
}

function buildActiveSpecialFeatureNotificationEntry(prediction, match, featureKey) {
  const feature = getSpecialFeature(featureKey);
  if (!feature) {
    return null;
  }

  return {
    id: [
      "special-feature-active",
      String(prediction.playerId),
      String(match.id),
      featureKey,
      normalizeSpecialFeatureTarget(prediction.specialFeatureTarget)
    ].join(":"),
    resolvedAt: prediction.submittedAt || match.predictionDeadline || match.matchDate || new Date().toISOString(),
    title: `${feature.label} activated`,
    context: `${match.teamA} vs ${match.teamB}`,
    summary: `Your ${getPredictionFeatureDisplayText(prediction, match) || feature.label} is active for this match.`,
    actual: `Round: ${match.round} • Deadline: ${formatDateTime(match.predictionDeadline)}`,
    status: {
      label: "Feature Active",
      className: "status-feature"
    },
    timeLabel: "Activated",
    sortPriority: 5
  };
}

function getSpecialFeatureNotificationEntries(playerId, sourceState = state) {
  const derived = getDerivedState(sourceState);
  const predictions = derived.matchPredictionsByPlayerId.get(String(playerId)) || [];

  return predictions
    .map((prediction) => {
      const match = derived.matchById.get(String(prediction.matchId)) || null;
      if (!match || !isSpecialFeatureMatch(match)) {
        return null;
      }

      const featureKey = normalizeSpecialFeatureForMatch(prediction.specialFeature, match);
      if (!featureKey || !match.isFinished || match.actualScoreA === null || match.actualScoreB === null) {
        return null;
      }

      return buildSpecialFeatureNotificationEntry(prediction, match, featureKey);
    })
    .filter(Boolean);
}

function buildSpecialFeatureNotificationEntry(prediction, match, featureKey) {
  const feature = getSpecialFeature(featureKey);
  if (!feature) {
    return null;
  }

  const resolvedAt = getMatchResultResolvedAt(match);
  const resultText = formatMatchScoreline(match);

  return {
    id: [
      "special-feature",
      String(prediction.playerId),
      String(match.id),
      featureKey,
      normalizeSpecialFeatureTarget(prediction.specialFeatureTarget),
      String(match.actualScoreA),
      String(match.actualScoreB),
      String(resolvedAt)
    ].join(":"),
    resolvedAt,
    title: `${feature.label}: ${match.teamA} vs ${match.teamB}`,
    context: `${match.round} • ${getMatchGroupLabel(match)}`,
    summary: getSpecialFeatureNotificationSummary(featureKey, prediction, match),
    actual: `Actual: ${resultText} • ${getMatchPointsBreakdownText(prediction, match)} • Total ${prediction.points || 0} pts`,
    status: getSpecialFeatureNotificationStatus(featureKey, prediction),
    timeLabel: "Result",
    sortPriority: 4
  };
}

function getSpecialFeatureNotificationSummary(featureKey, prediction, match) {
  const basePoints = Number(prediction.basePoints || 0);
  const totalGoals = Number(match.actualScoreA) + Number(match.actualScoreB);

  if (featureKey === "doublePick") {
    return basePoints > 0
      ? "Double Pick activated! Your match points were doubled."
      : "Double Pick was active, but your prediction earned 0 points, so no bonus was added.";
  }

  if (featureKey === "goalRush") {
    return basePoints > 0
      ? `Goal Rush activated! You earned +${totalGoals} bonus points from ${totalGoals} total goals.`
      : `Goal Rush activated! You earned +${totalGoals} bonus points from match goals.`;
  }

  if (featureKey === "perfectBoost") {
    return isExactScore(prediction, match)
      ? "Perfect Boost activated! Exact score achieved, you earned 8 points instead of 6."
      : "Perfect Boost was active, but the exact score was not correct, so normal scoring was applied.";
  }

  if (featureKey === "riskMode") {
    return basePoints > 0
      ? "🎰 All In successful! You earned +15 points."
      : "🎰 All In failed! 15 points have been deducted.";
  }

  if (featureKey === "extraTimeHunter") {
    return didMatchGoToExtraTime(match)
      ? "⏱️ Extra Time Hunter successful! +3 bonus points."
      : "⏱️ The match finished in regular time. No bonus awarded.";
  }

  if (featureKey === "cleanSheetMaster") {
    return didTeamKeepCleanSheet(match, prediction.specialFeatureTarget)
      ? "🧤 Clean Sheet Master successful! +5 bonus points."
      : "🧤 The selected team did not keep a clean sheet. No bonus awarded.";
  }

  return "Your special feature was applied to this match result.";
}

function getSpecialFeatureNotificationStatus(featureKey, prediction) {
  const earnedBonus = Number(prediction.specialBonusPoints || 0) > 0;

  if (featureKey === "goalRush") {
    return {
      label: "Goal Rush",
      className: "status-feature"
    };
  }

  return {
    label: getPredictionFeatureLabel(featureKey),
    className: earnedBonus ? "status-feature" : "status-wrong"
  };
}

function getMatchResultResolvedAt(match) {
  return match.resultUpdatedAt || match.matchDate || new Date().toISOString();
}

function getRankChangeNotificationEntry(playerId, sourceState = state) {
  const tracker = syncPlayerRankTracking(playerId, sourceState);
  const change = tracker?.latestChange;
  if (!change || change.fromRank === change.toRank) {
    return null;
  }

  const movedUp = change.fromRank !== null && change.toRank !== null && change.toRank < change.fromRank;
  const directionLabel = movedUp ? "Rank improved" : "Rank dropped";
  const movementCount = change.fromRank !== null && change.toRank !== null
    ? Math.abs(change.fromRank - change.toRank)
    : 0;

  return {
    id: change.id,
    resolvedAt: change.detectedAt,
    title: movedUp
      ? `You moved up to #${change.toRank}`
      : `You dropped to #${change.toRank}`,
    context: "Leaderboard",
    summary: movedUp
      ? `You climbed ${movementCount} place${movementCount === 1 ? "" : "s"} from #${change.fromRank} to #${change.toRank}.`
      : `You fell ${movementCount} place${movementCount === 1 ? "" : "s"} from #${change.fromRank} to #${change.toRank}.`,
    actual: `Current rank: #${change.toRank}`,
    status: {
      label: directionLabel,
      className: movedUp ? "status-rank-up" : "status-rank-down"
    },
    timeLabel: "Detected",
    sortPriority: 2
  };
}

function syncPlayerRankTracking(playerId, sourceState = state) {
  if (!playerId) {
    return null;
  }

  if (!sessionState.rankTrackingByPlayer || typeof sessionState.rankTrackingByPlayer !== "object") {
    sessionState.rankTrackingByPlayer = {};
  }

  const currentRank = getPlayerRank(playerId, sourceState);
  const existingTracker = sessionState.rankTrackingByPlayer[playerId] || {
    lastKnownRank: null,
    latestChange: null
  };

  let shouldSave = false;
  const nextTracker = {
    lastKnownRank: normalizeRankNumber(existingTracker.lastKnownRank),
    latestChange: normalizeRankChangeEntry(existingTracker.latestChange)
  };

  if (nextTracker.lastKnownRank === null && currentRank !== null) {
    nextTracker.lastKnownRank = currentRank;
    shouldSave = true;
  } else if (currentRank !== null && nextTracker.lastKnownRank !== currentRank) {
    nextTracker.latestChange = {
      id: [
        "rank",
        String(playerId),
        String(nextTracker.lastKnownRank || "unranked"),
        String(currentRank),
        String(Date.now())
      ].join(":"),
      fromRank: nextTracker.lastKnownRank,
      toRank: currentRank,
      detectedAt: new Date().toISOString()
    };
    nextTracker.lastKnownRank = currentRank;
    shouldSave = true;
  }

  if (shouldSave) {
    sessionState.rankTrackingByPlayer[playerId] = nextTracker;
    saveSessionState();
  }

  return sessionState.rankTrackingByPlayer[playerId] || nextTracker;
}

function getUnreadNotificationIds(playerId, entries) {
  const readIds = new Set(sessionState.notificationReadByPlayer?.[playerId] || []);
  return new Set(
    entries
      .filter((entry) => entry.persistent || !readIds.has(entry.id))
      .map((entry) => entry.id)
  );
}

function markPlayerNotificationsAsRead(playerId, entryIds) {
  if (!playerId) {
    return;
  }

  const nextIds = [...new Set(entryIds.map((entryId) => String(entryId || "")).filter(Boolean))];
  const currentIds = Array.isArray(sessionState.notificationReadByPlayer?.[playerId])
    ? sessionState.notificationReadByPlayer[playerId]
    : [];

  if (currentIds.length === nextIds.length && currentIds.every((entryId, index) => entryId === nextIds[index])) {
    return;
  }

  sessionState.notificationReadByPlayer[playerId] = nextIds;
  saveSessionState();
}

function getChatUnreadCount(playerId, messages = state.chatMessages) {
  if (!playerId) {
    return messages.length;
  }

  const lastSeenAt = sessionState.chatLastSeenByPlayer?.[playerId] || null;
  if (!lastSeenAt) {
    return messages.filter((message) => message.playerId !== playerId).length;
  }

  const lastSeenTime = new Date(lastSeenAt).getTime();
  return messages.filter((message) => (
    message.playerId !== playerId
    && new Date(message.createdAt).getTime() > lastSeenTime
  )).length;
}

function markChatMessagesAsSeen(playerId, messages = state.chatMessages) {
  if (!playerId || !messages.length) {
    return;
  }

  const latestMessageAt = messages[messages.length - 1]?.createdAt || null;
  if (!latestMessageAt || sessionState.chatLastSeenByPlayer?.[playerId] === latestMessageAt) {
    return;
  }

  sessionState.chatLastSeenByPlayer[playerId] = latestMessageAt;
  saveSessionState();
}

function getGroupResultTimestamp(group, sourceState = state) {
  const latestGroupMatch = sourceState.matches
    .filter((match) => String(match.group) === String(group.id) && isGroupStageRound(match.round))
    .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate))[0];

  return latestGroupMatch?.matchDate || group.predictionDeadline || new Date().toISOString();
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

  const availableAdminRounds = ROUND_FILTER_OPTIONS
    .filter((option) => option.value !== "all")
    .filter((option) => state.matches.some((match) => match.round === option.value));
  const selectedAdminRound = getAdminRoundFilterValue(availableAdminRounds);
  const filteredMatches = state.matches
    .filter((match) => selectedAdminRound === "all" || match.round === selectedAdminRound)
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));
  const filteredOpenMatches = filteredMatches.filter((match) => isPredictionOpen(match.predictionDeadline)).length;
  const filteredFinishedMatches = filteredMatches.filter((match) => match.isFinished).length;
  const shouldShowGroupsSection = selectedAdminRound === "all" || isGroupStageRound(selectedAdminRound);

  dom.adminGate.innerHTML = `
    <div class="admin-controls">
      <div class="admin-toolbar panel">
        <div>
          <span class="card-kicker">Admin Dashboard</span>
          <h3>Manage fixtures, deadlines, and results</h3>
          <p class="admin-help">Use the round filter to focus on one stage at a time, then save updates match by match.</p>
        </div>
        <div class="admin-toolbar-actions">
          <button class="primary-button" type="button" data-action="calculate-points">Calculate Points</button>
          <button class="secondary-button" type="button" data-action="export-leaderboard">Export Leaderboard JSON</button>
          <button class="ghost-button" type="button" data-action="lock-admin">Lock Admin</button>
          <button class="ghost-button" type="button" data-action="reset-data">Reset All Data</button>
        </div>
      </div>
      <div class="admin-utility-grid">
        <div class="admin-actions panel">
          <label class="field-group admin-filter-field" for="adminRoundFilter">
            <span>Round focus</span>
            <select id="adminRoundFilter">
              <option value="all">All rounds</option>
              ${availableAdminRounds.map((option) => `
                <option value="${escapeHtml(option.value)}" ${selectedAdminRound === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>
              `).join("")}
            </select>
          </label>
          <div class="admin-actions admin-actions-inline">
            <label class="field-group" for="adminPlayerDelete">
              <span>Delete player</span>
              <select id="adminPlayerDelete">
                <option value="">Select player</option>
                ${state.players
                  .slice()
                  .sort((a, b) => normalizeName(a.name).localeCompare(normalizeName(b.name)))
                  .map((player) => `<option value="${escapeHtml(player.id)}">${escapeHtml(player.name)}</option>`)
                  .join("")}
              </select>
            </label>
            <button class="ghost-button" type="button" data-action="delete-player">Delete Player</button>
          </div>
        </div>
        <div class="admin-actions panel">
          <div class="admin-summary-grid">
            <article class="admin-summary-card">
              <span class="card-kicker">Visible Matches</span>
              <strong class="stat-value">${filteredMatches.length}</strong>
            </article>
            <article class="admin-summary-card">
              <span class="card-kicker">Open</span>
              <strong class="stat-value">${filteredOpenMatches}</strong>
            </article>
            <article class="admin-summary-card">
              <span class="card-kicker">Finished</span>
              <strong class="stat-value">${filteredFinishedMatches}</strong>
            </article>
          </div>
          <div>
            <label class="field-label" for="importMatchesInput">Import matches JSON</label>
            <input class="file-input" id="importMatchesInput" type="file" accept="application/json">
          </div>
        </div>
      </div>
    </div>
  `;

  const adminMarkup = availableAdminRounds
    .map((option) => {
      if (selectedAdminRound !== "all" && option.value !== selectedAdminRound) {
        return "";
      }

      const roundMatches = filteredMatches.filter((match) => match.round === option.value);

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
                <div class="admin-card-header">
                  <div>
                    <span class="card-kicker">${escapeHtml(getMatchGroupLabel(match))}</span>
                    <h3>${escapeHtml(match.teamA)} vs ${escapeHtml(match.teamB)}</h3>
                  </div>
                  <div class="chip-row">
                    <span class="chip">${escapeHtml(formatDateTime(match.matchDate))}</span>
                    <span class="status-pill ${match.isFinished ? "status-closed" : "status-open"}">${match.isFinished ? "Finished" : "Pending"}</span>
                  </div>
                </div>
                <form class="admin-match-form" data-match-id="${escapeHtml(match.id)}">
                  <div class="admin-form-grid">
                    <label class="field-group">
                      <span>Match date</span>
                      <input type="datetime-local" name="matchDate" value="${escapeHtml(formatDateTimeLocal(match.matchDate))}">
                    </label>
                    <label class="field-group">
                      <span>Prediction deadline</span>
                      <input type="datetime-local" name="predictionDeadline" value="${escapeHtml(formatDateTimeLocal(match.predictionDeadline))}">
                    </label>
                  </div>
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
                  ${isKnockoutMatch(match) ? `
                    <div class="shootout-picker admin-shootout-picker ${requiresKnockoutWinner(match, match.actualScoreA, match.actualScoreB) ? "" : "hidden"}" data-role="admin-shootout-picker">
                      <label class="select-box">
                        <span>Penalty shootout winner</span>
                        <select name="actualPenaltyWinner" data-role="admin-shootout-winner-select" ${requiresKnockoutWinner(match, match.actualScoreA, match.actualScoreB) ? "" : "disabled"}>
                          <option value="">Select winner</option>
                          <option value="teamA" ${normalizeKnockoutWinnerChoice(match.actualPenaltyWinner) === "teamA" ? "selected" : ""}>${escapeHtml(match.teamA)}</option>
                          <option value="teamB" ${normalizeKnockoutWinnerChoice(match.actualPenaltyWinner) === "teamB" ? "selected" : ""}>${escapeHtml(match.teamB)}</option>
                        </select>
                      </label>
                      <p class="deadline-note">Required only when the knockout match finishes level and goes to penalties.</p>
                    </div>
                  ` : ""}
                  <div class="admin-form-footer">
                    <div class="chip-row">
                      ${isKnockoutMatch(match) ? `
                        <label class="chip admin-toggle-chip">
                          <input type="checkbox" name="wentToExtraTime" ${didMatchGoToExtraTime(match) ? "checked" : ""}>
                          Match went to extra time
                        </label>
                      ` : ""}
                      <label class="chip admin-toggle-chip">
                        <input type="checkbox" name="isFinished" ${match.isFinished ? "checked" : ""}>
                        Mark match as finished
                      </label>
                    </div>
                    <button class="primary-button" type="submit">Save Match</button>
                  </div>
                </form>
                ${renderAdminPlayerPredictionEditor(match)}
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
    ${shouldShowGroupsSection ? `
      <section class="round-section panel">
        <div class="round-section-header">
          <h3>Group Results</h3>
          <span class="chip">${countActualBestThirdSelections()}/${BEST_THIRD_QUALIFIERS_COUNT} best third spots used</span>
        </div>
        <div class="admin-grid">
          ${groupCards}
        </div>
      </section>
    ` : ""}
  `;
  syncAdminMatchFormStates();
  syncAdminPlayerPredictionFormStates();
}

function getAdminRoundFilterValue(availableAdminRounds) {
  const availableValues = new Set(["all", ...availableAdminRounds.map((option) => option.value)]);
  const currentValue = String(uiState.adminRoundFilter || "");
  if (availableValues.has(currentValue)) {
    return currentValue;
  }

  const currentRound = getCurrentRoundOptionValue();
  if (availableValues.has(currentRound)) {
    uiState.adminRoundFilter = currentRound;
    return currentRound;
  }

  uiState.adminRoundFilter = "all";
  return "all";
}

function recalculatePoints(sourceState = state) {
  const playerMap = new Map();
  const matchById = new Map();
  const groupById = new Map();

  sourceState.players.forEach((player) => {
    player.totalPoints = 0;
    player.matchPoints = 0;
    player.specialPoints = 0;
    player.groupPoints = 0;
    player.exactScores = 0;
    player.lastPredictionTime = null;
    playerMap.set(player.id, player);
  });
  sourceState.matches.forEach((match) => {
    matchById.set(String(match.id), match);
  });
  sourceState.groups.forEach((group) => {
    groupById.set(String(group.id), group);
  });

  sourceState.matchPredictions.forEach((prediction) => {
    const match = matchById.get(String(prediction.matchId)) || null;
    const player = playerMap.get(prediction.playerId);
    const breakdown = match ? getMatchPredictionScoreBreakdown(prediction, match) : buildEmptyMatchScoreBreakdown();
    prediction.basePoints = breakdown.basePoints;
    prediction.specialBonusPoints = breakdown.specialBonusPoints;
    prediction.points = breakdown.totalPoints;
    if (!player) {
      return;
    }

    player.matchPoints += prediction.points;
    player.specialPoints += prediction.specialBonusPoints;
    player.totalPoints += prediction.points;
    if (match && isExactScore(prediction, match)) {
      player.exactScores += 1;
    }
    player.lastPredictionTime = getLatestTime(player.lastPredictionTime, prediction.submittedAt);
    prediction.playerName = player.name;
  });

  sourceState.groupPredictions.forEach((prediction) => {
    const group = groupById.get(String(prediction.groupId)) || null;
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

  invalidateDerivedState(sourceState);
}

function buildEmptyMatchScoreBreakdown() {
  return {
    basePoints: 0,
    specialBonusPoints: 0,
    totalPoints: 0
  };
}

function getMatchPredictionScoreBreakdown(prediction, match) {
  if (!match.isFinished || match.actualScoreA === null || match.actualScoreB === null) {
    return buildEmptyMatchScoreBreakdown();
  }

  const scoring = getMatchScoring(match);
  const basePoints = calculateMatchPredictionBasePoints(prediction, match);
  const specialFeature = isSpecialFeatureMatch(match)
    ? normalizeSpecialFeatureForMatch(prediction.specialFeature, match)
    : "";
  const specialFeatureTarget = normalizeSpecialFeatureTarget(prediction.specialFeatureTarget);
  const totalGoals = Number(match.actualScoreA) + Number(match.actualScoreB);
  let specialBonusPoints = 0;
  let totalPoints = basePoints;

  if (specialFeature === "doublePick" && basePoints > 0) {
    specialBonusPoints = basePoints;
    totalPoints = basePoints * 2;
  } else if (specialFeature === "goalRush") {
    specialBonusPoints = totalGoals;
    totalPoints = basePoints + specialBonusPoints;
  } else if (specialFeature === "perfectBoost" && isExactScore(prediction, match)) {
    specialBonusPoints = 8 - scoring.exactScore;
    totalPoints = 8;
  } else if (specialFeature === "riskMode") {
    specialBonusPoints = basePoints > 0 ? 15 - basePoints : -15;
    totalPoints = 15;
    if (basePoints === 0) {
      totalPoints = -15;
    }
  } else if (specialFeature === "extraTimeHunter" && didMatchGoToExtraTime(match)) {
    specialBonusPoints = 3;
    totalPoints = basePoints + specialBonusPoints;
  } else if (specialFeature === "cleanSheetMaster" && didTeamKeepCleanSheet(match, specialFeatureTarget)) {
    specialBonusPoints = 5;
    totalPoints = basePoints + specialBonusPoints;
  }

  return {
    basePoints,
    specialBonusPoints,
    totalPoints
  };
}

function calculateMatchPredictionBasePoints(prediction, match) {
  const scoring = getMatchScoring(match);
  if (isExactScore(prediction, match)) {
    return scoring.exactScore;
  }

  const actualOutcome = getOutcome(match.actualScoreA, match.actualScoreB, match.actualPenaltyWinner);
  const predictedOutcome = getOutcome(
    prediction.predictedScoreA,
    prediction.predictedScoreB,
    prediction.predictedPenaltyWinner
  );

  if (predictedOutcome === actualOutcome) {
    return scoring.correctResult;
  }

  return 0;
}

function getMatchScoring(match) {
  return isKnockoutMatch(match) ? KNOCKOUT_MATCH_SCORING : MATCH_SCORING;
}

function didTeamKeepCleanSheet(match, targetTeam) {
  const target = normalizeSpecialFeatureTarget(targetTeam);
  if (!match || match.actualScoreA === null || match.actualScoreB === null) {
    return false;
  }

  if (target === "teamA") {
    return Number(match.actualScoreB) === 0;
  }

  if (target === "teamB") {
    return Number(match.actualScoreA) === 0;
  }

  return false;
}

function calculateGroupPredictionPoints(prediction, group) {
  if (!isGroupResultReady(group)) {
    return 0;
  }

  if (prediction.predictedFirst === group.actualFirst && prediction.predictedSecond === group.actualSecond) {
    if (isBestThirdBonusPrediction(prediction, group)) {
      return GROUP_SCORING.correctQualifiedTeams + GROUP_SCORING.thirdPlaceBonus;
    }

    return GROUP_SCORING.correctQualifiedTeams;
  }

  return 0;
}

function comparePlayersForLeaderboard(a, b) {
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
}

function getLeaderboard(sourceState = state) {
  return getDerivedState(sourceState).leaderboard.slice();
}

function getPlayerRank(playerId, sourceState = state) {
  return getDerivedState(sourceState).rankByPlayerId.get(String(playerId)) || null;
}

function getCurrentRoundLabel() {
  const currentRoundMatch = getCurrentRoundMatch();

  return currentRoundMatch ? currentRoundMatch.round : "Tournament complete";
}

function getCurrentRoundMatch() {
  const now = Date.now();
  const sortedMatches = state.matches
    .slice()
    .sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate));

  const nextOpenPrediction = sortedMatches.find((match) => {
    if (match.isFinished) {
      return false;
    }

    return new Date(match.predictionDeadline).getTime() >= now;
  });
  if (nextOpenPrediction) {
    return nextOpenPrediction;
  }

  const nextScheduledMatch = sortedMatches.find((match) => {
    if (match.isFinished) {
      return false;
    }

    return new Date(match.matchDate).getTime() >= now;
  });
  if (nextScheduledMatch) {
    return nextScheduledMatch;
  }

  return sortedMatches.find((match) => !match.isFinished) || null;
}

function getActivePlayer() {
  return getDerivedState().playerById.get(String(sessionState.activePlayerId || "")) || null;
}

function getMatchPrediction(playerId, matchId, sourceState = state) {
  return getDerivedState(sourceState).matchPredictionByKey.get(
    buildPredictionLookupKey(playerId, matchId)
  ) || null;
}

function getGroupPrediction(playerId, groupId, sourceState = state) {
  return getDerivedState(sourceState).groupPredictionByKey.get(
    buildPredictionLookupKey(playerId, groupId)
  ) || null;
}

function getMatchFilters() {
  return {
    round: dom.roundFilter.value || "all",
    group: dom.groupFilter.value || "all",
    team: dom.teamFilter.value || "all",
    status: dom.statusFilter.value || "all"
  };
}

function populateMatchFilters() {
  const availableGroups = [...new Set(state.matches.map(getMatchGroupLabel))];
  const availableTeams = getTournamentTeams()
    .map((team) => ({
      label: String(team.name || "").trim(),
      value: normalizeName(team.name)
    }))
    .filter((team) => team.label && team.value)
    .sort((teamA, teamB) => teamA.label.localeCompare(teamB.label));
  const previousRound = dom.roundFilter.value;
  const previousGroup = dom.groupFilter.value;
  const previousTeam = dom.teamFilter.value;
  const currentRound = getCurrentRoundOptionValue();

  dom.roundFilter.innerHTML = ROUND_FILTER_OPTIONS
    .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
    .join("");

  dom.groupFilter.innerHTML = [`<option value="all">All Groups</option>`]
    .concat(availableGroups.map((group) => `<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`))
    .join("");

  dom.teamFilter.innerHTML = [`<option value="all">All Teams</option>`]
    .concat(availableTeams.map((team) => `<option value="${escapeHtml(team.value)}">${escapeHtml(team.label)}</option>`))
    .join("");

  dom.roundFilter.value = ROUND_FILTER_OPTIONS.some((option) => option.value === previousRound)
    ? previousRound
    : currentRound;
  dom.groupFilter.value = availableGroups.includes(previousGroup) ? previousGroup : "all";
  dom.teamFilter.value = availableTeams.some((team) => team.value === previousTeam) ? previousTeam : "all";
}

function getCurrentRoundOptionValue() {
  const currentRound = getCurrentRoundLabel();
  if (ROUND_FILTER_OPTIONS.some((option) => option.value === currentRound)) {
    return currentRound;
  }
  return "all";
}

function applyRoundTheme() {
  document.body.dataset.roundTheme = getSelectedRoundTheme();
}

function getSelectedRoundTheme() {
  const selectedRound = dom.roundFilter?.value || "all";
  return ROUND_THEME_MAP[selectedRound] || "default";
}

function sortMatchesForDisplay(matches, player) {
  const priorityMatchDay = getPriorityMatchDay(matches, player);
  if (!priorityMatchDay) {
    return matches;
  }

  return matches.slice().sort((a, b) => {
    const aPriority = getMatchDayKey(a.matchDate) === priorityMatchDay ? 0 : 1;
    const bPriority = getMatchDayKey(b.matchDate) === priorityMatchDay ? 0 : 1;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    return new Date(a.matchDate) - new Date(b.matchDate);
  });
}

function getPriorityMatchDay(matches, player) {
  const derived = getDerivedState();
  const predictedMatchIds = player
    ? new Set((derived.matchPredictionsByPlayerId.get(String(player.id)) || []).map((prediction) => String(prediction.matchId)))
    : new Set();

  const candidateGroups = [
    matches.filter((match) => isPredictionOpen(match.predictionDeadline) && !predictedMatchIds.has(String(match.id))),
    matches.filter((match) => isPredictionOpen(match.predictionDeadline)),
    matches.filter((match) => !match.isFinished)
  ];

  const priorityMatch = candidateGroups
    .find((group) => group.length)?.[0] || null;

  return priorityMatch ? getMatchDayKey(priorityMatch.matchDate) : null;
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

  if (Number(prediction.basePoints || 0) === getMatchScoring(match).correctResult) {
    return { label: "Correct Result", className: "status-winner" };
  }

  return { label: "Wrong", className: "status-wrong" };
}

function getGroupHistoryStatus(prediction, group) {
  if (!isGroupResultReady(group)) {
    return { label: "Pending", className: "status-pending" };
  }

  if (prediction.points === GROUP_SCORING.qualifiedTeamsWithThirdBonus) {
    return { label: "Top Two + Best Third", className: "status-exact" };
  }

  if (prediction.points === GROUP_SCORING.correctQualifiedTeams) {
    return { label: "Top Two Order", className: "status-winner" };
  }

  return { label: "Wrong", className: "status-wrong" };
}

function isExactScore(prediction, match) {
  const scoresMatch = Boolean(
    match.isFinished &&
    match.actualScoreA !== null &&
    match.actualScoreB !== null &&
    prediction.predictedScoreA === match.actualScoreA &&
    prediction.predictedScoreB === match.actualScoreB
  );

  if (!scoresMatch) {
    return false;
  }

  if (!requiresKnockoutWinner(match, match.actualScoreA, match.actualScoreB)) {
    return true;
  }

  return normalizeKnockoutWinnerChoice(prediction.predictedPenaltyWinner) === normalizeKnockoutWinnerChoice(match.actualPenaltyWinner);
}

function exportLeaderboard() {
  const leaderboard = getLeaderboard().map((player, index) => ({
    rank: index + 1,
    name: player.name,
    totalPoints: player.totalPoints,
    matchPoints: player.matchPoints,
    specialPoints: player.specialPoints,
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
  const groupDefaults = buildGroupDefaults(groups);
  const matchesSource = Array.isArray(data.matches) && data.matches.length
    ? data.matches
    : [];
  const matches = matchesSource.map((match, index) => normalizeMatch(match, index, groupLookup));

  syncGroupPredictionDeadlines(groups, matches);

  return {
    version: String(data.version || "wc2026-default-schedule"),
    groups,
    matches,
    groupLookup,
    groupDefaults
  };
}

function normalizeGroup(group, lookup, defaultGroup = null) {
  const id = String(group.id || "").trim();
  const teams = Array.isArray(group.teams) ? group.teams.map((team) => ({
    id: String(team.id || slugifyTeamName(team.name || "")),
    name: String(team.name || ""),
    logo: resolveTeamLogo(team.logo, lookup?.[normalizeName(team.name)]?.logo || "")
  })) : [];
  const hasScheduleLevelGroupDeadline = Boolean(defaultGroup?.predictionDeadline);

  const normalizedGroup = {
    id,
    name: String(group.name || `Group ${id}`),
    teams,
    predictionDeadline: group.predictionDeadline ? String(group.predictionDeadline) : null,
    actualFirst: group.actualFirst || null,
    actualSecond: group.actualSecond || null,
    actualThird: group.actualThird || null,
    actualThirdQualifies: typeof group.actualThirdQualifies === "boolean" ? group.actualThirdQualifies : null,
    autoPredictionDeadline: hasScheduleLevelGroupDeadline
      ? Boolean(group.autoPredictionDeadline)
      : true
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
  const actualPenaltyWinner = requiresKnockoutWinner(match, actualScoreA, actualScoreB)
    ? normalizeKnockoutWinnerChoice(match.actualPenaltyWinner) || null
    : null;
  const wentToExtraTime = Boolean(match.wentToExtraTime) || Boolean(actualPenaltyWinner);
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
    actualPenaltyWinner,
    wentToExtraTime,
    isFinished: Boolean(match.isFinished),
    resultUpdatedAt: match.resultUpdatedAt ? String(match.resultUpdatedAt) : null
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

function buildGroupDefaults(groups) {
  return groups.reduce((lookup, group) => {
    lookup[String(group.id)] = {
      predictionDeadline: group.predictionDeadline ? String(group.predictionDeadline) : null
    };
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

function getOutcome(scoreA, scoreB, penaltyWinner = "") {
  if (scoreA === scoreB) {
    const resolvedWinner = normalizeKnockoutWinnerChoice(penaltyWinner);
    if (resolvedWinner === "teamA") {
      return "home";
    }
    if (resolvedWinner === "teamB") {
      return "away";
    }
    return "draw";
  }
  return scoreA > scoreB ? "home" : "away";
}

function normalizeTeamSideChoice(value) {
  const normalizedValue = String(value || "").trim();
  return normalizedValue === "teamA" || normalizedValue === "teamB" ? normalizedValue : "";
}

function normalizeKnockoutWinnerChoice(value) {
  return normalizeTeamSideChoice(value);
}

function normalizeSpecialFeatureTarget(value) {
  return normalizeTeamSideChoice(value);
}

function isKnockoutMatch(match) {
  return Boolean(match) && isKnockoutRound(match.round);
}

function isKnockoutRound(roundName) {
  return !isGroupStageRound(roundName);
}

function requiresKnockoutWinner(match, scoreA, scoreB) {
  return isKnockoutMatch(match) && scoreA !== null && scoreB !== null && scoreA === scoreB;
}

function getKnockoutWinnerLabel(winnerChoice, match) {
  const normalizedWinner = normalizeKnockoutWinnerChoice(winnerChoice);
  if (normalizedWinner === "teamA") {
    return String(match?.teamA || "Team A");
  }
  if (normalizedWinner === "teamB") {
    return String(match?.teamB || "Team B");
  }
  return "";
}

function didMatchGoToExtraTime(match) {
  return Boolean(
    match
    && isKnockoutMatch(match)
    && (
      Boolean(match.wentToExtraTime)
      || Boolean(normalizeKnockoutWinnerChoice(match.actualPenaltyWinner))
    )
  );
}

function formatScorelineWithWinner(scoreA, scoreB, winnerChoice, match) {
  if (scoreA === null || scoreB === null) {
    return "Pending";
  }

  const scoreline = `${scoreA} - ${scoreB}`;
  if (!requiresKnockoutWinner(match, Number(scoreA), Number(scoreB))) {
    return scoreline;
  }

  const winnerLabel = getKnockoutWinnerLabel(winnerChoice, match);
  return winnerLabel ? `${scoreline} • Pens: ${winnerLabel}` : scoreline;
}

function formatMatchScoreline(match) {
  const scoreline = formatScorelineWithWinner(match.actualScoreA, match.actualScoreB, match.actualPenaltyWinner, match);
  if (scoreline === "Pending" || !didMatchGoToExtraTime(match)) {
    return scoreline;
  }

  if (scoreline.includes("• Pens:")) {
    return scoreline.replace("• Pens:", "• AET • Pens:");
  }

  return `${scoreline} • AET`;
}

function formatPredictionScoreline(prediction, match) {
  return formatScorelineWithWinner(
    prediction?.predictedScoreA ?? null,
    prediction?.predictedScoreB ?? null,
    prediction?.predictedPenaltyWinner,
    match
  );
}

function formatDateTime(value) {
  return dateTimeFormatter.format(new Date(value));
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

function getMatchDayKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
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

function formatChatTime(value) {
  return chatTimeFormatter.format(new Date(value));
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeChatMessageText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CHAT_MAX_MESSAGE_LENGTH);
}

function containsBlockedChatLanguage(value) {
  const normalized = normalizeChatModerationText(value);
  if (!normalized.compact) {
    return false;
  }

  return CHAT_BLOCKED_TERMS_EN.some((term) => normalized.compact.includes(term))
    || CHAT_BLOCKED_TERMS_AR.some((term) => {
      const compactTerm = normalizeChatModerationText(term).compact;
      return compactTerm ? normalized.compact.includes(compactTerm) : false;
    });
}

function normalizeChatModerationText(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/ـ/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[ؤئ]/g, "ي")
    .replace(/ة/g, "ه");

  return {
    compact: normalized.replace(/[^a-z0-9\u0600-\u06ff]+/g, "")
  };
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
    specialPoints: Number(player?.specialPoints || 0),
    groupPoints: Number(player?.groupPoints || 0),
    exactScores: Number(player?.exactScores || 0),
    createdAt: player?.createdAt || new Date().toISOString(),
    lastPredictionTime: player?.lastPredictionTime || null
  };
}

function normalizeChatMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map(normalizeChatMessage)
    .filter(Boolean)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-CHAT_MAX_MESSAGES);
}

function normalizeChatMessage(message) {
  if (!message || typeof message !== "object") {
    return null;
  }

  const playerName = String(message.playerName || "").trim();
  const text = normalizeChatMessageText(message.text);
  const createdAt = normalizeTimestamp(message.createdAt);
  if (!playerName || !text || !createdAt) {
    return null;
  }

  return {
    id: String(message.id || createId("chat")),
    playerId: String(message.playerId || ""),
    playerName,
    text,
    createdAt,
    reactions: normalizeChatReactions(message.reactions)
  };
}

function normalizeChatReactions(reactions) {
  if (!Array.isArray(reactions)) {
    return [];
  }

  const dedupedReactions = new Map();

  reactions
    .map(normalizeChatReaction)
    .filter(Boolean)
    .forEach((reaction) => {
      dedupedReactions.set(reaction.playerId, reaction);
    });

  return Array.from(dedupedReactions.values())
    .sort((firstReaction, secondReaction) => new Date(firstReaction.reactedAt) - new Date(secondReaction.reactedAt));
}

function normalizeChatReaction(reaction) {
  if (!reaction || typeof reaction !== "object") {
    return null;
  }

  const playerId = String(reaction.playerId || "").trim();
  const playerName = String(reaction.playerName || "").trim();
  const emoji = String(reaction.emoji || "").trim();
  const reactedAt = normalizeTimestamp(reaction.reactedAt);

  if (!playerId || !playerName || !emoji || !reactedAt || !CHAT_REACTION_EMOJIS.includes(emoji)) {
    return null;
  }

  return {
    playerId,
    playerName,
    emoji,
    reactedAt
  };
}

function normalizeTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function isScrolledNearBottom(element) {
  if (!(element instanceof HTMLElement)) {
    return true;
  }

  return element.scrollHeight - element.scrollTop - element.clientHeight < 48;
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

function isBestThirdBonusPrediction(prediction, group) {
  return Boolean(
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
