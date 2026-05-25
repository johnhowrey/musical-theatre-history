import SwiftUI

// Loads the shared map document: tries the deployed URL first (so content updates
// ship without an App Store release), falls back to the bundled copy.
@MainActor
final class MapStore: ObservableObject {
    @Published var doc: MapDoc?
    @Published var error: String?

    // TODO: set to your deployed site, e.g. "https://<your-site>/map-document.json"
    static let remoteURL = URL(string: "https://musical-theatre-history.vercel.app/map-document.json")

    func load() async {
        if let url = Self.remoteURL,
           let (data, resp) = try? await URLSession.shared.data(from: url),
           (resp as? HTTPURLResponse)?.statusCode == 200,
           let parsed = try? JSONDecoder().decode(MapDoc.self, from: data) {
            doc = parsed; return
        }
        // Fallback: bundled copy.
        if let url = Bundle.main.url(forResource: "map-document", withExtension: "json"),
           let data = try? Data(contentsOf: url),
           let parsed = try? JSONDecoder().decode(MapDoc.self, from: data) {
            doc = parsed; return
        }
        error = "Could not load map document."
    }
}

extension Color {
    init(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespaces)
        if s.hasPrefix("#") { s.removeFirst() }
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        let r, g, b: Double
        if s.count == 6 {
            r = Double((v >> 16) & 0xFF) / 255
            g = Double((v >> 8) & 0xFF) / 255
            b = Double(v & 0xFF) / 255
        } else { r = 0.14; g = 0.12; b = 0.13 }
        self.init(red: r, green: g, blue: b)
    }
}

let mapInk = Color(hex: "#231F20")
let mapCream = Color(hex: "#FAF6E8")
