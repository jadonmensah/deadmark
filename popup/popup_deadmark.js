// Make the checked-ness of the checkbox persist

async function persistCheckbox() {
    const checkboxStorageState = await browser.runtime.sendMessage({ type: "getDeadmarkEnabled" })
    const check = document.getElementById("toggle-deadmark")
    let currentState = false

    if (checkboxStorageState) {
        currentState = checkboxStorageState
        check.checked = currentState
    }
}
persistCheckbox()


// Retrieve and display all bookmark deadlines
let allBookmarkDeadlines = browser.storage.local.get(null);

allBookmarkDeadlines.then(async (bookmarkDeadlines) => {
    let ids = Object.keys(bookmarkDeadlines);
    for (let id of ids) {
        let deadline = bookmarkDeadlines[id];
        let bookmark = await browser.bookmarks.get(id)
        displayDeadline(bookmark[0].title, bookmark[0].url, id, deadline)
    }
}, onError)

function onError(error) {
    console.log(error);

}

function displayDeadline(name, url, id, deadline) {
    console.log("display deadlne");
    let link = document.createElement("a")
    let date = document.createElement("p")
    let wrapper = document.createElement("div")
    link.setAttribute("href", url)
    link.innerText = name
    date.innerText = deadline.toString()
    wrapper.setAttribute("id", "bm-" + id)
    wrapper.appendChild(link)
    wrapper.appendChild(date)
    let popup = document.getElementById("uc")
    popup.appendChild(wrapper)
}

// set up event listener for extension enable/disable

function toggleDeadmark(event) {
    if (event.currentTarget.checked) {
        // Send a message to say that deadmark is enabled
        browser.runtime.sendMessage({ type: "setDeadmarkEnabled", value: true })
    } else {
        browser.runtime.sendMessage({ type: "setDeadmarkEnabled", value: false })
    }
}

document.getElementById("toggle-deadmark").addEventListener("change", toggleDeadmark)

// set up event listener for deadline length & persist value once set.
function setDays(event) {
    browser.runtime.sendMessage({ type: "setDays", value: parseInt(event.currentTarget.value) })
}

document.getElementById("days").addEventListener("change", setDays);

async function persistDays() {
    const days = await browser.runtime.sendMessage({ type: "getDays" })
    const daysInput = document.getElementById("days")
    daysInput.value = days
}
persistDays()