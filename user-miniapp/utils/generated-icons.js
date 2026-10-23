function toDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function wrapIcon(content) {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${content}</svg>`,
  );
}

function tile(background, content) {
  return wrapIcon(
    `<rect x="6" y="6" width="52" height="52" rx="18" fill="${background}"/>${content}`,
  );
}

function taskIcon(stroke, background) {
  return tile(
    background,
    `<rect x="20" y="17" width="24" height="31" rx="7" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M26 17.5c0-2 1.8-3.5 4-3.5h4c2.2 0 4 1.5 4 3.5" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>
     <path d="M25 28h14M25 35h14M25 42h10" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function teamIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="25" cy="26" r="6" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <circle cx="39" cy="24" r="5" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M16 45c1.8-6.2 6.5-9.2 13-9.2S40.2 38.8 42 45" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>
     <path d="M37 35.8c4.7.4 8 3.2 9.5 8.2" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function bellIcon(stroke, background) {
  return tile(
    background,
    `<path d="M24 43h16c-1.8-2.2-3-4.5-3-8.4 0-4.7-2.1-9.6-8-9.6s-8 4.9-8 9.6c0 3.9-1.2 6.2-3 8.4h6" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M29 47c.7 1.8 2 2.8 4 2.8s3.3-1 4-2.8" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function profileIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="24" r="7" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M18 46c2.2-6.8 7.2-10.2 14-10.2S43.8 39.2 46 46" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function reviewIcon(stroke, background) {
  return tile(
    background,
    `<rect x="19" y="16" width="26" height="32" rx="7" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M25 28l4 4 8-8" fill="none" stroke="${stroke}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M25 39h14" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function settingsIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="32" r="7" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M32 18v4M32 42v4M18 32h4M42 32h4M22.1 22.1l2.8 2.8M39.1 39.1l2.8 2.8M41.9 22.1l-2.8 2.8M24.9 39.1l-2.8 2.8" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function recordsIcon(stroke, background) {
  return tile(
    background,
    `<path d="M24 18h16v8c0 5.5-3.8 10.4-9.2 11.7C25.7 36.4 24 31.5 24 26v-8Z" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linejoin="round"/>
     <path d="M24 20h-4c0 5 1.2 8 4 9.6M40 20h4c0 5-1.2 8-4 9.6M28 40h8M26 46h12" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
}

function phoneIcon(stroke, background) {
  return tile(
    background,
    `<rect x="23" y="15" width="18" height="34" rx="5" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M29 20h6M30 44h4" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function clearIcon(stroke, background) {
  return tile(
    background,
    `<path d="M22 23h20M26 23V19c0-1.7 1.3-3 3-3h6c1.7 0 3 1.3 3 3v4M25 23l1 20h12l1-20" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M30 28v10M34 28v10" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function infoIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="32" r="12" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M32 28v10M32 23.5h.1" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function liveIcon(stroke, background) {
  return tile(
    background,
    `<rect x="19" y="21" width="26" height="20" rx="7" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M29 27.5 37 31l-8 3.5Z" fill="${stroke}"/>
     <path d="M15 26c-2.6 3.8-2.6 8.2 0 12M49 26c2.6 3.8 2.6 8.2 0 12" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function chatIcon(stroke, background) {
  return tile(
    background,
    `<path d="M18 23a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v7a8 8 0 0 1-8 8H28l-8 7v-7.4A8 8 0 0 1 18 30Z" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linejoin="round"/>
     <path d="M27 26h10M27 32h7" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function locationIcon(stroke, background) {
  return tile(
    background,
    `<path d="M32 47s10-10.2 10-18a10 10 0 1 0-20 0c0 7.8 10 18 10 18Z" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linejoin="round"/>
     <circle cx="32" cy="29" r="3.6" fill="none" stroke="${stroke}" stroke-width="3.2"/>`,
  );
}

function checkinIcon(stroke, background) {
  return tile(
    background,
    `<path d="M32 46s9-9.2 9-16.5a9 9 0 1 0-18 0C23 36.8 32 46 32 46Z" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linejoin="round"/>
     <path d="M28.5 29.5 31 32l5-5" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
}

function lockIcon(stroke, background) {
  return tile(
    background,
    `<rect x="21" y="29" width="22" height="17" rx="5" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M25.5 29v-4.5a6.5 6.5 0 0 1 13 0V29" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>
     <circle cx="32" cy="36.5" r="2.2" fill="${stroke}"/>`,
  );
}

function targetIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="32" r="12" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <circle cx="32" cy="32" r="6" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <circle cx="32" cy="32" r="1.8" fill="${stroke}"/>`,
  );
}

function cameraIcon(stroke, background) {
  return tile(
    background,
    `<path d="M20 25h6l2-4h8l2 4h6a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V29a4 4 0 0 1 4-4Z" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linejoin="round"/>
     <circle cx="32" cy="34" r="6.5" fill="none" stroke="${stroke}" stroke-width="3.2"/>`,
  );
}

function clockIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="32" r="13" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M32 24v9l6 3" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
}

function successIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="32" r="13" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M25.5 32.5 30 37l8.5-9" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
}

const activeStroke = '#FF6B35';
const activeBackground = '#FFF1EC';
const inactiveStroke = '#A7AFBF';
const inactiveBackground = '#F4F6FA';
const menuStroke = '#FF6B35';
const menuBackground = '#FFF7F2';

const TAB_ICONS = {
  task: {
    normal: taskIcon(inactiveStroke, inactiveBackground),
    active: taskIcon(activeStroke, activeBackground),
  },
  team: {
    normal: teamIcon(inactiveStroke, inactiveBackground),
    active: teamIcon(activeStroke, activeBackground),
  },
  message: {
    normal: bellIcon(inactiveStroke, inactiveBackground),
    active: bellIcon(activeStroke, activeBackground),
  },
  profile: {
    normal: profileIcon(inactiveStroke, inactiveBackground),
    active: profileIcon(activeStroke, activeBackground),
  },
  review: {
    normal: reviewIcon(inactiveStroke, inactiveBackground),
    active: reviewIcon(activeStroke, activeBackground),
  },
};

const UI_ICONS = {
  task: taskIcon(menuStroke, menuBackground),
  team: teamIcon(menuStroke, menuBackground),
  message: bellIcon(menuStroke, menuBackground),
  profile: profileIcon(menuStroke, menuBackground),
  review: reviewIcon(menuStroke, menuBackground),
  settings: settingsIcon(menuStroke, menuBackground),
  records: recordsIcon(menuStroke, menuBackground),
  phone: phoneIcon(menuStroke, menuBackground),
  clear: clearIcon(menuStroke, menuBackground),
  info: infoIcon(menuStroke, menuBackground),
  live: liveIcon(menuStroke, menuBackground),
  chat: chatIcon(menuStroke, menuBackground),
  location: locationIcon(menuStroke, menuBackground),
  checkin: checkinIcon(menuStroke, menuBackground),
  lock: lockIcon(menuStroke, menuBackground),
  target: targetIcon(menuStroke, menuBackground),
  camera: cameraIcon(menuStroke, menuBackground),
  clock: clockIcon(menuStroke, menuBackground),
  success: successIcon(menuStroke, menuBackground),
};

module.exports = {
  TAB_ICONS,
  UI_ICONS,
};
