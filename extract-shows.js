const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgPath = path.join(__dirname, '2023 Large Map 2.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// ============================================================
// Parse style definitions to map class names to font sizes
// ============================================================
const fontSizeMap = {};
const styleRegex = /\.(st\d+)\{[^}]*font-size:([\d.]+)px[^}]*\}/g;
let sm;
while ((sm = styleRegex.exec(svgContent)) !== null) {
  fontSizeMap[sm[1]] = parseFloat(sm[2]);
}

// ============================================================
// Helper: Parse transform matrix to extract x, y position
// ============================================================
function parseTransform(transformAttr) {
  const matrixMatch = transformAttr.match(
    /matrix\(\s*([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s*\)/
  );
  if (matrixMatch) {
    return {
      a: parseFloat(matrixMatch[1]),
      b: parseFloat(matrixMatch[2]),
      c: parseFloat(matrixMatch[3]),
      d: parseFloat(matrixMatch[4]),
      x: parseFloat(matrixMatch[5]),
      y: parseFloat(matrixMatch[6]),
    };
  }
  return null;
}

// ============================================================
// Helper: Create a URL-friendly slug from a name
// ============================================================
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[\u201C\u201D\u201E]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================
// Helper: Get font size from class list
// ============================================================
function getFontSize(classList) {
  var classes = classList.split(/\s+/);
  for (var i = 0; i < classes.length; i++) {
    if (fontSizeMap[classes[i]]) {
      return fontSizeMap[classes[i]];
    }
  }
  return 6;
}

// ============================================================
// Helper: Decode HTML entities
// ============================================================
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, function(_, num) { return String.fromCharCode(parseInt(num)); });
}

// ============================================================
// Extract shows from <g> groups containing st76 text elements
// ============================================================
var groupRegex = /<g>\s*([\s\S]*?)<\/g>/g;
var shows = [];
var usedSlugCounts = {};
var match;

while ((match = groupRegex.exec(svgContent)) !== null) {
  var groupContent = match[1];

  var groupTextRegex = /<text\s+transform="([^"]+)"\s+class="([^"]*)"\s*>([^<]*)<\/text>/g;
  var textLines = [];
  var textMatch;

  while ((textMatch = groupTextRegex.exec(groupContent)) !== null) {
    var transform = textMatch[1];
    var classList = textMatch[2];
    var content = decodeEntities(textMatch[3]).trim();

    if (!content || !classList.includes('st76')) continue;

    var parsed = parseTransform(transform);
    if (!parsed) continue;

    textLines.push({
      content: content,
      x: parsed.x,
      y: parsed.y,
      classList: classList,
      fontSize: getFontSize(classList),
    });
  }

  if (textLines.length === 0) continue;

  var name = textLines.map(function(t) { return t.content; }).join(' ').replace(/\s+/g, ' ').trim();

  if (name.length < 2) continue;

  var firstLine = textLines[0];
  var x = Math.round(firstLine.x * 100) / 100;
  var y = Math.round(firstLine.y * 100) / 100;

  var fontSize = firstLine.fontSize;
  var maxLineLength = Math.max.apply(null, textLines.map(function(t) { return t.content.length; }));
  var width = Math.round(maxLineLength * fontSize * 0.55);

  var lineSpacing = textLines.length > 1
    ? textLines[textLines.length - 1].y - textLines[0].y
    : 0;
  var height = Math.round(lineSpacing + fontSize * 1.2);

  var baseSlug = slugify(name);
  if (!baseSlug) baseSlug = 'unknown';
  usedSlugCounts[baseSlug] = (usedSlugCounts[baseSlug] || 0) + 1;
  var id = usedSlugCounts[baseSlug] > 1
    ? baseSlug + '-' + usedSlugCounts[baseSlug]
    : baseSlug;

  shows.push({ id: id, name: name, x: x, y: y, width: width, height: height });
}

console.log('Shows extracted: ' + shows.length);

// ============================================================
// Extract creators (non-st76 text elements)
// ============================================================
var creators = [];
var creatorUsedSlugs = {};

var creatorTextRegex2 = /<text\s+transform="([^"]+)"\s+(?:class="([^"]*)"\s*)?>([^<]*)<\/text>/g;
var creatorTexts = [];

while ((match = creatorTextRegex2.exec(svgContent)) !== null) {
  var transform2 = match[1];
  var classList2 = match[2] || '';
  var content2 = decodeEntities(match[3]).trim();

  if (!content2 || classList2.includes('st76')) continue;
  if (content2.length < 2) continue;

  var parsed2 = parseTransform(transform2);
  if (!parsed2) continue;

  creatorTexts.push({
    content: content2,
    x: parsed2.x,
    y: parsed2.y,
    classList: classList2,
    fontSize: getFontSize(classList2),
    index: match.index,
  });
}

var groupedCreators = [];
var currentGroup = null;

for (var i = 0; i < creatorTexts.length; i++) {
  var ct = creatorTexts[i];
  if (
    currentGroup &&
    Math.abs(ct.x - currentGroup[0].x) < 5 &&
    ct.y - currentGroup[currentGroup.length - 1].y < 12 &&
    ct.y - currentGroup[currentGroup.length - 1].y > 0 &&
    ct.classList === currentGroup[0].classList
  ) {
    currentGroup.push(ct);
  } else {
    if (currentGroup) groupedCreators.push(currentGroup);
    currentGroup = [ct];
  }
}
if (currentGroup) groupedCreators.push(currentGroup);

for (var j = 0; j < groupedCreators.length; j++) {
  var group = groupedCreators[j];
  var cname = group.map(function(t) { return t.content; }).join(' ').replace(/\s+/g, ' ').trim();
  if (cname.length < 2) continue;

  var cx = Math.round(group[0].x * 100) / 100;
  var cy = Math.round(group[0].y * 100) / 100;

  var cbaseSlug = slugify(cname);
  if (!cbaseSlug) cbaseSlug = 'unknown';
  creatorUsedSlugs[cbaseSlug] = (creatorUsedSlugs[cbaseSlug] || 0) + 1;
  var cid = creatorUsedSlugs[cbaseSlug] > 1
    ? cbaseSlug + '-' + creatorUsedSlugs[cbaseSlug]
    : cbaseSlug;

  creators.push({ id: cid, name: cname, x: cx, y: cy });
}

console.log('Creators extracted: ' + creators.length);

// ============================================================
// Write the output TypeScript file
// ============================================================
var outputDir = path.join(__dirname, 'app', 'src', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

var outputPath = path.join(outputDir, 'shows.ts');

var NL = '\n';
var lines = [];
lines.push('export interface Show {');
lines.push('  id: string;');
lines.push('  name: string;');
lines.push('  x: number;');
lines.push('  y: number;');
lines.push('  width: number;');
lines.push('  height: number;');
lines.push('}');
lines.push('');
lines.push('export interface Creator {');
lines.push('  id: string;');
lines.push('  name: string;');
lines.push('  x: number;');
lines.push('  y: number;');
lines.push('}');
lines.push('');
lines.push('export const shows: Show[] = [');

for (var si = 0; si < shows.length; si++) {
  var s = shows[si];
  var comma = si < shows.length - 1 ? ',' : '';
  lines.push('  { id: ' + JSON.stringify(s.id) + ', name: ' + JSON.stringify(s.name) + ', x: ' + s.x + ', y: ' + s.y + ', width: ' + s.width + ', height: ' + s.height + ' }' + comma);
}

lines.push('];');
lines.push('');
lines.push('export const creators: Creator[] = [');

for (var ci = 0; ci < creators.length; ci++) {
  var c = creators[ci];
  var comma2 = ci < creators.length - 1 ? ',' : '';
  lines.push('  { id: ' + JSON.stringify(c.id) + ', name: ' + JSON.stringify(c.name) + ', x: ' + c.x + ', y: ' + c.y + ' }' + comma2);
}

lines.push('];');
lines.push('');

fs.writeFileSync(outputPath, lines.join(NL), 'utf-8');
console.log('Output written to: ' + outputPath);
console.log('');
console.log('Sample shows:');
for (var pi = 0; pi < Math.min(15, shows.length); pi++) {
  var ps = shows[pi];
  console.log('  ' + ps.name + ' (' + ps.x + ', ' + ps.y + ') ' + ps.width + 'x' + ps.height);
}
console.log('');
console.log('Sample creators:');
for (var pci = 0; pci < Math.min(15, creators.length); pci++) {
  var pc = creators[pci];
  console.log('  ' + pc.name + ' (' + pc.x + ', ' + pc.y + ')');
}
