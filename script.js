const apiBaseUrl = "https://api.github.com/users";
var recentSearch = JSON.parse(localStorage.getItem("recentSearch") || "[]");

const errorMessage = (status) => {
    const messageDiv = document.querySelector(".message");
    let message = "";
    if (status === 404) message = `<div class="alert alert-danger text-enter px-5">Profile Doesn't Exist</div>`;
    messageDiv.innerHTML = message;
    setTimeout(() => messageDiv.innerHTML = "", 5000);
}

async function getGitHubProfile(login) {
    try {
        const response = await fetch(`${apiBaseUrl}/${login}`);
        if (response.status !== 200) {
            if (response.status === 404) {
                errorMessage(response.status);
            }
            new Error(`Something Went Wrong! status code ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new TypeError(error);
    }
}

async function getGitRepos(login) {
    try {
        const response = await fetch(`${apiBaseUrl}/${login}/repos`);
        if (response.status !== 200) {
            new Error(`Something Went Wrong! satatus code ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw new TypeError(error);
    }
}

const Profile = (data) => {
    let profileSnnipet = "";
    profileSnnipet += `
    <img src="${data.avatar_url}" class="img-fluid rounded">
    <div class="d-flex flex-column p-5">`;
    if (data.name !== null) profileSnnipet += `<div class="text-start fs-3">${data.name}</div>`;
    profileSnnipet += `
    <div class="text-start fs-3">${data.login}</div>
    <div class="d-flex my-3">
        <div class="d-flex justify-content-start fs-5 pe-4 flex-column border-end border-2 border-dark">
            <div class="uppercase pe-2 text-center">${data.followers}</div>
            <div class="uppercase">Followers</div>
        </div>
        <div class="d-flex justify-content-start fs-5 ps-4 flex-column">
            <div class="uppercase pe-2 text-center">${data.following}</div>
            <div class="uppercase">Following</div>
        </div>
    </div>`;
    if (data.location !== null) {
        profileSnnipet += `
        <div class="d-flex justify-content-start fs-5 py-2 align-items-center">
            <i class="fa-solid fa-earth-americas pe-2"></i>
            <div class="uppercase pe-2">${data.location}</div>
        </div>`;
    }
    if (data.bio !== null) {
        profileSnnipet += `
        <div class="d-flex justify-content-center flex-column fs-5 py-2">
            <h4>About ${data.name}</h4>
            <span>${data.bio}</span>
        </div>`;
    }
    if (data.twitter_username !== null) {
        profileSnnipet += `
        <div class="d-flex justify-content-start fs-5 align-items-center">
            <i class="fa-brands fa-twitter pe-2 text-primary"></i>
            <a target="_blank" href="https://www.twitter.com/${data.twitter_username}">@${data.twitter_username}</a>
        </div>`;
    }
    profileSnnipet += `<div/>`;
    document.querySelector("#profile").innerHTML = profileSnnipet;
}

const listRepos = (repos) => {
    let reposList = "";
    if (repos.length > 0) {
        repos.forEach(repo => {
            reposList += `
            <li class="mb-3 col">
                <div class="card p-3 d-flex align-items-center flex-column shadow">
                    <a target="_blank" href="${repo.html_url}" class="fs-3 w-100 text-truncate text-center text-decoration-none text-dark">${repo.name}</a>
                    <p class="m-0 py-3">${repo.description !== null ? repo.description : ""}</p>
                    <div class="d-flex gap-3 justify-content-start w-100 flex-wrap">`;
            if (repo.language !== null) {
                reposList += `
                <div class="d-flex align-items-center input-group input-group-sm">
                    <div class="bg-dark btn text-white"><i class="fas fa-circle"></i></div>
                    <p class="m-0 form-control text-truncate">${repo.language}</p>
                </div>`;
            }
            reposList += `
            <div class="d-flex align-items-center input-group input-group-sm">
                <div class="bg-dark btn text-white"><i class="fas fa-star"></i></div>
                <p class="m-0 form-control text-truncate">${repo.stargazers_count}</p>
            </div></div></div></li>`;
        });
    }
    document.querySelector("#repos").innerHTML = reposList;
}

const renderdata = async (search) => {
    const userProfile = await getGitHubProfile(search);
    recentSearch.push(userProfile);
    removeDuplicate();
    localStorage.setItem("recentSearch", JSON.stringify(recentSearch));
    if (userProfile.login) {
        const gitRepos = await getGitRepos(search);
        Profile(userProfile);
        listRepos(gitRepos);
        document.querySelector("#info").classList.remove("d-none");
        document.querySelector(".home").classList.add("d-none");
    }
}

function removeDuplicate() {
    let array = [];
    let object = {};
    for (let i in recentSearch) {
        if (recentSearch[i] && (!recentSearch[i].message)) {
            object[recentSearch[i]['login']] = recentSearch[i];
        }
    };
    for (i in object) {
        array.push(object[i]);
    };
    recentSearch = array;
}

const loadRecent = () => {
    if (Array.isArray(recentSearch) && recentSearch.length > 0) {
        let recentHTMl = "";
        recentHTMl += `<div class="recent my-2 px-5  d-flex justify-content-evenly flex-wrap ">`;
        recentSearch.forEach(recent => {
            if (recent) {
                recentHTMl += `
                <div class="d-flex justify-content-start card shadow-lg bg-dark m-0 mb-4" style="min-width: 220px;max-width: 220px;">
                    <img class="img-fluid bg-light bg-gradient" src="${recent.avatar_url}">
                    <button class="p-3 fs-5 btn text-white text-bold text-truncate text-center text-capitalize" href="">${recent.login}</button>
                </div>`;
            }
        });
        recentHTMl += `</div>`;
        document.querySelector(".home").innerHTML += recentHTMl;
        document.querySelectorAll(".recent button").forEach(btn => {
            btn.onclick = (event) => {
                renderdata(event.target.innerText);
            }
        })
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector("#search-form");
    const searchInput = searchForm.querySelector(".searchInput");

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const search = searchInput.value;
        renderdata(search);
    });
    loadRecent();
});