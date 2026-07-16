const worldCupData = (() => {
  const TEAM_LOGO_URLS = {
    "Mexico": "https://flagcdn.com/w160/mx.png",
    "South Africa": "https://flagcdn.com/w160/za.png",
    "South Korea": "https://flagcdn.com/w160/kr.png",
    "Czech Republic": "https://flagcdn.com/w160/cz.png",
    "Canada": "https://flagcdn.com/w160/ca.png",
    "Bosnia & Herzegovina": "https://flagcdn.com/w160/ba.png",
    "Bosnia and Herzegovina": "https://flagcdn.com/w160/ba.png",
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
  const knockoutMatches = generateKnockoutMatches();

  return {
    version: "wc2026-groups-a-to-l-v7",
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

  function generateKnockoutMatches() {
    const roundOf32Schedule = [
      { id: 73, date: "2026-06-28", day: "Sunday", time: "22:00", homeTeam: "South Africa", awayTeam: "Canada", status: "scheduled" },
      { id: 74, date: "2026-06-29", day: "Monday", time: "20:00", homeTeam: "Brazil", awayTeam: "Japan", status: "scheduled" },
      { id: 75, date: "2026-06-29", day: "Monday", time: "23:30", homeTeam: "Germany", awayTeam: "Paraguay", status: "scheduled" },
      { id: 76, date: "2026-06-30", day: "Tuesday", time: "04:00", homeTeam: "Netherlands", awayTeam: "Morocco", status: "scheduled" },
      { id: 77, date: "2026-06-30", day: "Tuesday", time: "20:00", homeTeam: "Ivory Coast", awayTeam: "Norway", status: "scheduled" },
      { id: 78, date: "2026-07-01", day: "Wednesday", time: "00:00", homeTeam: "France", awayTeam: "Sweden", status: "scheduled" },
      { id: 79, date: "2026-07-01", day: "Wednesday", time: "04:00", homeTeam: "Mexico", awayTeam: "Ecuador", status: "scheduled" },
      { id: 80, date: "2026-07-01", day: "Wednesday", time: "19:00", homeTeam: "England", awayTeam: "DR Congo", status: "scheduled" },
      { id: 81, date: "2026-07-01", day: "Wednesday", time: "23:00", homeTeam: "Belgium", awayTeam: "Senegal", status: "scheduled" },
      { id: 82, date: "2026-07-02", day: "Thursday", time: "03:00", homeTeam: "United States", awayTeam: "Bosnia and Herzegovina", status: "scheduled" },
      { id: 83, date: "2026-07-02", day: "Thursday", time: "22:00", homeTeam: "Spain", awayTeam: "Austria", status: "scheduled" },
      { id: 84, date: "2026-07-03", day: "Friday", time: "02:00", homeTeam: "Portugal", awayTeam: "Croatia", status: "scheduled" },
      { id: 85, date: "2026-07-03", day: "Friday", time: "06:00", homeTeam: "Switzerland", awayTeam: "Algeria", status: "scheduled" },
      { id: 86, date: "2026-07-03", day: "Friday", time: "21:00", homeTeam: "Egypt", awayTeam: "Australia", status: "scheduled" },
      { id: 87, date: "2026-07-04", day: "Saturday", time: "01:00", homeTeam: "Argentina", awayTeam: "Cape Verde", status: "scheduled" },
      { id: 88, date: "2026-07-04", day: "Saturday", time: "04:30", homeTeam: "Colombia", awayTeam: "Ghana", status: "scheduled" }
    ];

    const roundOf16Schedule = [
      { id: 89, date: "2026-07-04", day: "Saturday", time: "20:00", homeTeam: "Morocco", awayTeam: "Canada", status: "scheduled" },
      { id: 90, date: "2026-07-05", day: "Sunday", time: "00:00", homeTeam: "France", awayTeam: "Paraguay", status: "scheduled" },
      { id: 91, date: "2026-07-05", day: "Sunday", time: "23:00", homeTeam: "Norway", awayTeam: "Brazil", status: "scheduled" },
      { id: 92, date: "2026-07-06", day: "Monday", time: "03:00", homeTeam: "England", awayTeam: "Mexico", status: "scheduled" },
      { id: 93, date: "2026-07-06", day: "Monday", time: "22:00", homeTeam: "Spain", awayTeam: "Portugal", status: "scheduled" },
      { id: 94, date: "2026-07-07", day: "Tuesday", time: "03:00", homeTeam: "Belgium", awayTeam: "United States", status: "scheduled" },
      {
        id: 95,
        date: "2026-07-07",
        day: "Tuesday",
        time: "19:00",
        homeTeam: "Egypt",
        awayTeam: "Argentina",
        status: "scheduled",
        exactScorePointsOverride: 20,
        featuredBadge: "20 pts exact",
        featuredNote: "Exact score on this match is worth 20 points."
      },
      { id: 96, date: "2026-07-07", day: "Tuesday", time: "23:00", homeTeam: "Switzerland", awayTeam: "Colombia", status: "scheduled" }
    ];

    const quarterFinalsSchedule = [
      { id: 97, date: "2026-07-09", day: "Thursday", time: "23:00", homeTeam: "Morocco", awayTeam: "France", status: "scheduled" },
      { id: 98, date: "2026-07-10", day: "Friday", time: "22:00", homeTeam: "Spain", awayTeam: "Belgium", status: "scheduled" },
      { id: 99, date: "2026-07-12", day: "Sunday", time: "00:00", homeTeam: "Norway", awayTeam: "England", status: "scheduled" },
      { id: 100, date: "2026-07-12", day: "Sunday", time: "04:00", homeTeam: "Argentina", awayTeam: "Switzerland", status: "scheduled" }
    ];

    const semiFinalsSchedule = [
      { id: 101, date: "2026-07-14", day: "Tuesday", time: "22:00", homeTeam: "France", awayTeam: "Spain", status: "scheduled" },
      { id: 102, date: "2026-07-15", day: "Wednesday", time: "22:00", homeTeam: "England", awayTeam: "Argentina", status: "scheduled" }
    ];

    const finalsSchedule = [
      { id: 103, date: "2026-07-19", day: "Sunday", time: "00:00", homeTeam: "France", awayTeam: "England", status: "scheduled", roundName: "Third Place Match" },
      { id: 104, date: "2026-07-19", day: "Sunday", time: "22:00", homeTeam: "Argentina", awayTeam: "Spain", status: "scheduled", roundName: "Final" }
    ];

    const createScheduledMatch = (match, roundName) => {
      const matchDate = createDateFromParts(match.date, match.time);

      return {
        id: match.id,
        round: roundName,
        group: "",
        day: match.day,
        status: match.status,
        teamA: match.homeTeam,
        teamB: match.awayTeam,
        teamALogo: getTeamLogo(match.homeTeam),
        teamBLogo: getTeamLogo(match.awayTeam),
        matchDate: toIsoLocalString(matchDate),
        predictionDeadline: toIsoLocalString(addMinutes(matchDate, -15)),
        exactScorePointsOverride: Number(match.exactScorePointsOverride) > 0 ? Number(match.exactScorePointsOverride) : null,
        featuredBadge: match.featuredBadge || "",
        featuredNote: match.featuredNote || "",
        actualScoreA: null,
        actualScoreB: null,
        isFinished: false
      };
    };

    const matches = [
      ...roundOf32Schedule.map((match) => createScheduledMatch(match, "Round of 32")),
      ...roundOf16Schedule.map((match) => createScheduledMatch(match, "Round of 16")),
      ...quarterFinalsSchedule.map((match) => createScheduledMatch(match, "Quarter Finals")),
      ...semiFinalsSchedule.map((match) => createScheduledMatch(match, "Semi Finals")),
      ...finalsSchedule.map((match) => createScheduledMatch(match, match.roundName))
    ];
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

  function createDateFromParts(dateValue, timeValue) {
    const [year, month, day] = dateValue.split("-").map((part) => Number(part));
    const [hours, minutes] = timeValue.split(":").map((part) => Number(part));
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
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
