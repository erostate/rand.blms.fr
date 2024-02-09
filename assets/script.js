/*
    GLOBAL JS for project RAND.BLMS.FR

    Made by: Erostate
    Date: 2024-02-09
    Version: 1.0.0
    URI: https://rand.blms.fr

    License: BLMS
    License URI: https://blms.fr/license
*/

// Add a new input field for a name
function addRowName() {
    // Get the list of names & count the number of names
    var list = document.getElementById('nameList');
    var totalCountName = list.getElementsByTagName('input').length;

    // Define the new name number
    var newNameNumber = totalCountName + 1;

    // Create a new input field
    var newLine = document.createElement('span');
    newLine.className = 'list-name-wrapper';
    newLine.id = 'name' + newNameNumber + '_container';
    newLine.innerHTML = '<input type="text" id="name' + newNameNumber + '" placeholder="Name ' + newNameNumber + '"><i class="fa-solid fa-xmark" onclick="removeRowName(' + newNameNumber + ')"></i>';

    // Append the new input field
    list.insertBefore(newLine, document.getElementById('addName'));

    // Focus on the new input field
    document.getElementById('name' + newNameNumber).focus();
}

// Remove an input field for a name
function removeRowName(nameNumber) {
    // Get the list of names & count the number of names
    var list = document.getElementById('nameList');
    var totalCountName = list.getElementsByTagName('input').length;

    // Check if the name number is the last in list
    if (nameNumber < totalCountName) {
        // Rename the input fields
        for (var i = nameNumber + 1; i <= totalCountName; i++) {
            var newVal = i - 1;
        
            // Mettre à jour le placeholder de l'élément
            document.getElementById('name' + i).placeholder = 'Name ' + newVal;
            
            // Mettre à jour l'ID de l'élément
            document.getElementById('name' + i).id = 'name' + newVal;

            // Mettre à jour le onclick du bouton de suppression
            document.getElementById('name' + i + '_container').getElementsByTagName('i')[0].setAttribute('onclick', 'removeRowName(' + newVal + ')');
        
            // Mettre à jour l'ID du conteneur
            document.getElementById('name' + i + '_container').id = 'name' + newVal + '_container';
        }        
    }

    // Remove the input field
    var lineToRemove = document.getElementById('name' + nameNumber + '_container');
    list.removeChild(lineToRemove);
}

// Generate the team randomly
function generateTeam() {
    generateErrorModal('deactive');

    openModal('modalGenerationTeam');

    // Get the list of names
    var list = document.getElementById('nameList');
    var names = list.getElementsByTagName('input');
    var totalCountName = names.length;

    // Get the number of teams
    var teamNumber = document.getElementById('numberOfTeam').value;

    // Check if there are enough non-empty inputs, otherwise display an error message
    var countEmptyCells = 0;
    var listNames = [];
    for (cell of names) {
        console.log(cell.value);
        if (cell.value == '') {
            countEmptyCells++
        } else {
            listNames.push(cell.value);
        }
    }
    if (countEmptyCells > teamNumber) {
        generateErrorModal('active');
        return;
    }

    // Mix the list of names
    let shuffledList = [...listNames];
    for (let i = shuffledList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
    }

    // Create the teams
    var teamList = [];
    for (var i = 0; i < teamNumber; i++) {
        teamList.push(shuffledList.splice(0, Math.ceil(shuffledList.length / (teamNumber - i))));
    }

    // Display the teams
    const teamListContainer = document.getElementById('teamList');
    teamListContainer.innerHTML = '';
    for (team of teamList) {
        const teamContainer = document.createElement('div');
        teamContainer.className = 'team';
        teamContainer.id = 'team' + (teamList.indexOf(team) + 1);
        teamContainer.innerHTML = '<h3>Team ' + (teamList.indexOf(team) + 1) + '</h3><hr>';
        const teamMembers = document.createElement('ul');
        teamMembers.id = 'team' + (teamList.indexOf(team) + 1) + 'List';
        for (member of team) {
            teamMembers.innerHTML += '<li>' + member + '</li>';
        }
        teamContainer.appendChild(teamMembers);
        teamListContainer.appendChild(teamContainer);
    }

    // Save the team list in a cookie
    const jsonData = {
        "id": generateRandomId(),
        "nbTeam": teamNumber,
        "nbName": totalCountName,
        "date": getCurrentDate(),
        "history": teamList.map((team, index) => ({
            "name": "Team " + (index + 1),
            "members": team.map(member => ({ "name": member }))
        }))
    };

    const jsonString = JSON.stringify(jsonData);

    // Set the cookie
    document.cookie = `teamData=${encodeURIComponent(jsonString)}; expires=${new Date(2025, 0, 1).toUTCString()}; path=/`;
}

function generateRandomId() {
    return Math.random().toString(36).substr(2, 10);
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


function getTeamDataFromCookie() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('teamData='))
        ?.split('=')[1];

    if (cookieValue) {
        return JSON.parse(decodeURIComponent(cookieValue));
    }

    return null;
}
function getTeamDataById(id) {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('teamData='))
        ?.split('=')[1];

    if (cookieValue) {
        const allTeamData = Array.isArray(JSON.parse(decodeURIComponent(cookieValue))) ? JSON.parse(decodeURIComponent(cookieValue)) : [];
        const teamData = allTeamData.find(data => data.id === id);

        return teamData || null;
    }

    return null;
}

function displayHistory() {
    const historySection = document.getElementById('historyGeneration');
    const teamData = getTeamDataFromCookie();

    if (teamData) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'preview';
        previewDiv.onclick = function() {
            openHistory(teamData.id);
        };

        const teamsParagraph = document.createElement('p');
        teamsParagraph.innerHTML = `<b>${teamData.nbTeam}</b> teams`;

        const peopleParagraph = document.createElement('p');
        peopleParagraph.innerHTML = `<b>${teamData.nbName}</b> people`;

        const dateParagraph = document.createElement('p');
        dateParagraph.innerHTML = `<b>${teamData.date}</b>`;

        previewDiv.appendChild(teamsParagraph);
        previewDiv.appendChild(peopleParagraph);
        previewDiv.appendChild(dateParagraph);

        historySection.appendChild(previewDiv);
    }
}

function openHistory(id) {
    // Récupérer les données du cookie correspondant à l'ID
    const teamData = getTeamDataById(id);

    if (teamData) {
        // Ouvrir la modal "modalHistory"
        openModal('modalHistory');

        // Remplir les informations dans la modal
        const teamListContainer = document.getElementById('teamListHistory');
        teamListContainer.innerHTML = '';

        for (const team of teamData.history) {
            const teamContainer = document.createElement('div');
            teamContainer.className = 'team';
            teamContainer.id = `team${teamData.history.indexOf(team) + 1}`;
            teamContainer.innerHTML = `<h3>Team ${teamData.history.indexOf(team) + 1}</h3><hr>`;
            
            const teamMembers = document.createElement('ul');
            teamMembers.id = `team${teamData.history.indexOf(team) + 1}List`;

            for (const member of team.members) {
                teamMembers.innerHTML += `<li>${member.name}</li>`;
            }

            teamContainer.appendChild(teamMembers);
            teamListContainer.appendChild(teamContainer);
        }
    }
}

displayHistory();


function deleteCookie() {
    document.cookie = 'teamData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    location.reload();
}


// --- MODAL --- //

function generateErrorModal(status) {
    console.log(status);
    if (status == 'active') {
        document.getElementById('teamList').style.display = 'none';
        document.getElementById('modalError').style.display = 'block';
        document.getElementById('modalError').innerHTML = 'Too many teams for the number of names... Please add some member';
    } else {
        document.getElementById('teamList').style.display = 'flex';
        document.getElementById('modalError').style.display = 'none';
        document.getElementById('modalError').innerHTML = '';
    }
}

// Open the modal
function openModal(modalName) {
    document.getElementById(modalName).style.display = 'block';
}
// Close the modal
function closeModal(modalName) {
    document.getElementById(modalName).style.display = 'none';
}
// Close the modal when clicking outside
window.onclick = function(event) {
    if (event.target.className == 'modal') {
        event.target.style.display = 'none';
    }
}
