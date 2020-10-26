const LOCAL_STORAGE_USER = "LOCAL_STORAGE_USER";
const LOCAL_STORAGE_USER_DATA = "LOCAL_STORAGE_USER_DATA";
const LOCAL_STORAGE_THEME = "LOCAL_STORAGE_THEME";
const LOCAL_STORAGE_FILTER = "LOCAL_STORAGE_FILTER";

const SPECIAL_CHARATER = "@";

let Ashish_Data = Ashish_Offline_Data;
let User = null;
let User_Data = {};
let filter = {};

// Asyncronus functions

async function getAshishData() {
  const response = await fetch("https://codeforces.com/api/user.status?handle=ashishgup");
  if (response.ok) {
    const data = await response.json();
    let actual_data = [];
    let obj_map = {};
    if (data && data.status === "OK") {
      data.result.forEach((item) => {
        if (!obj_map[item.contestId]) obj_map[item.contestId] = [];
        if (item.verdict === "OK" && item.problem.rating && obj_map[item.contestId].indexOf(item.problem.index) === -1) {
          let obj = {};
          obj.name = item.problem.name;
          obj.questionUrl = `https://codeforces.com/contest/${item.contestId}/problem/${item.problem.index}`;
          obj.solutionUrl = `https://codeforces.com/contest/${item.contestId}/submission/${item.id}`;
          obj.rating = item.problem.rating;
          obj.index = item.problem.index;
          obj.tags = item.problem.tags;
          obj.contestId = item.contestId;
          obj.date = new Date(item.creationTimeSeconds * 1000);
          actual_data.push(obj);
          obj_map[item.contestId].push(item.problem.index);
        }
      });
      actual_data.sort((obj1, obj2) => obj1.rating - obj2.rating);
      return actual_data;
    }
    return Ashish_Offline_Data;
  }
  return Ashish_Offline_Data;
}

async function getUserData(username) {
  const userData = {};
  const response = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
  if (response.ok) {
    const data = await response.json();
    if (data && data.status === "OK") {
      console.log(data.result);
      data.result.forEach((item) => {
        if (!userData[item.contestId]) userData[item.contestId] = {};
        if (item.verdict === "OK" && item.problem && item.problem.rating && !userData[item.contestId][item.problem.index]) {
          userData[item.contestId][item.problem.index] = `https://codeforces.com/contest/${item.contestId}/submission/${item.id}`;
        }
      });
      return userData;
    }
    return User_Data;
  }
  return User_Data;
}

// Rendering functions
function renderCategories() {
  let html = "<option value=''> All </option>";
  CF_Categories.forEach((item) => {
    html += `<option value=${item.replace(" ", SPECIAL_CHARATER)}>${item}</option>`;
  });
  $("select[name='category']").html(html);
}

function renderUserBar(user_solved, total_questions) {
  $("#solved-questions").html(user_solved);
  $("#total-questions").html(total_questions);
}

function renderTable() {
  const minRating = Number($("input[name=min-rating]").val());
  const maxRating = Number($("input[name=max-rating]").val());
  const category = $("select[name=category").val().replace(SPECIAL_CHARATER, " ");

  let table = "<div class='row'>";
  let user_solved = 0,
    total_questions = 0;
  Ashish_Data.forEach((item) => {
    if ((!category || item.tags.indexOf(category) !== -1) && item.rating >= minRating && item.rating <= maxRating) {
      let solved = User_Data && User_Data[item.contestId] && User_Data[item.contestId][item.index];
      let coloum = `
        <div class='col-md-4 px-2 py-3 mx-0 my-0'>
            <ul class="list-group ${solved && "solved"}">
                <li class="list-group-item active py-1"><b>${total_questions + 1}. ${item.index} </b> ${item.name}</li>
                <li class="list-group-item py-1"><b>Question : </b> <a target="_blank" href=${item.questionUrl}> ${item.name} </a>  </li>
                <li class="list-group-item py-1"><b>Solution : </b> <a target="_blank" href=${item.solutionUrl}> Ashish Solution ${
        solved ? `, <a target="_blank" href=${solved}> Your Solution </a>` : ""
      }</a></li>
                <li class="list-group-item py-1"><b>Rating : </b> ${item.rating} </li>
                <li class="list-group-item py-1"><b>Tags : </b> ${item.tags.join(", ")}</li>
            </ul>
        </div>`;
      table += coloum;
      total_questions++;
      if (solved) user_solved++;
    }
  });
  table += "</div>";

  renderUserBar(user_solved, total_questions);
  $("#questions-table").html(table);
}

function renderTheme(theme) {
  const themes = ["light-theme", "dark-theme"];
  $("body").removeClass(themes);
  $("body").addClass(theme);
}

// Other functions
function changeTheme() {
  renderTheme($("select[name=theme]").val());
  localStorage.setItem(LOCAL_STORAGE_THEME, $("select[name=theme]").val());
}

function changeFilter(element) {
  filter[element.name] = element.value;
  renderTable();
  localStorage.setItem(LOCAL_STORAGE_FILTER, JSON.stringify(filter));
}

async function logIn() {
  if (!User) {
    $("#login-button").disabled = true;
    $("input[name=user]").prop("disabled", true);
    $("#login-button").html("Logout");
    User = $("input[name=user]").val();
    User_Data = await getUserData(User);
    renderTable();
    localStorage.setItem(LOCAL_STORAGE_USER, User);
    localStorage.setItem(LOCAL_STORAGE_USER_DATA, JSON.stringify(User_Data));
    $("#login-button").disabled = false;
  } else {
    $("#login-button").html("LogIn");
    $("input[name=user]").prop("disabled", false);
    $("input[name=user]").val("");
    User = null;
    User_Data = {};
    localStorage.removeItem(LOCAL_STORAGE_USER);
    localStorage.removeItem(LOCAL_STORAGE_USER_DATA);
    renderTable();
  }
}

function refreshUser() {
  if (User) {
    User = null;
    logIn();
  }
}

function localUser() {
  if (localStorage.getItem(LOCAL_STORAGE_USER)) {
    User_Data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USER_DATA));
    $("input[name=user]").val(localStorage.getItem(LOCAL_STORAGE_USER));
    logIn();
    renderTable();
  }
}

function localFilter() {
  filter = JSON.parse(localStorage.getItem(LOCAL_STORAGE_FILTER)) || {};
  if (filter["min-rating"]) $("input[name=min-rating]").val(filter["min-rating"]);
  if (filter["max-rating"]) $("input[name=max-rating]").val(filter["max-rating"]);
  if (filter["category"]) $("select[name=category").val(filter["category"]);
}

function localTheme() {
  const theme = localStorage.getItem(LOCAL_STORAGE_THEME) || "light-theme";
  $("select[name=theme]").val(theme);
  renderTheme(theme);
}

async function initial() {
  localTheme();
  renderCategories();
  localUser();
  localFilter();
  renderTable();
  Ashish_Data = await getAshishData();
}

initial();
