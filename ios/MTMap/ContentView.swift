import SwiftUI

private let MARKER_R: CGFloat = 4.5
private let LINE_WIDTH: CGFloat = 5.0
private let MIN_SCALE: CGFloat = 0.6      // never smaller than this (stays readable)
private let MAX_SCALE: CGFloat = 6.0
private let INIT_SCALE: CGFloat = 1.0     // readable level on first ever launch

enum MapSelection: Identifiable {
    case show(Station)
    case creator(Creator)
    var id: String { switch self { case .show(let s): return "s:\(s.id)"; case .creator(let c): return "c:\(c.name)" } }
}

struct ContentView: View {
    @StateObject private var store = MapStore()
    @State private var scale: CGFloat = INIT_SCALE
    @State private var lastScale: CGFloat = INIT_SCALE
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero
    @State private var screen: CGSize = .zero
    @State private var selection: MapSelection?
    @State private var didSetup = false

    private var dimCreator: String? { if case .creator(let c) = selection { return c.name }; return nil }

    var body: some View {
        GeometryReader { geo in
            ZStack {
                mapCream.ignoresSafeArea()
                if let doc = store.doc {
                    Canvas { ctx, size in draw(doc, &ctx, size) }
                        .contentShape(Rectangle())
                        .gesture(
                            SimultaneousGesture(
                                DragGesture()
                                    .onChanged { v in
                                        offset = clampedOffset(CGSize(width: lastOffset.width + v.translation.width,
                                                                      height: lastOffset.height + v.translation.height), doc: doc)
                                    }
                                    .onEnded { _ in lastOffset = offset; persist() },
                                MagnificationGesture()
                                    .onChanged { m in
                                        scale = min(MAX_SCALE, max(MIN_SCALE, lastScale * m))
                                        offset = clampedOffset(offset, doc: doc)
                                    }
                                    .onEnded { _ in lastScale = scale; lastOffset = offset; persist() }
                            )
                        )
                        .simultaneousGesture(SpatialTapGesture().onEnded { v in handleTap(v.location, doc) })
                        .onAppear { screen = geo.size; if !didSetup { setupCamera(doc, geo.size); didSetup = true } }
                        .onChange(of: geo.size) { newSize in screen = newSize; offset = clampedOffset(offset, doc: doc) }
                } else if let e = store.error {
                    Text(e).foregroundColor(.secondary)
                } else {
                    ProgressView("Loading map…")
                }
            }
        }
        .task { await store.load() }
        .sheet(item: $selection) { sel in
            switch sel {
            case .show(let st): ShowDetailView(station: st, onCreator: openCreator)
            case .creator(let cr): CreatorDetailView(creator: cr, titleFor: titleFor, onShow: openShow)
            }
        }
    }

    // MARK: camera
    private func mapToScreen() -> CGAffineTransform {
        CGAffineTransform(translationX: offset.width, y: offset.height).scaledBy(x: scale, y: scale)
    }
    // Keep the content covering the screen (no empty margins); center any axis where
    // the content is smaller than the screen → the map can never pan fully off.
    private func clampedOffset(_ o: CGSize, doc: MapDoc) -> CGSize {
        let cw = doc.viewBox.width * scale, ch = doc.viewBox.height * scale
        var x = o.width, y = o.height
        if cw >= screen.width { x = min(0, max(screen.width - cw, x)) } else { x = (screen.width - cw) / 2 }
        if ch >= screen.height { y = min(0, max(screen.height - ch, y)) } else { y = (screen.height - ch) / 2 }
        return CGSize(width: x, height: y)
    }
    private func setupCamera(_ doc: MapDoc, _ size: CGSize) {
        let d = UserDefaults.standard
        if d.object(forKey: "cam.scale") != nil {              // restore last view
            scale = min(MAX_SCALE, max(MIN_SCALE, CGFloat(d.double(forKey: "cam.scale"))))
            offset = CGSize(width: d.double(forKey: "cam.x"), height: d.double(forKey: "cam.y"))
        } else {                                               // first launch: readable, centered
            scale = INIT_SCALE
            offset = CGSize(width: (size.width - doc.viewBox.width * scale) / 2,
                            height: (size.height - doc.viewBox.height * scale) / 2)
        }
        offset = clampedOffset(offset, doc: doc)
        lastScale = scale; lastOffset = offset
    }
    private func persist() {
        let d = UserDefaults.standard
        d.set(Double(scale), forKey: "cam.scale")
        d.set(Double(offset.width), forKey: "cam.x")
        d.set(Double(offset.height), forKey: "cam.y")
    }

    // MARK: drawing
    private func draw(_ doc: MapDoc, _ ctx: inout GraphicsContext, _ size: CGSize) {
        let t = mapToScreen()
        for line in doc.lines {
            let dim = (dimCreator != nil && line.creator != dimCreator)
            let color = Color(hex: line.color).opacity(dim ? 0.12 : 1)
            for p in line.paths {
                ctx.stroke(Path(svg: p.d).applying(t), with: .color(color),
                           style: StrokeStyle(lineWidth: p.w * scale, lineCap: .round, lineJoin: .round))
            }
        }
        for tk in doc.ticks {
            var p = Path(); p.move(to: CGPoint(x: tk.x1, y: tk.y1)); p.addLine(to: CGPoint(x: tk.x2, y: tk.y2))
            ctx.stroke(p.applying(t), with: .color(Color(hex: tk.color)), style: StrokeStyle(lineWidth: tk.w * scale, lineCap: .square))
        }
        for m in doc.markers {
            if m.dot == true {
                let r = (m.w / 2) * scale, c = CGPoint(x: m.cx, y: m.cy).applying(t)
                ctx.fill(Path(ellipseIn: CGRect(x: c.x - r, y: c.y - r, width: 2*r, height: 2*r)), with: .color(mapInk))
            } else if let pill = m.pill {
                let path = Path(svg: pill).applying(t)
                ctx.fill(path, with: .color(mapCream)); ctx.stroke(path, with: .color(mapInk), lineWidth: m.w * scale)
            } else if let r0 = m.r {
                let r = r0 * scale, c = CGPoint(x: m.cx, y: m.cy).applying(t)
                let rect = CGRect(x: c.x - r, y: c.y - r, width: 2*r, height: 2*r)
                ctx.fill(Path(ellipseIn: rect), with: .color(mapCream)); ctx.stroke(Path(ellipseIn: rect), with: .color(mapInk), lineWidth: m.w * scale)
            }
        }
        for st in doc.stations where !st.coveredMarker {
            if st.intersection {
                let c = CGPoint(x: st.x, y: st.y).applying(t)
                let len = max(2*MARKER_R, CGFloat(st.spread) + LINE_WIDTH) * scale, thick = 2*MARKER_R * scale
                let angle = atan2(st.tangent[0], -st.tangent[1])
                ctx.drawLayer { l in
                    l.translateBy(x: c.x, y: c.y); l.rotate(by: .radians(angle))
                    let rr = Path(roundedRect: CGRect(x: -len/2, y: -thick/2, width: len, height: thick), cornerRadius: thick/2)
                    l.fill(rr, with: .color(mapCream)); l.stroke(rr, with: .color(mapInk), lineWidth: 3*scale)
                }
            } else if !st.coveredTick {
                let dx = st.labelDelta[0], dy = st.labelDelta[1], n = max(0.001, (dx*dx + dy*dy).squareRoot())
                var p = Path()
                p.move(to: CGPoint(x: st.x + dx/n*2.5, y: st.y + dy/n*2.5))
                p.addLine(to: CGPoint(x: st.x + dx/n*6, y: st.y + dy/n*6))
                ctx.stroke(p.applying(t), with: .color(Color(hex: st.color)), style: StrokeStyle(lineWidth: 1*scale, lineCap: .square))
            }
        }
        for ol in doc.orphanLabels {
            let creator = ol.fill.uppercased() != "#231F20"
            for ln in ol.lines { drawMatrixLabel(&ctx, ln.text, ln.transform, t, ol.fontSize, ol.bold, Color(hex: ol.fill), upper: creator) }
        }
        for st in doc.stations { if let lbl = st.label { for ln in lbl { drawMatrixLabel(&ctx, ln.text, ln.transform, t, 7.59, false, mapInk, upper: false) } } }
        for al in doc.addedLabels { drawAddedLabel(&ctx, al, t) }
    }

    private func drawMatrixLabel(_ ctx: inout GraphicsContext, _ text: String, _ transform: String, _ t: CGAffineTransform, _ fontSize: Double, _ bold: Bool, _ color: Color, upper: Bool) {
        let m = parseMatrix(transform)
        let pos = CGPoint(x: m.tx, y: m.ty).applying(t)
        let angle = atan2(m.b, m.a)
        let txt = Text(upper ? text.uppercased() : text).font(.system(size: fontSize * scale, weight: bold ? .bold : .regular)).foregroundColor(color)
        ctx.drawLayer { l in l.translateBy(x: pos.x, y: pos.y); l.rotate(by: .radians(angle)); l.draw(txt, at: .zero, anchor: .leading) }
    }
    private func drawAddedLabel(_ ctx: inout GraphicsContext, _ al: AddedLabel, _ t: CGAffineTransform) {
        let anchor: UnitPoint = al.align == "start" ? .leading : al.align == "end" ? .trailing : .center
        for (i, line) in al.lines.enumerated() {
            let pos = CGPoint(x: al.x, y: al.y + Double(i) * al.fontSize * 1.15).applying(t)
            ctx.draw(Text(line).font(.system(size: al.fontSize * scale, weight: al.bold ? .bold : .regular)).foregroundColor(mapInk), at: pos, anchor: anchor)
        }
    }

    // MARK: interaction
    private func handleTap(_ loc: CGPoint, _ doc: MapDoc) {
        let mx = (loc.x - offset.width) / scale, my = (loc.y - offset.height) / scale
        var best: Station?; var bd = Double.infinity
        for st in doc.stations { let d = (st.x - mx)*(st.x - mx) + (st.y - my)*(st.y - my); if d < bd { bd = d; best = st } }
        let thresh = pow(16.0 / max(0.001, Double(scale)), 2)
        if let s = best, bd < max(256, thresh) { selection = .show(s) }
    }
    private func openCreator(_ name: String) {
        if let c = store.doc?.creators.first(where: { $0.name.caseInsensitiveCompare(name) == .orderedSame }) { selection = .creator(c) }
    }
    private func openShow(_ id: String) { if let s = store.doc?.stations.first(where: { $0.id == id }) { selection = .show(s) } }
    private func titleFor(_ id: String) -> String { store.doc?.stations.first(where: { $0.id == id })?.title ?? id }
}
