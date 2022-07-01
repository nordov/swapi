async function getSWData(topic = "", search = "", url = "https://swapi.dev/api/") {

    let apiEndpoint = search != "" ? topic + "/?search=" + search : topic;
    const response = await fetch(url + apiEndpoint);
    let data =  await response.json();

    let results = data.results;

    if (data.next != null) {
        return results.concat(await getSWData("", "", data.next))
    }

    return results;

}

function normalizeText(text) {

    text = text.split("_").join(" ");
    return text.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
}

function isExcluded(attr){
    let exclude = [
        "homeworld",
        "species",
        "vehicles",
        "starships",
        "created",
        "edited",
        "url",
        "films",
        "residents",
        "characters",
        "planets",
        "episode_id",
        "people",
        "pilots",
        "consumables"
    ]

    return exclude.includes(attr) ? true : false;
} 

function setHeaders(headers) {

    let tableHeader = document.querySelector(".table-header");
   
    headers.forEach( header => {

        if (!isExcluded(header)) {
            let td = document.createElement("td");
            td.classList.add(header);
            header = normalizeText(header);
            td.innerHTML = header;
            tableHeader.appendChild(td);
        }

    });
}

function setBody(results) {

    let tableBody = document.querySelector("tbody");
    const resultKeys = Object.keys(results);

    results.forEach( result => {

        let row = document.createElement('tr');

        for (const property in result ){
            
            if (!isExcluded(property)) {
                let cell = document.createElement('td');
                cell.innerHTML = result[property];
                row.appendChild(cell);
            }

        }

        tableBody.appendChild(row);
       
    });

}

function pullSWData(event) {
    const SWElement = event.target.getAttribute("data");
    const tableWrap = document.querySelector(".table-wrap");
    const loading = document.querySelector(".loading");
    const errorDisplay = document.querySelector(".error");
    errorDisplay.classList.add("d-none");

    tableWrap.classList.add("d-none");
    tableWrap.innerHTML = 
        `<table class="table table-light table-striped table-hover">
            <thead class="table-dark">
                <tr class="table-header"></tr>
            </thead>
            <tbody></tbody>
        </table> `;
    if (SWElement === "clear") return true;
    loading.classList.remove("d-none");

    getSWData(SWElement)
        .then(data => {
            loading.classList.remove("d-none");
            
            setHeaders(Object.keys(data[0]));

            setBody(data);

            loading.classList.add("d-none");
            tableWrap.classList.remove("d-none");
    });
}

function searchSWData(){

    const searchQuery = document.querySelector("input").value;
    if (searchQuery == "") return false;

    const searchQueryTopic = document.querySelector("select").value;

    const tableWrap = document.querySelector(".table-wrap");
    const loading = document.querySelector(".loading");
    const errorDisplay = document.querySelector(".error");

    tableWrap.classList.add("d-none");
    errorDisplay.classList.add("d-none");
    tableWrap.innerHTML =
        `<table class="table table-light table-striped table-hover">
            <thead class="table-dark">
                <tr class="table-header"></tr>
            </thead>
            <tbody></tbody>
        </table> `;

    loading.classList.remove("d-none");

    getSWData(searchQueryTopic, searchQuery)
        .then(data => {
            loading.classList.remove("d-none");

            setHeaders(Object.keys(data[0]));

            setBody(data);

            loading.classList.add("d-none");
            tableWrap.classList.remove("d-none");
        }).catch(error => {
            loading.classList.add("d-none");
            errorDisplay.classList.remove("d-none");
        });
   
}

document.addEventListener("DOMContentLoaded", () => {

    const navLinks = document.querySelectorAll(".nav-link");
    const searchBtn = document.querySelector(".btn");

    navLinks.forEach( navLink => {
        navLink.addEventListener("click", pullSWData);
    });

    searchBtn.addEventListener("click", searchSWData);

});