// MTMap (Overture) — native shell hosting the live v2 web experience.
// The map, all interactions, panels, data — all rendered by the website,
// so the app stays in sync with the web automatically.
import SwiftUI
import WebKit

private let HOME_URL = URL(string: "https://musicaltheatrehistory.com/v2?app=1")!
private let CREAM = Color(red: 0xFA/255.0, green: 0xF6/255.0, blue: 0xE8/255.0)

extension Notification.Name { static let reloadOverture = Notification.Name("reloadOverture") }

struct ContentView: View {
    @State private var isLoading = true
    @State private var loadError: String?

    var body: some View {
        ZStack {
            CREAM.ignoresSafeArea()
            OvertureWebView(url: HOME_URL, isLoading: $isLoading, loadError: $loadError)
                .ignoresSafeArea(.container, edges: .bottom)
            if isLoading && loadError == nil {
                ProgressView().scaleEffect(1.3).tint(.black.opacity(0.6))
            }
            if let err = loadError {
                VStack(spacing: 14) {
                    Text("Couldn't load the map").font(.headline)
                    Text(err).font(.footnote).foregroundStyle(.secondary).multilineTextAlignment(.center)
                    Button("Try again") {
                        loadError = nil; isLoading = true
                        NotificationCenter.default.post(name: .reloadOverture, object: nil)
                    }.buttonStyle(.borderedProminent)
                }
                .padding(28)
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
                .padding(40)
            }
        }
    }
}

struct OvertureWebView: UIViewRepresentable {
    let url: URL
    @Binding var isLoading: Bool
    @Binding var loadError: String?

    func makeUIView(context: Context) -> WKWebView {
        let cfg = WKWebViewConfiguration()
        cfg.allowsInlineMediaPlayback = true
        cfg.defaultWebpagePreferences.preferredContentMode = .mobile
        let wv = WKWebView(frame: .zero, configuration: cfg)
        wv.navigationDelegate = context.coordinator
        wv.scrollView.bounces = false
        wv.scrollView.contentInsetAdjustmentBehavior = .never
        wv.isOpaque = false
        wv.backgroundColor = UIColor(red: 0xFA/255.0, green: 0xF6/255.0, blue: 0xE8/255.0, alpha: 1)
        wv.scrollView.backgroundColor = wv.backgroundColor

        let rc = UIRefreshControl()
        rc.addTarget(context.coordinator, action: #selector(Coordinator.onRefresh(_:)), for: .valueChanged)
        wv.scrollView.refreshControl = rc

        context.coordinator.webView = wv
        NotificationCenter.default.addObserver(forName: .reloadOverture, object: nil, queue: .main) { _ in
            wv.load(URLRequest(url: url))
        }
        wv.load(URLRequest(url: url))
        return wv
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }

    final class Coordinator: NSObject, WKNavigationDelegate {
        let parent: OvertureWebView
        weak var webView: WKWebView?
        init(parent: OvertureWebView) { self.parent = parent }

        @objc func onRefresh(_ rc: UIRefreshControl) {
            webView?.reload()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { rc.endRefreshing() }
        }

        // Open external links (different host) in Safari instead of trapping them in the webview.
        func webView(_ webView: WKWebView, decidePolicyFor a: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if a.navigationType == .linkActivated,
               let u = a.request.url,
               (u.host ?? "") != "musicaltheatrehistory.com" {
                UIApplication.shared.open(u); decisionHandler(.cancel); return
            }
            decisionHandler(.allow)
        }
        func webView(_ webView: WKWebView, didStartProvisionalNavigation: WKNavigation!) {
            DispatchQueue.main.async { self.parent.isLoading = true; self.parent.loadError = nil }
        }
        func webView(_ webView: WKWebView, didFinish: WKNavigation!) {
            DispatchQueue.main.async { self.parent.isLoading = false }
        }
        func webView(_ webView: WKWebView, didFail: WKNavigation!, withError e: Error) {
            DispatchQueue.main.async { self.parent.isLoading = false; self.parent.loadError = e.localizedDescription }
        }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation: WKNavigation!, withError e: Error) {
            DispatchQueue.main.async { self.parent.isLoading = false; self.parent.loadError = e.localizedDescription }
        }
    }
}
