console.log("deadmark")
let enabled = false // we probably want to stick this in local storage, cant be bothered rn
let days = 7 // ditto
browser.bookmarks.onCreated.addListener(createBookmarkDeadline)
browser.bookmarks.onRemoved.addListener(removeBookmarkDeadline)
browser.alarms.onAlarm.addListener(deleteBookmark)
browser.runtime.onMessage.addListener(message => {
    if (message.type === "setDeadmarkEnabled") enabled = message.value;
});
browser.runtime.onMessage.addListener(message => {
    if (message.type === "getDeadmarkEnabled") return Promise.resolve(enabled);
});
browser.runtime.onMessage.addListener(message => {
    if (message.type === "setDays") days = message.value;
})
browser.runtime.onMessage.addListener(message => {
    if (message.type === "getDays") return Promise.resolve(days);
})
function onError(error) {
    console.log(error);
}

// persist alarms from local storage (because firefox is annoying)
let savedAlarms = browser.storage.local.get(null)

savedAlarms.then((bookmarkDeadlines) => {
    let ids = Object.keys(bookmarkDeadlines)
    for (let id of ids) {
        if (!alarms.get(id)) {
            createBookmarkDeadline(id, null, bookmarkDeadlines[id])
        }
    }
}, onError)


function createBookmarkDeadline(id, bookmarkInfo, deadline = null) {
    // Check that deadmark is enabled in popup
    if (!enabled) {
        return
    }
    if (deadline === null) {
        deadline = new Date(Date.now() + (86400000 * days)) // 86400000 = number of ms in one day
                                                            // useful values for testing
                                                                // one week: 604800000
                                                                // 10s: 10000
    }
    browser.storage.local.set({ [id]: deadline });

    let alarmInfo = browser.alarms.create(id, { "when": deadline.getTime() })
    console.log(alarmInfo)

}

function removeBookmarkDeadline(id) {
    console.log("remove");
    browser.storage.local.remove([id]);
}

function deleteBookmark(alarmInfo) {
    let id = alarmInfo.name
    removeBookmarkDeadline(id)
    browser.bookmarks.remove(id)
}

