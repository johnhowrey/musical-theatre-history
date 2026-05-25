import Foundation

// Codable mirror of public/map-document.json (see reports/map-document.md).
// The SAME document the web renders — fetched at launch so content updates ship
// without an App Store release.

struct MapDoc: Decodable {
    let version: Int
    let viewBox: ViewBox
    let creators: [Creator]
    let lines: [MapLine]
    let ticks: [Tick]
    let markers: [Marker]
    let stations: [Station]
    let addedLabels: [AddedLabel]
    let orphanLabels: [OrphanLabel]
}

struct ViewBox: Decodable { let width: Double; let height: Double }

struct Creator: Decodable, Identifiable {
    var id: String { name }
    let name: String
    let color: String
    let shows: [String]      // station/show ids, ordered ALONG the line
}

struct MapLine: Decodable {
    let creator: String
    let color: String
    let personIds: [String]
    let paths: [LinePath]
}
struct LinePath: Decodable { let d: String; let w: Double }

struct Tick: Decodable { let x1: Double; let y1: Double; let x2: Double; let y2: Double; let color: String; let w: Double }

struct Marker: Decodable {
    let cx: Double; let cy: Double
    let r: Double?            // circle radius (nil for pills/dots)
    let pill: String?         // stadium path d (nil otherwise)
    let dot: Bool?            // degenerate solid dot
    let w: Double
}

struct LabelLine: Decodable { let text: String; let transform: String }

struct Station: Decodable, Identifiable {
    let id: String
    let title: String
    let x: Double; let y: Double
    let intersection: Bool
    let spread: Double
    let color: String
    let creators: [String]
    let coveredMarker: Bool
    let coveredTick: Bool
    let added: Bool
    let tangent: [Double]     // [tx, ty]
    let labelDelta: [Double]  // [dx, dy]
    let label: [LabelLine]?   // v1 label lines (when this show has one)
}

struct AddedLabel: Decodable {
    let id: String
    let lines: [String]
    let x: Double; let y: Double
    let align: String         // start | middle | end
    let fontSize: Double
    let bold: Bool
}

struct OrphanLabel: Decodable {
    let lines: [LabelLine]
    let fontSize: Double
    let bold: Bool
    let fill: String          // != #231F20 ⇒ a creator legend
}
