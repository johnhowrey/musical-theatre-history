import SwiftUI

// v1 detail sheets. Full content (synopsis, cast, images) lives in the web app via
// broadway-data; here we show what the map document carries + a deep link to the
// web detail. (Follow-up: bundle/fetch broadway-data for full native panels.)

struct ShowDetailView: View {
    let station: Station
    let onCreator: (String) -> Void
    let webBase = "https://musical-theatre-history.vercel.app/v2"

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(station.creators, id: \.self) { c in
                        Button { onCreator(c) } label: {
                            Label(c.capitalized, systemImage: "circle.fill")
                                .labelStyle(.titleAndIcon)
                        }
                    }
                } header: { Text("On the lines of") }

                Section {
                    Link("Open full details on the web", destination:
                        URL(string: "\(webBase)?show=\(station.id)")!)
                }
            }
            .navigationTitle(station.title)
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium, .large])
    }
}

struct CreatorDetailView: View {
    let creator: Creator
    let titleFor: (String) -> String
    let onShow: (String) -> Void

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(creator.shows, id: \.self) { id in
                        Button { onShow(id) } label: { Text(titleFor(id)) }
                    }
                } header: { Text("\(creator.shows.count) shows on this line") }
            }
            .navigationTitle(creator.name.capitalized)
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(Color(hex: creator.color), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
        }
        .presentationDetents([.medium, .large])
    }
}
