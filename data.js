const worldCupData = (() => {
  const TEAM_LOGO_URLS = {
    "Mexico": "https://flagcdn.com/w160/mx.png",
    "South Africa": "https://flagcdn.com/w160/za.png",
    "South Korea": "https://flagcdn.com/w160/kr.png",
    "Czech Republic": "https://flagcdn.com/w160/cz.png",
    "Canada": "https://flagcdn.com/w160/ca.png",
    "Bosnia & Herzegovina": "https://flagcdn.com/w160/ba.png",
    "Qatar": "https://flagcdn.com/w160/qa.png",
    "Switzerland": "https://flagcdn.com/w160/ch.png",
    "Brazil": "https://flagcdn.com/w160/br.png",
    "Morocco": "https://flagcdn.com/w160/ma.png",
    "Haiti": "https://flagcdn.com/w160/ht.png",
    "Scotland": createFlagSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36">
        <rect width="60" height="36" fill="#005eb8"/>
        <path d="M0 0 24 0 60 21.6 60 36 36 36 0 14.4Z" fill="#fff"/>
        <path d="M60 0 36 0 0 21.6 0 36 24 36 60 14.4Z" fill="#fff"/>
      </svg>
    `),
    "United States": "https://flagcdn.com/w160/us.png",
    "Paraguay": "https://flagcdn.com/w160/py.png",
    "Australia": "https://flagcdn.com/w160/au.png",
    "Turkey": "https://flagcdn.com/w160/tr.png",
    "Germany": "https://flagcdn.com/w160/de.png",
    "Curacao": "https://flagcdn.com/w160/cw.png",
    "Ivory Coast": "https://flagcdn.com/w160/ci.png",
    "Ecuador": "https://flagcdn.com/w160/ec.png",
    "Netherlands": "https://flagcdn.com/w160/nl.png",
    "Japan": "https://flagcdn.com/w160/jp.png",
    "Sweden": "https://flagcdn.com/w160/se.png",
    "Tunisia": "https://flagcdn.com/w160/tn.png",
    "Belgium": "https://flagcdn.com/w160/be.png",
    "Egypt": "https://flagcdn.com/w160/eg.png",
    "Iran": "https://flagcdn.com/w160/ir.png",
    "New Zealand": "https://flagcdn.com/w160/nz.png",
    "Spain": "https://flagcdn.com/w160/es.png",
    "Cape Verde": "https://flagcdn.com/w160/cv.png",
    "Saudi Arabia": "https://flagcdn.com/w160/sa.png",
    "Uruguay": "https://flagcdn.com/w160/uy.png",
    "France": "https://flagcdn.com/w160/fr.png",
    "Senegal": "https://flagcdn.com/w160/sn.png",
    "Iraq": "https://flagcdn.com/w160/iq.png",
    "Norway": "https://flagcdn.com/w160/no.png",
    "Argentina": "https://flagcdn.com/w160/ar.png",
    "Algeria": "https://flagcdn.com/w160/dz.png",
    "Austria": "https://flagcdn.com/w160/at.png",
    "Jordan": "https://flagcdn.com/w160/jo.png",
    "Portugal": "https://flagcdn.com/w160/pt.png",
    "DR Congo": "https://flagcdn.com/w160/cd.png",
    "Uzbekistan": "https://flagcdn.com/w160/uz.png",
    "Colombia": "https://flagcdn.com/w160/co.png",
    "England": createFlagSvgDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 36">
        <rect width="60" height="36" fill="#fff"/>
        <rect x="24" width="12" height="36" fill="#ce1126"/>
        <rect y="12" width="60" height="12" fill="#ce1126"/>
      </svg>
    `),
    "Croatia": "https://flagcdn.com/w160/hr.png",
    "Ghana": "https://flagcdn.com/w160/gh.png",
    "Panama": "https://flagcdn.com/w160/pa.png"
  };

  const GROUP_TEAM_NAMES = {
    A: ["Mexico", "South Africa", "South Korea", "Czech Republic"],
    B: ["Canada", "Bosnia & Herzegovina", "Qatar", "Switzerland"],
    C: ["Brazil", "Morocco", "Haiti", "Scotland"],
    D: ["United States", "Paraguay", "Australia", "Turkey"],
    E: ["Germany", "Curacao", "Ivory Coast", "Ecuador"],
    F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
    G: ["Belgium", "Egypt", "Iran", "New Zealand"],
    H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
    I: ["France", "Senegal", "Iraq", "Norway"],
    J: ["Argentina", "Algeria", "Austria", "Jordan"],
    K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
    L: ["England", "Croatia", "Ghana", "Panama"]
  };

  const GROUP_STAGE_PAIRINGS = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]]
  ];

  const groupIds = Object.keys(GROUP_TEAM_NAMES);
  const groups = groupIds.map((groupId) => ({
    id: groupId,
    name: `Group ${groupId}`,
    teams: GROUP_TEAM_NAMES[groupId].map((teamName) => ({
      id: slugify(teamName),
      name: teamName,
      logo: getTeamLogo(teamName)
    }))
  }));

  const groupStageMatches = generateGroupStageMatches(groups);
  const knockoutMatches = generateKnockoutMatches(groupStageMatches.length + 1);

  return {
    version: "wc2026-groups-a-to-l-v2",
    groups,
    matches: [...groupStageMatches, ...knockoutMatches]
  };

  function generateGroupStageMatches(sourceGroups) {
    const matches = [];
    let matchId = 1;
    const baseDate = new Date(2026, 5, 11, 22, 0, 0);

    GROUP_STAGE_PAIRINGS.forEach((pairings, roundIndex) => {
      sourceGroups.forEach((group, groupIndex) => {
        const dayOffset = roundIndex * 6 + Math.floor(groupIndex / 2);
        const groupSlot = groupIndex % 2;
        const kickoffHours = groupSlot === 0 ? [22, 25] : [28, 31];

        pairings.forEach((pair, matchIndex) => {
          const matchDate = new Date(baseDate);
          matchDate.setDate(baseDate.getDate() + dayOffset);
          matchDate.setHours(kickoffHours[matchIndex], 0, 0, 0);

          const teamA = group.teams[pair[0]];
          const teamB = group.teams[pair[1]];

          matches.push({
            id: matchId++,
            round: `Group Stage - Round ${roundIndex + 1}`,
            group: group.id,
            teamA: teamA.name,
            teamB: teamB.name,
            teamALogo: teamA.logo,
            teamBLogo: teamB.logo,
            matchDate: toIsoLocalString(matchDate),
            predictionDeadline: toIsoLocalString(addMinutes(matchDate, -15)),
            actualScoreA: null,
            actualScoreB: null,
            isFinished: false
          });
        });
      });
    });

    return matches;
  }

  function generateKnockoutMatches(startId) {
    const roundOf32Pairs = [
      ["Winner Group A", "Best 3rd Place Group C/D/E"],
      ["Winner Group B", "Runner-up Group A"],
      ["Winner Group C", "Best 3rd Place Group A/B/F"],
      ["Winner Group D", "Runner-up Group C"],
      ["Winner Group E", "Best 3rd Place Group G/H/I"],
      ["Winner Group F", "Runner-up Group E"],
      ["Winner Group G", "Best 3rd Place Group J/K/L"],
      ["Winner Group H", "Runner-up Group G"],
      ["Winner Group I", "Best 3rd Place Group B/C/D"],
      ["Winner Group J", "Runner-up Group I"],
      ["Winner Group K", "Best 3rd Place Group E/F/G"],
      ["Winner Group L", "Runner-up Group K"],
      ["Runner-up Group B", "Best 3rd Place Group H/I/J"],
      ["Runner-up Group D", "Best 3rd Place Group K/L/A"],
      ["Runner-up Group F", "Best 3rd Place Group D/E/F"],
      ["Runner-up Group H", "Best 3rd Place Group A/G/H"]
    ];

    const rounds = [
      {
        name: "Round of 32",
        start: new Date(2026, 5, 30, 13, 0, 0),
        times: [13, 16, 19, 22],
        teams: roundOf32Pairs
      },
      {
        name: "Round of 16",
        start: new Date(2026, 6, 4, 16, 0, 0),
        times: [16, 20],
        teams: Array.from({ length: 8 }, (_, index) => [`Winner Match ${startId + index * 2}`, `Winner Match ${startId + index * 2 + 1}`])
      },
      {
        name: "Quarter Finals",
        start: new Date(2026, 6, 8, 18, 0, 0),
        times: [18, 22],
        teams: Array.from({ length: 4 }, (_, index) => [`Winner Round of 16 Match ${index * 2 + 1}`, `Winner Round of 16 Match ${index * 2 + 2}`])
      },
      {
        name: "Semi Finals",
        start: new Date(2026, 6, 12, 21, 0, 0),
        times: [21],
        teams: [
          ["Winner Quarter Final 1", "Winner Quarter Final 2"],
          ["Winner Quarter Final 3", "Winner Quarter Final 4"]
        ]
      },
      {
        name: "Third Place Match",
        start: new Date(2026, 6, 18, 20, 0, 0),
        times: [20],
        teams: [["Loser Semi Final 1", "Loser Semi Final 2"]]
      },
      {
        name: "Final",
        start: new Date(2026, 6, 19, 20, 0, 0),
        times: [20],
        teams: [["Winner Semi Final 1", "Winner Semi Final 2"]]
      }
    ];

    const matches = [];
    let id = startId;

    rounds.forEach((round) => {
      round.teams.forEach((pair, index) => {
        const matchDate = new Date(round.start);
        matchDate.setDate(round.start.getDate() + Math.floor(index / round.times.length));
        matchDate.setHours(round.times[index % round.times.length], 0, 0, 0);

        matches.push({
          id: id++,
          round: round.name,
          group: "",
          teamA: pair[0],
          teamB: pair[1],
          teamALogo: "",
          teamBLogo: "",
          matchDate: toIsoLocalString(matchDate),
          predictionDeadline: toIsoLocalString(addMinutes(matchDate, -15)),
          actualScoreA: null,
          actualScoreB: null,
          isFinished: false
        });
      });
    });

    return matches;
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function addMinutes(date, minutes) {
    const next = new Date(date);
    next.setMinutes(next.getMinutes() + minutes);
    return next;
  }

  function toIsoLocalString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  function getTeamLogo(teamName) {
    return TEAM_LOGO_URLS[teamName] || "";
  }

  function createFlagSvgDataUrl(svg) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
  }
})();

globalThis.worldCupData = worldCupData;
