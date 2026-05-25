import SwiftUI

// Minimal SVG path parser → SwiftUI Path. Supports M L H V C S Q T Z (abs+rel),
// which is everything the map document uses (no arcs). Plus a matrix() parser.
extension Path {
    init(svg d: String) {
        self.init()
        let scanner = SVGTokenizer(d)
        var cur = CGPoint.zero
        var start = CGPoint.zero
        var lastCtrl: CGPoint? = nil   // last cubic control2 (for S)
        var lastQCtrl: CGPoint? = nil  // last quad control (for T)
        var cmd: Character = " "
        func num() -> CGFloat { CGFloat(scanner.number() ?? 0) }
        func pt(_ rel: Bool) -> CGPoint { let x = num(); let y = num(); return rel ? CGPoint(x: cur.x + x, y: cur.y + y) : CGPoint(x: x, y: y) }

        while let c = scanner.command() {
            if c.isLetter { cmd = c; if c == "Z" || c == "z" { closeSubpath(); cur = start; continue } }
            else { scanner.pushback(); /* implicit repeat of previous cmd */ }
            let rel = cmd.isLowercase
            switch Character(cmd.uppercased()) {
            case "M":
                cur = pt(rel); move(to: cur); start = cur
                // subsequent pairs are implicit L
                cmd = rel ? "l" : "L"
                lastCtrl = nil; lastQCtrl = nil
            case "L":
                cur = pt(rel); addLine(to: cur); lastCtrl = nil; lastQCtrl = nil
            case "H":
                let x = num(); cur = CGPoint(x: rel ? cur.x + x : x, y: cur.y); addLine(to: cur); lastCtrl = nil; lastQCtrl = nil
            case "V":
                let y = num(); cur = CGPoint(x: cur.x, y: rel ? cur.y + y : y); addLine(to: cur); lastCtrl = nil; lastQCtrl = nil
            case "C":
                let c1 = pt(rel), c2 = pt(rel), end = pt(rel)
                addCurve(to: end, control1: c1, control2: c2); cur = end; lastCtrl = c2; lastQCtrl = nil
            case "S":
                let c1 = lastCtrl.map { CGPoint(x: 2*cur.x - $0.x, y: 2*cur.y - $0.y) } ?? cur
                let c2 = pt(rel), end = pt(rel)
                addCurve(to: end, control1: c1, control2: c2); cur = end; lastCtrl = c2; lastQCtrl = nil
            case "Q":
                let c1 = pt(rel), end = pt(rel)
                addQuadCurve(to: end, control: c1); cur = end; lastQCtrl = c1; lastCtrl = nil
            case "T":
                let c1 = lastQCtrl.map { CGPoint(x: 2*cur.x - $0.x, y: 2*cur.y - $0.y) } ?? cur
                let end = pt(rel)
                addQuadCurve(to: end, control: c1); cur = end; lastQCtrl = c1; lastCtrl = nil
            default:
                break
            }
        }
    }
}

// Tiny tokenizer for path data: yields commands (letters) and numbers.
final class SVGTokenizer {
    private let chars: [Character]
    private var i = 0
    private var pushedBack = false
    init(_ s: String) { chars = Array(s) }

    private func skipSep() { while i < chars.count, chars[i] == " " || chars[i] == "," || chars[i] == "\n" || chars[i] == "\t" || chars[i] == "\r" { i += 1 } }

    func command() -> Character? {
        if pushedBack { pushedBack = false; return lastLetter }
        skipSep()
        guard i < chars.count else { return nil }
        if chars[i].isLetter { lastLetter = chars[i]; i += 1; return lastLetter }
        // a number begins — caller should have a current command; return the last letter as implicit
        lastLetter = lastLetter ?? "L"
        return lastLetter
    }
    private var lastLetter: Character? = nil
    func pushback() { pushedBack = true }

    func number() -> Double? {
        skipSep()
        guard i < chars.count else { return nil }
        var s = ""
        if chars[i] == "+" || chars[i] == "-" { s.append(chars[i]); i += 1 }
        while i < chars.count, chars[i].isNumber || chars[i] == "." || chars[i] == "e" || chars[i] == "E" || ((chars[i] == "+" || chars[i] == "-") && (s.last == "e" || s.last == "E")) {
            s.append(chars[i]); i += 1
        }
        return Double(s)
    }
}

// Parse `matrix(a b c d e f)` → CGAffineTransform (for label placement/rotation).
func parseMatrix(_ transform: String) -> CGAffineTransform {
    guard let open = transform.firstIndex(of: "("), let close = transform.firstIndex(of: ")") else { return .identity }
    let inner = transform[transform.index(after: open)..<close]
    let n = inner.split(whereSeparator: { $0 == " " || $0 == "," }).compactMap { Double($0) }
    guard n.count == 6 else { return .identity }
    return CGAffineTransform(a: n[0], b: n[1], c: n[2], d: n[3], tx: n[4], ty: n[5])
}
