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

function teamIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="25" cy="26" r="6" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <circle cx="39" cy="24" r="5" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M16 45c1.8-6.2 6.5-9.2 13-9.2S40.2 38.8 42 45" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>
     <path d="M37 35.8c4.7.4 8 3.2 9.5 8.2" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
  );
}

function locationIcon(stroke, background) {
  return tile(
    background,
    `<path d="M32 47s10-10.2 10-18a10 10 0 1 0-20 0c0 7.8 10 18 10 18Z" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linejoin="round"/>
     <circle cx="32" cy="29" r="3.6" fill="none" stroke="${stroke}" stroke-width="3.2"/>`,
  );
}

function successIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="32" r="13" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M25.5 32.5 30 37l8.5-9" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
}

function clockIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="32" r="13" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M32 24v9l6 3" fill="none" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
}

function settingsIcon(stroke, background) {
  return tile(
    background,
    `<circle cx="32" cy="32" r="7" fill="none" stroke="${stroke}" stroke-width="3.2"/>
     <path d="M32 18v4M32 42v4M18 32h4M42 32h4M22.1 22.1l2.8 2.8M39.1 39.1l2.8 2.8M41.9 22.1l-2.8 2.8M24.9 39.1l-2.8 2.8" stroke="${stroke}" stroke-width="3.2" stroke-linecap="round"/>`,
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
  review: {
    normal: reviewIcon(inactiveStroke, inactiveBackground),
    active: reviewIcon(activeStroke, activeBackground),
  },
  profile: {
    normal: profileIcon(inactiveStroke, inactiveBackground),
    active: profileIcon(activeStroke, activeBackground),
  },
};

const UI_ICONS = {
  task: taskIcon(menuStroke, menuBackground),
  review: reviewIcon(menuStroke, menuBackground),
  settings: settingsIcon(menuStroke, menuBackground),
  team: teamIcon(menuStroke, menuBackground),
  location: locationIcon(menuStroke, menuBackground),
  success: successIcon(menuStroke, menuBackground),
  clock: clockIcon(menuStroke, menuBackground),
};

module.exports = {
  TAB_ICONS,
  UI_ICONS,
};
